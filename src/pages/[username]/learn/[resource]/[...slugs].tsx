import { useRouter } from 'next/router'
import React from 'react'
import { Col, Row } from 'antd'
import useBreakpoint from 'antd/es/grid/hooks/useBreakpoint'

import { SEO } from '../../../../components/SEO'
import { upperCamelCase } from '../../../../utils/upperCamelCase'
import Sidebar from '../../../../components/learn/Sidebar'
import CustomEditor from '../../../../components/learn/Editor'
import useSlugs from '../../../../lib/hooks/useSlugs'
import { CONTENT_COL_LAYOUT, SIDEBAR_COL_LAYOUT } from '../../../../constants'

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
    keys,
  } = useSlugs({ resourceSlug, username, slugs })

  const { xs } = useBreakpoint()

  return (
    <>
      <SEO title={`${upperCamelCase(resourceSlug)}`} />
      {body ? (
        body
      ) : (
        <Row>
          <Col {...SIDEBAR_COL_LAYOUT}>
            <Sidebar
              defaultSelectedKeys={[keys[keys.length - 1] as string]}
              defaultOpenKeys={keys}
              sectionsMap={sectionsMap}
              baseSectionId={baseSectionId}
              inEditMode={false}
            />
          </Col>

          <Col className={`${xs ? '' : 'px-5'}`} {...CONTENT_COL_LAYOUT}>
            <CustomEditor
              pageContent={pageContent}
              currentSectionId={currentSectionId}
              username={username}
              resourceSlug={resourceSlug}
              inEditMode={false}
            />
          </Col>
        </Row>
      )}
    </>
  )
}
