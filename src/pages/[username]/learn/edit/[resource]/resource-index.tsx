import React from 'react'
import { useRouter } from 'next/router'
import NProgress from 'nprogress'
import { Breadcrumb, Col, Divider, Row, Skeleton, Typography } from 'antd'
import { useMutation, useQuery } from 'urql'

import { SEO } from '../../../../../components/SEO'
import { titleCase } from '../../../../../utils/upperCamelCase'
import Sidebar from '../../../../../components/learn/Sidebar'
import { useSections } from '../../../../../lib/hooks/useSections'
import ResourceIndex from '../../../../../components/learn/ResourceIndex'
import { useUser } from '../../../../../lib/hooks/useUser'
import NotAuthenticated from '../../../../../components/error/NotAuthenticated'
import NotAuthorized from '../../../../../components/error/NotAuthorized'

export default function EditResourceIndex() {
  const router = useRouter()
  const resourceSlug = router.query.resource as string
  const username = router.query.username as string
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
  const UPDATE_RESOURCE_DESCRIPTION_MUTATION = `
    mutation($resourceSlug: String!, $description: String!) {
      updateResourceDescription(resourceSlug: $resourceSlug, description: $description) {
        id
        title
        slug
        description
      }
    }
  `
  const UPDATE_RESOURCE_TITLE_MUTATION = `
    mutation($resourceSlug: String!, $title: String!) {
      updateResourceTitle(resourceSlug: $resourceSlug, title: $title) {
        id
        title
        slug
        description
      }
    }
  `

  const [, updateDescriptionMutation] = useMutation(
    UPDATE_RESOURCE_DESCRIPTION_MUTATION
  )
  const [, updateTitleMutation] = useMutation(UPDATE_RESOURCE_TITLE_MUTATION)

  const [{ data, fetching }, reExecuteQuery] = useQuery({
    query: RESOURCE_QUERY,
    variables: {
      username,
      resourceSlug,
    },
  })

  const { baseSectionId, sectionsMap, body } = useSections({
    resourceSlug,
    username,
  })

  const { user, fetching: userFetching } = useUser()
  if (fetching || userFetching) return <Skeleton active={true} />

  if (!user) return <NotAuthenticated />
  if (router.query.username !== user.username) return <NotAuthorized />

  const updateDescription = (value: string) => {
    NProgress.start()
    updateDescriptionMutation({
      resourceSlug,
      description: value,
    }).then((result) => {
      if (result.error) {
        console.log({ updateDescriptionError: result.error })
      } else {
        console.log({ result })
        reExecuteQuery()
      }
    })
    NProgress.done()
  }

  const updateTitle = (value: string) => {
    NProgress.start()
    updateTitleMutation({
      resourceSlug,
      title: value,
    }).then(async (result) => {
      if (result.error) {
        console.log({ updateTitleError: result.error })
      } else {
        console.log({ result })
        const slug = result.data.updateResourceTitle.slug
        if (slug !== data.resource.slug) {
          await router.push(`/${username}/learn/edit/${slug}/resource-index`)
        }
      }
    })
    NProgress.done()
  }

  return (
    <>
      <SEO title={`Edit ${titleCase(resourceSlug as string)} | Index`} />
      {body ? (
        body
      ) : (
        <Row>
          <Col span={6}>
            <Sidebar
              baseSectionId={baseSectionId}
              sectionsMap={sectionsMap}
              inEditMode={true}
              defaultSelectedKeys={['resource-index']}
              breadCrumb={
                <Breadcrumb className={'text-center breadcrumb'}>
                  <Breadcrumb.Item>
                    {titleCase(resourceSlug)} Index
                  </Breadcrumb.Item>
                </Breadcrumb>
              }
            />
          </Col>

          <Col className={'p-5'} span={18}>
            <Typography>
              <Typography.Title
                level={2}
                editable={{
                  onChange: (value) => updateTitle(value),
                }}
              >
                {titleCase(resourceSlug)}
              </Typography.Title>
              <Typography.Paragraph
                editable={{
                  onChange: (value) => updateDescription(value),
                }}
              >
                {data.resource.description}
              </Typography.Paragraph>
            </Typography>
            <Divider />

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
