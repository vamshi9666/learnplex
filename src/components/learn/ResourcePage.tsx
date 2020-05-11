import React from 'react'
import { useRouter } from 'next/router'
import { Col, Row } from 'antd'

import useSlugs from '../../lib/hooks/useSlugs'
import useBreakpoint from 'antd/es/grid/hooks/useBreakpoint'
import { SEO } from '../SEO'
import { upperCamelCase } from '../../utils/upperCamelCase'
import { CONTENT_COL_LAYOUT, SIDEBAR_COL_LAYOUT } from '../../constants'
import Sidebar from './Sidebar'
import CustomEditor from './Editor'

export default function ResourcePage({
  inEditMode,
  username = '',
}: {
  inEditMode: boolean
  username: string
}) {
  const router = useRouter()
  const resourceSlug = router.query.resource as string
  const slugs = router.query.slugs as string[]
  const { sectionsMap, currentSectionId, body, pageContent, keys } = useSlugs({
    resourceSlug,
    username,
    slugs,
  })

  const { xs } = useBreakpoint()
  const parentSectionId =
    sectionsMap.get(currentSectionId)?.parentSection?.id ?? ''

  return (
    <>
      <SEO
        title={`${inEditMode ? 'Edit ' : ''}${upperCamelCase(resourceSlug)}`}
      />
      {body ? (
        body
      ) : (
        <Row>
          <Col {...SIDEBAR_COL_LAYOUT}>
            <Sidebar
              defaultSelectedKeys={[keys[keys.length - 1] as string]}
              defaultOpenKeys={keys}
              sectionsMap={sectionsMap}
              inEditMode={false}
              currentSections={sectionsMap.get(parentSectionId)?.sections ?? []}
              username={username}
            />
          </Col>

          <Col className={`${xs ? '' : 'px-5'}`} {...CONTENT_COL_LAYOUT}>
            <CustomEditor
              pageContent={pageContent}
              currentSectionId={currentSectionId}
              username={username}
              resourceSlug={resourceSlug}
              inEditMode={inEditMode}
            />
          </Col>
        </Row>
      )}
    </>
  )
}
