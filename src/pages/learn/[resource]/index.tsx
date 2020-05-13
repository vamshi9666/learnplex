import { useRouter } from 'next/router'
import { useQuery } from 'urql'
import React from 'react'
import { Col, Row, Skeleton, Typography } from 'antd'

import InternalServerError from '../../../components/result/InternalServerError'
import { SEO } from '../../../components/SEO'
import { titleCase, upperCamelCase } from '../../../utils/upperCamelCase'
import ResourceIndex from '../../../components/learn/ResourceIndex'
import { useSections } from '../../../lib/hooks/useSections'
import { CONTENT_WITHOUT_SIDEBAR_COL_LAYOUT } from '../../../constants'

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

  if (fetching) {
    return <Skeleton active={true} />
  }

  if (error) {
    return <InternalServerError message={error.message} />
  }

  const resource = data.primaryResourceBySlug
  const username = resource.user.username

  return (
    <>
      <SEO title={`${upperCamelCase(resourceSlug)}`} />
      {body ? (
        body
      ) : (
        <Row>
          <Col {...CONTENT_WITHOUT_SIDEBAR_COL_LAYOUT}>
            <Typography className={'pb-1 pt-2 pl-5'}>
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
              username={username}
            />
          </Col>
        </Row>
      )}
    </>
  )
}
