import React, { useContext, useEffect, useState } from 'react'
import { Button, Col, Row, Skeleton, Tooltip, Typography } from 'antd'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import NProgress from 'nprogress'

import { CONTENT_WITHOUT_SIDEBAR_COL_LAYOUT } from '../../constants'
import SectionItemsV2 from './SectionItems'
import { SEO } from '../SEO'
import { UserContext } from '../../lib/contexts/UserContext'
import { fetcher } from '../../utils/fetcher'
import InternalServerError from '../result/InternalServerError'
import { checkIfEnrolledQuery, startProgress } from '../../utils/progress'

interface Props {
  resourceSlug: string
}

export default function ResourceIndexV2({ resourceSlug }: Props) {
  const router = useRouter()
  const url = `/api/resource?resourceSlug=${resourceSlug}`
  const { data, error } = useSWR(url, fetcher)
  const { user } = useContext(UserContext)

  /**
   * Temporary fix, after figuring out why cookies are not being sent in /api,
   * remove the following useEffect, and get enrolled status directly from /api
   **/
  const [enrolled, setEnrolled] = useState(false)
  useEffect(() => {
    if (data?.resource?.id) {
      checkIfEnrolledQuery({
        resourceId: data.resource.id,
      }).then((enrolledResult) => {
        if (enrolledResult.error) {
          console.log({ enrolledResultError: enrolledResult.message })
          setEnrolled(false)
        } else {
          setEnrolled(enrolledResult)
        }
      })
    }
    // eslint-disable-next-line
  }, [data?.resource?.id])

  if (error) {
    return <InternalServerError message={error.message} />
  }
  if (!data) {
    return <Skeleton active={true} />
  }

  const resource = data.resource
  const sectionsMap = data.sectionsMap
  // const enrolled = data.enrolled
  const ownerUsername = resource.user.username
  const baseSectionId = resource.baseSectionId
  const description = resource.description as string
  const title = resource.title
  const baseSection = sectionsMap[baseSectionId]
  const isLoggedIn = !!user

  const startLearning = async () => {
    console.log({ resource })
    if (resource?.id) {
      console.log('here')
      NProgress.start()
      const result = await startProgress({
        resourceId: resource.id,
      })
      console.log({ result })
      console.log(`${router.asPath}${result.resource.firstPageSlugsPath}`)
      await router.push(`${router.asPath}${result.resource.firstPageSlugsPath}`)
      NProgress.done()
    }
  }

  return (
    <>
      <SEO title={title} description={description} />
      <Row>
        <Col {...CONTENT_WITHOUT_SIDEBAR_COL_LAYOUT}>
          <Typography className={'pb-1 pt-2 pl-5'}>
            <Typography.Title level={2}>{resource.title}</Typography.Title>
            <Typography.Paragraph ellipsis={{ rows: 3, expandable: true }}>
              {resource.description}
            </Typography.Paragraph>
          </Typography>

          <SectionItemsV2
            sections={baseSection.sections}
            sectionsMap={sectionsMap}
            topLevel={true}
            username={ownerUsername}
            resourceSlug={resourceSlug}
          />

          <div className={'p-5'}>
            {!isLoggedIn ? (
              <Tooltip
                title={'Login to start learning and track your progress'}
              >
                <Button
                  type={'primary'}
                  onClick={() => router.push('/register')}
                >
                  Start Learning
                </Button>
              </Tooltip>
            ) : !enrolled ? (
              <Tooltip title={'You can track your progress in your profile'}>
                <Button type={'primary'} onClick={() => startLearning()}>
                  Start Learning
                </Button>
              </Tooltip>
            ) : (
              <Tooltip title={'You can track your progress in your profile'}>
                <Button type={'primary'} onClick={() => startLearning()}>
                  Continue Learning
                </Button>
              </Tooltip>
            )}
          </div>
        </Col>
      </Row>
    </>
  )
}
