import React from 'react'
import { useRouter } from 'next/router'
import { Col, Row, Skeleton, Typography } from 'antd'
import { useQuery } from 'urql'

import { useSections } from '../../../../lib/hooks/useSections'
import { SEO } from '../../../../components/SEO'
import { titleCase, upperCamelCase } from '../../../../utils/upperCamelCase'
import { CONTENT_COL_LAYOUT, SIDEBAR_COL_LAYOUT } from '../../../../constants'
import Sidebar from '../../../../components/learn/Sidebar'
import useBreakpoint from 'antd/es/grid/hooks/useBreakpoint'
import ResourceIndex from '../../../../components/learn/ResourceIndex'

export default function ViewResourceIndex() {
  const router = useRouter()
  const resourceSlug = router.query.resource as string
  const username = router.query.username as string
  const { body, sectionsMap, baseSectionId } = useSections({
    username,
    resourceSlug,
  })

  const { xs } = useBreakpoint()

  const RESOURCE_QUERY = `
    query($username: String!, $resourceSlug: String!) {
      resource(username: $username, resourceSlug: $resourceSlug) {
        id
        title
        slug
        description
      }
    }
  `

  const [{ data, fetching }] = useQuery({
    query: RESOURCE_QUERY,
    variables: {
      username,
      resourceSlug,
    },
  })

  if (fetching) {
    return <Skeleton active={true} />
  }

  return (
    <>
      <SEO title={`${upperCamelCase(resourceSlug)}`} />
      {body ? (
        body
      ) : (
        <Row>
          <Col {...SIDEBAR_COL_LAYOUT}>
            <Sidebar
              defaultSelectedKeys={['resource-index'] as string[]}
              defaultOpenKeys={[]}
              sectionsMap={sectionsMap}
              inEditMode={false}
              currentSections={sectionsMap.get(baseSectionId)!.sections ?? []}
            />
          </Col>

          <Col className={`${xs ? '' : 'px-5'}`} {...CONTENT_COL_LAYOUT}>
            <Typography className={'text-center pb-1 pt-2'}>
              <Typography.Title level={2}>
                {titleCase(resourceSlug)}
              </Typography.Title>
              <Typography.Paragraph ellipsis={{ rows: 3, expandable: true }}>
                {data.resource.description}
              </Typography.Paragraph>
            </Typography>

            <ResourceIndex
              baseSectionId={baseSectionId}
              sectionsMap={sectionsMap}
            />
          </Col>
        </Row>
      )}
    </>
  )
}
