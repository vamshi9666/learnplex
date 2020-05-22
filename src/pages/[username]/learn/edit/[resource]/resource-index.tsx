import React, { useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import NProgress from 'nprogress'
import { Col, Row, Skeleton, Typography, Grid } from 'antd'
import { useMutation, useQuery } from 'urql'

import { SEO } from '../../../../../components/SEO'
import Sidebar from '../../../../../components/learn/Sidebar'
import { useSections } from '../../../../../lib/hooks/useSections'
import ResourceIndexEdit from '../../../../../components/learn/ResourceIndexEdit'
import NotAuthenticated from '../../../../../components/result/NotAuthenticated'
import NotAuthorized from '../../../../../components/result/NotAuthorized'
import {
  CONTENT_COL_LAYOUT,
  SIDEBAR_COL_LAYOUT,
} from '../../../../../constants'
import { UserContext } from '../../../../../lib/contexts/UserContext'

export default function EditResourceIndex() {
  const router = useRouter()
  const { xs } = Grid.useBreakpoint()
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

  const UPDATE_RESOURCE_SLUG_MUTATION = `
    mutation($resourceId: String!, $updatedSlug: String!) {
      updateResourceSlug(resourceId: $resourceId, updatedSlug: $updatedSlug) {
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
  const [, updateSlugMutation] = useMutation(UPDATE_RESOURCE_SLUG_MUTATION)

  const [{ data, fetching }, reExecuteResourceQuery] = useQuery({
    query: RESOURCE_QUERY,
    variables: {
      username,
      resourceSlug,
    },
  })

  const {
    baseSectionId,
    sectionsMap,
    body,
    resourceTitle,
    resourceId,
    resourceDescription,
  } = useSections({
    resourceSlug,
    username,
  })

  useEffect(() => {
    reExecuteResourceQuery()
  }, [reExecuteResourceQuery, resourceSlug, username])
  console.log({ data })

  const { user } = useContext(UserContext)

  if (fetching) return <Skeleton active={true} />

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
        reExecuteResourceQuery()
        console.log({ data })
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
        reExecuteResourceQuery()
      }
    })
    NProgress.done()
  }

  const updateSlug = (value: string) => {
    NProgress.start()
    if (value === resourceSlug) {
      NProgress.done()
      return
    }
    updateSlugMutation({
      resourceId,
      updatedSlug: value,
    }).then(async (result) => {
      if (result.error) {
        console.log({ updateSlugError: result.error })
      } else {
        console.log({ result })
        const slug = result.data.updateResourceSlug.slug
        await router.push(`/${username}/learn/edit/${slug}/resource-index`)
        reExecuteResourceQuery()
      }
    })
    NProgress.done()
  }

  return (
    <>
      <SEO
        title={`Edit ${resourceTitle} | Index`}
        description={resourceDescription}
      />
      {body ? (
        body
      ) : (
        <Row gutter={[16, 16]} justify={'start'}>
          <Col {...SIDEBAR_COL_LAYOUT}>
            <Sidebar
              sectionsMap={sectionsMap}
              inEditMode={true}
              defaultSelectedKeys={['resource-index']}
              currentSections={sectionsMap.get(baseSectionId)!.sections ?? []}
              username={username}
            />
          </Col>

          <Col className={`${!xs ? 'px-5' : ''}`} {...CONTENT_COL_LAYOUT}>
            <Typography className={'text-center pb-1 pt-2'}>
              <Typography.Title
                level={2}
                editable={{
                  onChange: (value) => updateTitle(value),
                }}
              >
                {data?.resource?.title ?? ''}
              </Typography.Title>
              <Typography.Text
                editable={{
                  onChange: (value) => updateSlug(value),
                }}
              >
                {data?.resource?.slug ?? ''}
              </Typography.Text>
              <Typography.Paragraph
                ellipsis={{ rows: 3, expandable: true }}
                editable={{
                  onChange: (value) => updateDescription(value),
                }}
              >
                {data?.resource?.description ?? ''}
              </Typography.Paragraph>
            </Typography>

            <ResourceIndexEdit
              baseSectionId={baseSectionId}
              sectionsMap={sectionsMap}
            />
          </Col>
        </Row>
      )}
    </>
  )
}
