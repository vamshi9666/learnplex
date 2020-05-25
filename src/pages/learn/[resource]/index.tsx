import { NextPage } from 'next'
import React from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { Skeleton } from 'antd'

import ResourceIndexV2 from '../../../components/learn/v2/ResourceIndexV2'
import { SEO } from '../../../components/SEO'
import { fetcher } from '../../../utils/fetcher'
import InternalServerError from '../../../components/result/InternalServerError'

const ViewPrimaryResourceIndexPageV2: NextPage = () => {
  const router = useRouter()
  const resourceSlug = router.query.resource as string
  const url = `/api/resource?resourceSlug=${resourceSlug}`
  const { data, error } = useSWR(url, fetcher)

  if (error) {
    return <InternalServerError message={error.message} />
  }
  if (!data) {
    return <Skeleton active={true} />
  }

  const resource = data.resource
  const sectionsMap = data.sectionsMap

  return (
    <>
      <SEO title={resource.title} description={resource.description} />
      <ResourceIndexV2 resource={resource} sectionsMap={sectionsMap} />
    </>
  )
}

export default ViewPrimaryResourceIndexPageV2
