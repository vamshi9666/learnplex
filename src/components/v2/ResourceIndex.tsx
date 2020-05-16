import React, { useContext } from 'react'
import { Button, Col, Row, Skeleton, Tooltip, Typography } from 'antd'
import { useRouter } from 'next/router'
import useSWR from 'swr'

import { CONTENT_WITHOUT_SIDEBAR_COL_LAYOUT } from '../../constants'
import SectionItemsV2 from './SectionItems'
import { SEO } from '../SEO'
import { UserContext } from '../../lib/contexts/UserContext'
import { fetcher } from '../../utils/fetcher'
import InternalServerError from '../result/InternalServerError'

interface Props {
  username?: string
  resourceSlug: string
}

export default function ResourceIndexV2({
  username = '',
  resourceSlug,
}: Props) {
  const router = useRouter()
  const url = !!username
    ? `/api/resource?username=${username}&resourceSlug=${resourceSlug}`
    : `/api/resource?resourceSlug=${resourceSlug}`
  console.log({ url })
  const { data, error } = useSWR(url, fetcher)
  const { user } = useContext(UserContext)
  if (error) {
    return <InternalServerError message={error.message} />
  }
  if (!data) {
    return <Skeleton active={true} />
  }

  const resource = data.resource
  const sectionsMap = data.sectionsMap
  const enrolled = data.enrolled
  const ownerUsername = resource.user.username
  const baseSectionId = resource.baseSectionId
  const description = resource.description as string
  const title = resource.title
  const baseSection = sectionsMap[baseSectionId]
  const isLoggedIn = !!user
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
                <Button type={'primary'} onClick={() => {}}>
                  Start Learning
                </Button>
              </Tooltip>
            ) : (
              <Tooltip title={'You can track your progress in your profile'}>
                <Button type={'primary'}>Continue Learning</Button>
              </Tooltip>
            )}
          </div>
        </Col>
      </Row>
    </>
  )
}
