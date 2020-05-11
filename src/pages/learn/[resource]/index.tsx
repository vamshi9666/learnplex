import { useRouter } from 'next/router'
import { useQuery } from 'urql'
import React from 'react'
import { Col, Grid, Row, Skeleton, Typography } from 'antd'

import InternalServerError from '../../../components/result/InternalServerError'
import { SEO } from '../../../components/SEO'
import { titleCase, upperCamelCase } from '../../../utils/upperCamelCase'
import { CONTENT_COL_LAYOUT, SIDEBAR_COL_LAYOUT } from '../../../constants'
import Sidebar from '../../../components/learn/Sidebar'
import ResourceIndex from '../../../components/learn/ResourceIndex'
import { useSections } from '../../../lib/hooks/useSections'

export default function ViewPrimaryResourceIndex() {
  const router = useRouter()
  const resourceSlug = router.query.resource as string

  const PRIMARY_RESOURCE_BY_SLUG_QUERY = `
    query($resourceSlug: String!) {
      primaryResourceBySlug(resourceSlug: $resourceSlug) {
        id
        title
        slug
        description
        user {
          username
        }
      }
    }
  `

  const [{ data, fetching, error }] = useQuery({
    query: PRIMARY_RESOURCE_BY_SLUG_QUERY,
    variables: {
      resourceSlug,
    },
  })

  const { body, sectionsMap, baseSectionId } = useSections({
    username: data?.primaryResourceBySlug?.user?.username,
    resourceSlug,
  })

  const { xs } = Grid.useBreakpoint()

  if (fetching) {
    return <Skeleton active={true} />
  }

  if (error) {
    return <InternalServerError message={error.message} />
  }

  const resource = data.primaryResourceBySlug

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
              username={resource.user.username}
            />
          </Col>

          <Col className={`${xs ? '' : 'px-5'}`} {...CONTENT_COL_LAYOUT}>
            <Typography className={'text-center pb-1 pt-2'}>
              <Typography.Title level={2}>
                {titleCase(resourceSlug)}
              </Typography.Title>
              <Typography.Paragraph ellipsis={{ rows: 3, expandable: true }}>
                {resource.description}
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
