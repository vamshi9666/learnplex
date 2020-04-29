import React from 'react'
import { useRouter } from 'next/router'
import { Col, Row, Typography } from 'antd'

import { SEO } from '../../../../../components/SEO'
import { upperCamelCase } from '../../../../../utils/upperCamelCase'
import Sidebar from '../../../../../components/learn/Sidebar'
import { useSections } from '../../../../../lib/hooks/useSections'
import ResourceIndex from '../../../../../components/learn/ResourceIndex'
import { useUser } from '../../../../../lib/hooks/useUser'

export default function EditResourceIndex() {
  const router = useRouter()
  const resourceSlug = router.query.resource as string
  const username = router.query.username as string
  const { baseSectionId, sectionsMap, body } = useSections({
    resourceSlug,
    username,
  })

  const { user } = useUser()
  if (!user || user.username !== username) {
    return <p>loading...</p>
  }

  return (
    <>
      <SEO title={`Edit ${upperCamelCase(resourceSlug as string)} | Index`} />
      <Row>
        <Col span={6}>
          {body ? (
            body
          ) : (
            <Sidebar
              baseSectionId={baseSectionId}
              sectionsMap={sectionsMap}
              inEditMode={true}
              defaultSelectedKeys={['resource-index']}
            />
          )}
        </Col>

        <Col className={'p-5'} span={12}>
          <Typography>
            <Typography.Title>Resource Index</Typography.Title>
          </Typography>
          {body ? (
            body
          ) : (
            <ResourceIndex
              baseSectionId={baseSectionId}
              sectionsMap={sectionsMap}
            />
          )}
        </Col>
      </Row>
    </>
  )
}
