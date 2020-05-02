import { Card, Col, Row } from 'antd'
import React from 'react'
import { useRouter } from 'next/router'

import { Resource } from '../../graphql/types'

export default function ResourceCards({
  resources,
}: {
  resources: Resource[]
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
      </Row>
    </>
  )
}
