import { useRouter } from 'next/router'
import React from 'react'
import useSWR from 'swr'
import { Skeleton } from 'antd'

import ResourcePageV2 from '../../../components/learn/v2/ResourcePageV2'
import { SEO } from '../../../components/SEO'
import { fetcher } from '../../../utils/fetcher'
import InternalServerError from '../../../components/result/InternalServerError'

export default function ViewResourcePageV2() {
  const router = useRouter()
  const resourceSlug = router.query.resource as string
  const slugs = router.query.slugs as string[]
  const slugsPath = slugs.reduce((a, b) => `${a}/${b}`, '')
  const url = `/api/slugs?resourceSlug=${resourceSlug}&slugsPath=${slugsPath}`
  const { data, error } = useSWR(url, fetcher)

  if (error) return <InternalServerError message={error.message} />
  if (!data) return <Skeleton active={true} />

  const resource = data.resource
  const currentSection = data.currentSection
  const sectionsMap = data.sectionsMap
  const siblingSections = data.siblingSections

  return (
    <>
      <SEO />
      <SEO
        title={currentSection.title}
        description={resource.description + currentSection.page?.content ?? ''}
      />
      <ResourcePageV2
        slugs={slugs}
        currentSection={currentSection}
        currentSections={siblingSections}
        resource={resource}
        sectionsMap={sectionsMap}
      />
    </>
  )
}
