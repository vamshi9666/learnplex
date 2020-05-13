import React from 'react'
import { useRouter } from 'next/router'
import { Col, Row, Grid } from 'antd'

import useSlugs from '../../lib/hooks/useSlugs'
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
  const {
    sectionsMap,
    currentSectionId,
    body,
    pageContent,
    keys,
    baseSectionId,
  } = useSlugs({
    resourceSlug,
    username,
    slugs,
  })

  const { xs } = Grid.useBreakpoint()
  const parentSectionId =
    sectionsMap.get(currentSectionId)?.parentSection?.id ?? ''

  let currentSections = sectionsMap.get(parentSectionId)?.sections ?? []

  if (parentSectionId === baseSectionId) {
    currentSections = [sectionsMap.get(currentSectionId)!]
  }

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
              inEditMode={inEditMode}
              currentSections={currentSections}
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
