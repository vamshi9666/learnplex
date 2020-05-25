import {
  Card,
  Col,
  Row,
  Space,
  Tag,
  Typography,
  Button,
  Tooltip,
  Skeleton,
  Empty,
  message,
} from 'antd'
import React, { useContext } from 'react'
import { useRouter } from 'next/router'
import { useMutation, useQuery } from 'urql'
import NProgress from 'nprogress'
import { TagOutlined, UserOutlined } from '@ant-design/icons'

import { Progress, Resource } from '../../graphql/types'
import { UserContext } from '../../lib/contexts/UserContext'
import {
  togglePrimaryStatus,
  togglePublishStatus,
} from '../../utils/togglePublishStatus'

export default function ResourceCards({
  resources,
}: {
  resources: Resource[]
}) {
  const router = useRouter()
  resources = resources.sort((a, b) => (a.createdDate < b.createdDate ? -1 : 1))

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

  const { user } = useContext(UserContext)
  const isLoggedIn = !!user
  const isAdminPage = router.asPath === '/___admin'

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
    await router.push(`/learn/${resource.slug}`)
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

  const goToRegisterPage = (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    router.push('/register')
  }

  const togglePublish = async ({
    resourceId,
    e,
  }: {
    resourceId: string
    e: any
  }) => {
    e.preventDefault()
    e.stopPropagation()
    const result = await togglePublishStatus({ resourceId })
    if (result.error) {
      message.error(result.message)
    } else {
      message.success('Status updated successfully.')
      router.reload()
    }
  }

  const togglePrimary = async ({
    resourceId,
    e,
  }: {
    resourceId: string
    e: any
  }) => {
    e.preventDefault()
    e.stopPropagation()
    const result = await togglePrimaryStatus({ resourceId })
    if (result.error) {
      message.error(result.message)
    } else {
      message.success('Status updated successfully.')
      router.reload()
    }
  }

  const adminActions = ({ resource }: { resource: Resource }) => {
    const adminActions = []
    if (resource.verified) {
      adminActions.push(<Button>Toggle Primary</Button>)
    }
    return [
      <Button
        type={resource.published ? 'default' : 'primary'}
        danger={resource.published}
        onClick={(e) => togglePublish({ resourceId: resource.id, e })}
      >
        {resource.published ? 'Unpublish' : 'Publish'}
      </Button>,
      <Button
        type={resource.verified ? 'default' : 'primary'}
        danger={resource.verified}
        onClick={(e) => togglePrimary({ resourceId: resource.id, e })}
      >
        {resource.verified ? 'Remove as Primary' : 'Make Primary'}
      </Button>,
    ]
  }

  const getActions = ({ resource }: { resource: Resource }) => {
    if (isAdminPage) {
      return adminActions({ resource })
    }
    const actions = []
    if (router.asPath === '/resources/me') {
      actions.push(
        <Button
          type={resource.published ? 'default' : 'primary'}
          danger={resource.published}
          onClick={(e) => togglePublish({ resourceId: resource.id, e })}
        >
          {resource.published ? 'Unpublish' : 'Publish'}
        </Button>
      )
    }
    console.log({ isLoggedIn })
    if (isLoggedIn) {
      actions.push(
        <Tooltip title={'You can track your progress in your profile'}>
          {hasStartedLearning({ resourceId: resource.id }) ? (
            <Button
              type={'primary'}
              block={true}
              disabled={!isLoggedIn}
              onClick={() => goToResource({ resource })}
              style={{ width: '70%' }}
            >
              Continue Learning
            </Button>
          ) : (
            <Button
              type={'primary'}
              block={true}
              onClick={() => startProgress({ resourceId: resource.id })}
              style={{ width: '70%' }}
            >
              Start Learning
            </Button>
          )}
        </Tooltip>
      )
    } else {
      actions.push(
        <Tooltip title={'Login to start learning and track your progress'}>
          <Button
            type={'primary'}
            onClick={(e) => goToRegisterPage(e)}
            style={{ width: '70%' }}
          >
            Start Learning
          </Button>
        </Tooltip>
      )
    }
    return actions
  }

  const ResourceGrid = ({ resources }: { resources: Resource[] }) => {
    return (
      <Row gutter={[16, 16]}>
        {resources.map((resource) => (
          <Col key={resource.id} xs={24} sm={8} md={6}>
            <Card
              key={resource.id}
              hoverable
              actions={getActions({ resource })}
              onClick={() => goToResource({ resource })}
            >
              <Card.Meta
                title={
                  <Tooltip title={resource.title}>
                    <Typography>
                      <Typography.Title level={4} ellipsis={true}>
                        {resource.title}
                      </Typography.Title>
                    </Typography>
                  </Tooltip>
                }
                description={
                  <Typography>
                    <Typography.Paragraph
                      ellipsis={{
                        rows: 3,
                      }}
                    >
                      {resource.description}
                    </Typography.Paragraph>
                  </Typography>
                }
                // className={'overflow-scroll'}
                style={{
                  height: '100px',
                }}
              />
              <br />
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
        {resources.length === 0 && (
          <Col offset={8} md={8} className={'text-center'}>
            <Empty description={'There are no resources here.'} />
          </Col>
        )}
      </Row>
    )
  }

  return <ResourceGrid resources={resources} />
}
