import useSWR from 'swr'
import { Col, Grid, message, Row, Skeleton, Typography } from 'antd'
import React, { useContext } from 'react'
import { useRouter } from 'next/router'

import { fetcher } from '../../../../utils/fetcher'
import InternalServerError from '../../../../components/result/InternalServerError'
import { UserContext } from '../../../../lib/contexts/UserContext'
import NotAuthorized from '../../../../components/result/NotAuthorized'
import NotAuthenticated from '../../../../components/result/NotAuthenticated'
import { SEO } from '../../../../components/SEO'
import { CONTENT_COL_LAYOUT, SIDEBAR_COL_LAYOUT } from '../../../../constants'
import EditResourceIndexV2 from '../../../../components/learn/v2/edit/EditResourceIndexV2'
import { updateResourceTitle as updateResourceTitleInDB } from '../../../../utils/updateResourceTitle'
import { updateResourceDescription as updateResourceDescriptionInDB } from '../../../../utils/updateResourceDescription'
import { updateResourceSlug as updateResourceSlugInDB } from '../../../../utils/updateResourceSlug'
import EditSidebarV2 from '../../../../components/learn/v2/edit/EditSidebarV2'

export default function EditResourceIndexPageV2() {
  const router = useRouter()
  const { xs } = Grid.useBreakpoint()
  const resourceSlug = router.query.resource as string
  const url = `/api/resource?resourceSlug=${resourceSlug}`
  const { data, error, mutate } = useSWR(url, fetcher)
  const { user: loggedInUser } = useContext(UserContext)

  if (error) {
    return <InternalServerError message={error.message} />
  }
  if (!data) {
    return <Skeleton active={true} />
  }

  const resource = data.resource
  const baseSectionId = resource.baseSectionId
  const sectionsMap = data.sectionsMap
  const baseSection = sectionsMap[baseSectionId]
  const ownerUsername = resource.user.username
  const isLoggedIn = !!loggedInUser
  const canViewPage = isLoggedIn && ownerUsername === loggedInUser.username

  if (!isLoggedIn) {
    return <NotAuthenticated />
  }

  if (!canViewPage) {
    return <NotAuthorized />
  }

  const updateResourceTitle = async ({ title }: { title: string }) => {
    if (title === resource.title) {
      return
    }
    const result = await updateResourceTitleInDB({
      title,
      resourceId: resource.id,
    })
    if (result.error) {
      message.error(result.message)
      return
    }
    message.success('Title updated successfully')
    await mutate()
  }

  const updateResourceDescription = async ({
    description,
  }: {
    description: string
  }) => {
    if (description === resource.description) {
      return
    }
    const result = await updateResourceDescriptionInDB({
      description,
      resourceId: resource.id,
    })
    if (result.error) {
      message.error(result.message)
      return
    }
    message.success('Description updated successfully')
    await mutate()
  }

  const updateResourceSlug = async ({ slug }: { slug: string }) => {
    if (slug === resourceSlug) {
      return
    }
    const result = await updateResourceSlugInDB({
      slug,
      resourceId: resource.id,
    })
    if (result.error) {
      message.error(result.message)
      return
    }
    message.success('Slug updated successfully')
    await router.push(`/learn/edit/${result.slug}`)
  }

  return (
    <>
      <SEO title={resource.title} description={resource.description} />
      <Row gutter={[16, 16]} justify={'start'}>
        <Col {...SIDEBAR_COL_LAYOUT}>
          <EditSidebarV2
            currentSections={baseSection.sections}
            sectionsMap={sectionsMap}
            resourceSlug={resourceSlug}
            defaultSelectedKeys={['resource-index']}
          />
        </Col>
        <Col className={`${!xs ? 'px-5' : ''}`} {...CONTENT_COL_LAYOUT}>
          <Typography className={'text-center pl-5 pb-1 pt-2'}>
            <Typography.Title
              level={2}
              editable={{
                onChange: (value) => updateResourceTitle({ title: value }),
              }}
            >
              {resource.title}
            </Typography.Title>
            <Typography.Text
              editable={{
                onChange: (value) => updateResourceSlug({ slug: value }),
              }}
            >
              {resource.slug}
            </Typography.Text>
            <Typography.Paragraph
              ellipsis={{ rows: 3, expandable: true }}
              editable={{
                onChange: (value) =>
                  updateResourceDescription({ description: value }),
              }}
            >
              {resource.description}
            </Typography.Paragraph>
          </Typography>

          <EditResourceIndexV2
            baseSectionId={baseSectionId}
            sectionsMapData={sectionsMap}
            reValidate={mutate}
          />
        </Col>
      </Row>
    </>
  )
}
