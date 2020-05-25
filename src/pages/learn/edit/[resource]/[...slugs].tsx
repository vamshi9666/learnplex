import React, { useContext } from 'react'
import { useRouter } from 'next/router'
import { Skeleton } from 'antd'
import useSWR from 'swr'

import EditResourcePageV2 from '../../../../components/learn/v2/edit/EditResourcePageV2'
import { fetcher } from '../../../../utils/fetcher'
import InternalServerError from '../../../../components/result/InternalServerError'
import { UserContext } from '../../../../lib/contexts/UserContext'
import NotAuthenticated from '../../../../components/result/NotAuthenticated'
import NotAuthorized from '../../../../components/result/NotAuthorized'
import { SEO } from '../../../../components/SEO'

export default function EditResourceV2() {
  const router = useRouter()
  const resourceSlug = router.query.resource as string
  const slugs = router.query.slugs as string[]
  const slugsPath = slugs.reduce((a, b) => `${a}/${b}`, '')
  const url = `/api/slugs?resourceSlug=${resourceSlug}&slugsPath=${slugsPath}&editMode=${true}`
  const { data, error, mutate } = useSWR(url, fetcher)
  const { user } = useContext(UserContext)

  if (error) return <InternalServerError message={error.message} />
  if (!data) return <Skeleton active={true} />

  const resource = data.resource
  if (!user) {
    return <NotAuthenticated />
  }
  if (resource.user.username !== user.username) {
    return <NotAuthorized />
  }
  const currentSection = data.currentSection
  const sectionsMap = data.sectionsMap

  return (
    <>
      <SEO
        title={`Edit ${currentSection.title}`}
        description={resource.description + currentSection.page?.content ?? ''}
      />
      <EditResourcePageV2
        resource={resource}
        currentSection={currentSection}
        sectionsMap={sectionsMap}
        reValidate={mutate}
      />
    </>
  )
}
