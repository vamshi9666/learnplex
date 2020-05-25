import React, { useContext, useEffect, useState } from 'react'
import { Button, Col, Row, Tooltip, Typography } from 'antd'
import { useRouter } from 'next/router'
import NProgress from 'nprogress'

import { CONTENT_WITHOUT_SIDEBAR_COL_LAYOUT } from '../../../constants'
import SectionItemsV2 from './SectionItems'
import { UserContext } from '../../../lib/contexts/UserContext'
import { checkIfEnrolledQuery, startProgress } from '../../../utils/progress'
import { Resource, Section } from '../../../graphql/types'

interface Props {
  resource: Resource
  sectionsMap: Record<string, Section>
}

export default function ResourceIndexV2({ resource, sectionsMap }: Props) {
  const router = useRouter()
  const { user } = useContext(UserContext)

  /**
   * Temporary fix, after figuring out why cookies are not being sent in /api,
   * remove the following useEffect, and get enrolled status directly from /api
   **/
  const [enrolled, setEnrolled] = useState(false)
  useEffect(() => {
    if (resource.id) {
      checkIfEnrolledQuery({
        resourceId: resource.id,
      }).then((enrolledResult) => {
        if (enrolledResult.error) {
          console.log({ enrolledResultError: enrolledResult.message })
          setEnrolled(false)
        } else {
          setEnrolled(enrolledResult)
        }
      })
    }
  }, [resource.id])

  // const enrolled = data.enrolled
  const ownerUsername = resource.user.username
  const baseSectionId = resource.baseSectionId
  const baseSection = sectionsMap[baseSectionId]
  const isLoggedIn = !!user

  const startLearning = async () => {
    NProgress.start()
    const result = await startProgress({
      resourceId: resource.id,
    })
    console.log({ result })
    await router.push(`${router.asPath}${result.resource.firstPageSlugsPath}`)
    NProgress.done()
  }

  return (
    <>
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
            resourceSlug={resource.slug}
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
