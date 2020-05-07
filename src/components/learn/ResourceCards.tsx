import { Card, Col, Empty, Row, Space, Tag, Typography } from 'antd'
import React from 'react'
import { useRouter } from 'next/router'

import { Resource } from '../../graphql/types'
import { SEO } from '../SEO'
import { TagOutlined, UserOutlined } from '@ant-design/icons'

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

  return (
    <>
      <SEO title={'My Resources'} />

      <Row gutter={[16, 16]}>
        {resources.map((resource) => (
          <Col key={resource.id} xs={24} sm={8} md={6}>
            <Card
              key={resource.id}
              hoverable
              onClick={() =>
                router.push(`/${resource.user.username}/learn/${resource.slug}`)
              }
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
                <Tag
                  className={'cursor-pointer'}
                  color={'blue'}
                  icon={<UserOutlined />}
                  onClick={(e) =>
                    goToUserResources({ e, username: resource.user.username })
                  }
                >
                  {resource.user.username}
                </Tag>
                <Tag
                  className={'cursor-pointer'}
                  onClick={(e) => goToTopic({ e, slug: resource.topic.slug })}
                  color={'magenta'}
                  icon={<TagOutlined />}
                >
                  {resource.topic.slug}
                </Tag>
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
