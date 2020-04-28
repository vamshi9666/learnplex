import { useRouter } from 'next/router'
import React from 'react'
import { Col, Row } from 'antd'

import { SEO } from '../../../../components/SEO'
import { upperCamelCase } from '../../../../utils/upperCamelCase'
import Sidebar from '../../../../components/learn/Sidebar'
import CustomEditor from '../../../../components/layout/Editor'
import useSlugs from '../../../../lib/hooks/useSlugs'

export default function ViewResource() {
  const router = useRouter()
  const resourceSlug = router.query.resource as string
  const username = router.query.username as string
  const slugs = router.query.slugs as string[]
  const {
    baseSectionId,
    sectionsMap,
    currentSectionId,
    body,
    pageContent,
  } = useSlugs({ resourceSlug, username, slugs })
  if (body) return body

  return (
    <>
      <SEO title={`Learn ${upperCamelCase(resourceSlug)}`} />
      <Row>
        <Col span={6}>
          <Sidebar
            defaultSelectedKeys={[slugs[slugs.length - 1] as string]}
            defaultOpenKeys={slugs}
            sectionsMap={sectionsMap}
            baseSectionId={baseSectionId}
            inEditMode={false}
          />
        </Col>

        <Col className={'p-5'} span={12}>
          <CustomEditor
            pageContent={pageContent}
            currentSectionId={currentSectionId}
            username={username}
            resourceSlug={resourceSlug}
            inEditMode={false}
          />
        </Col>
      </Row>
    </>
  )
}
