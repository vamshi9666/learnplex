import { Card, Col, Empty, Row } from 'antd'
import React from 'react'
import { useRouter } from 'next/router'

import { Resource } from '../../graphql/types'

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
  return (
    <>
      <Row gutter={[16, 16]}>
        {resources.map((resource) => (
          <Col key={resource.id} md={6}>
            <Card
              key={resource.id}
              hoverable
              onClick={() =>
                router.push(`/${resource.user.username}/learn/${resource.slug}`)
              }
            >
              <Card.Meta
                title={`${resource.title}`}
                description={resource.description}
                className={'overflow-scroll'}
                style={{
                  height: '100px',
                }}
              />
              by {resource.user.username}
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
