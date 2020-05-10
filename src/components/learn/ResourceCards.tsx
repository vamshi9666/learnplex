import {
  Card,
  Col,
  Empty,
  Row,
  Space,
  Tag,
  Typography,
  Button,
  Tooltip,
  Skeleton,
} from 'antd'
import React from 'react'
import { useRouter } from 'next/router'
import { useMutation, useQuery } from 'urql'
import NProgress from 'nprogress'
import { TagOutlined, UserOutlined } from '@ant-design/icons'

import { Progress, Resource } from '../../graphql/types'
import { useUser } from '../../lib/hooks/useUser'

export default function ResourceCards({
  resources,
  showEmpty = true,
  description = 'No resources matched with your query',
  actionsIfEmpty,
}: {
  resources: Resource[]
  showEmpty?: boolean
  description?: string
  actionsIfEmpty?: any
}) {
  const router = useRouter()

  const goToTopic = async ({ e, slug }: { e: any; slug: string }) => {
    e.preventDefault()
    e.stopPropagation()
    await router.push(`/topics/${slug}`)
  }

  const goToUserResources = async ({
    e,
    username,
  }: {
    e: any
    username: string
  }) => {
    e.preventDefault()
    e.stopPropagation()
    await router.push(`/${username}/resources`)
  }

  const { user } = useUser()
  const isLoggedIn = !!user

  const USER_PROGRESS_LIST_QUERY = `
    query {
      userProgressList {
        resource {
          id
        }
      }
    }
  `

  const START_PROGRESS_MUTATION = `
    mutation($resourceId: String!) {
      startProgress(resourceId: $resourceId) {
        id
        resource {
          slug
          user {
            username
          }
          firstPageSlugsPath
        }
      }
    }
  `

  const [, startProgressMutation] = useMutation(START_PROGRESS_MUTATION)

  const [{ data, fetching, error }] = useQuery({
    query: USER_PROGRESS_LIST_QUERY,
  })

  if (fetching) {
    return <Skeleton active={true} />
  }

  let resourceIds: string[] = []

  if (!fetching && !error) {
    resourceIds = data.userProgressList.map(
      (progress: Progress) => progress.resource.id
    )
  }

  const goToResource = async ({ resource }: { resource: Resource }) => {
    await router.push(
      `/${resource.user.username}/learn/${resource.slug}/${resource.firstPageSlugsPath}`
    )
  }

  const startProgress = ({ resourceId }: { resourceId: string }) => {
    NProgress.start()
    startProgressMutation({ resourceId }).then(async (result) => {
      if (result.error) {
        console.log({ startProgressError: result.error })
      } else {
        console.log({ result })
        await goToResource({ resource: result.data.startProgress.resource })
      }
    })
    NProgress.done()
  }

  const hasStartedLearning = ({ resourceId }: { resourceId: string }) =>
    resourceIds.includes(resourceId)

  const TRUNCATED_LENGTH = 15
  const truncate = (str: string) =>
    str.length > TRUNCATED_LENGTH
      ? str.substr(0, TRUNCATED_LENGTH - 1) + '...'
      : str

  const TruncatedTag = ({
    children,
    value,
  }: {
    children: any
    value: string
  }) =>
    value.length > TRUNCATED_LENGTH ? (
      <Tooltip title={value}>{children}</Tooltip>
    ) : (
      children
    )

  const getActions = ({ resource }: { resource: Resource }) => {
    const actions = []
    if (!hasStartedLearning({ resourceId: resource.id })) {
      actions.push(
        <Button onClick={() => goToResource({ resource })}>
          View Resource
        </Button>
      )
    }
    if (isLoggedIn) {
      actions.push(
        <Tooltip title={'You can track your progress in your profile'}>
          {hasStartedLearning({ resourceId: resource.id }) ? (
            <Button
              type={'primary'}
              disabled={!isLoggedIn}
              onClick={() => goToResource({ resource })}
            >
              Resume Learning
            </Button>
          ) : (
            <Button
              type={'primary'}
              disabled={!isLoggedIn}
              onClick={() => startProgress({ resourceId: resource.id })}
            >
              Start Learning
            </Button>
          )}
        </Tooltip>
      )
    } else {
      actions.push(
        <Tooltip title={'Login to start learning and track your progress'}>
          <Button type={'primary'} disabled={!isLoggedIn}>
            Start Learning
          </Button>
        </Tooltip>
      )
    }
    return actions
  }

  return (
    <>
      <Row gutter={[16, 16]}>
        {resources.map((resource) => (
          <Col key={resource.id} xs={24} sm={8} md={6}>
            <Card
              className={'cursor-initial'}
              key={resource.id}
              hoverable
              actions={getActions({ resource })}
            >
              <Card.Meta
                title={`${resource.title}`}
                description={
                  <Typography.Paragraph
                    ellipsis={{
                      rows: 3,
                    }}
                  >
                    {resource.description}
                  </Typography.Paragraph>
                }
                // className={'overflow-scroll'}
                style={{
                  height: '100px',
                }}
              />
              <br />
              <Space style={{ overflowWrap: 'normal' }}>
                <TruncatedTag value={resource.user.username}>
                  <Tag
                    className={'cursor-pointer'}
                    color={'blue'}
                    icon={<UserOutlined />}
                    onClick={(e) =>
                      goToUserResources({ e, username: resource.user.username })
                    }
                  >
                    {truncate(resource.user.username)}
                  </Tag>
                </TruncatedTag>
                <TruncatedTag value={resource.topic.slug}>
                  <Tag
                    className={'cursor-pointer'}
                    onClick={(e) => goToTopic({ e, slug: resource.topic.slug })}
                    color={'magenta'}
                    icon={<TagOutlined />}
                  >
                    {truncate(resource.topic.slug)}
                  </Tag>
                </TruncatedTag>
              </Space>
            </Card>
          </Col>
        ))}
        {showEmpty && resources.length === 0 && (
          <Col offset={8} md={8} className={'text-center'}>
            <Empty description={description} />
            <br />
            {actionsIfEmpty}
          </Col>
        )}
      </Row>
    </>
  )
}
