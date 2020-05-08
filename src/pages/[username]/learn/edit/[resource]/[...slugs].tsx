import { useRouter } from 'next/router'
import React from 'react'
import { Breadcrumb, Col, Row, Skeleton } from 'antd'
import useBreakpoint from 'antd/es/grid/hooks/useBreakpoint'

import { SEO } from '../../../../../components/SEO'
import { titleCase, upperCamelCase } from '../../../../../utils/upperCamelCase'
import Sidebar from '../../../../../components/learn/Sidebar'
import CustomEditor from '../../../../../components/learn/Editor'
import useSlugs from '../../../../../lib/hooks/useSlugs'
import {
  CONTENT_COL_LAYOUT,
  SIDEBAR_COL_LAYOUT,
} from '../../../../../constants'
import { useUser } from '../../../../../lib/hooks/useUser'
import NotAuthenticated from '../../../../../components/result/NotAuthenticated'
import NotAuthorized from '../../../../../components/result/NotAuthorized'

export default function EditResource() {
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
  const { xs } = useBreakpoint()

  const { user, fetching } = useUser()

  if (fetching) return <Skeleton active={true} />
  if (!user) return <NotAuthenticated />
  if (username !== user.username) return <NotAuthorized />

  return (
    <>
      <SEO title={`Edit ${upperCamelCase(resourceSlug)}`} />
      {body ? (
        body
      ) : (
        <Row>
          <Col {...SIDEBAR_COL_LAYOUT}>
            <Sidebar
              key={'sidebar'}
              defaultSelectedKeys={[slugs[slugs.length - 1] as string]}
              defaultOpenKeys={slugs}
              sectionsMap={sectionsMap}
              baseSectionId={baseSectionId}
              inEditMode={true}
              breadCrumb={
                <Breadcrumb
                  key={'breadcrumb'}
                  className={'text-center breadcrumb'}
                >
                  {slugs.map((slug, index) => (
                    <Breadcrumb.Item key={`${slug}-${index}`}>
                      {titleCase(slug)}
                    </Breadcrumb.Item>
                  ))}
                </Breadcrumb>
              }
            />
          </Col>

          <Col className={`${xs ? '' : 'px-5'}`} {...CONTENT_COL_LAYOUT}>
            <CustomEditor
              pageContent={pageContent}
              currentSectionId={currentSectionId}
              username={username}
              resourceSlug={resourceSlug}
              inEditMode={true}
            />
          </Col>
        </Row>
      )}
    </>
  )
}
