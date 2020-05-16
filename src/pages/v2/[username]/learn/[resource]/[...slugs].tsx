import { useRouter } from 'next/router'
import React from 'react'

import ResourcePageV2 from '../../../../../components/v2/ResourcePage'

export default function ViewResourcePageV2() {
  const router = useRouter()
  const resourceSlug = router.query.resource as string
  const username = router.query.username as string
  const slugs = router.query.slugs as string[]

  return (
    <ResourcePageV2
      inEditMode={false}
      username={username}
      slugs={slugs}
      resourceSlug={resourceSlug}
    />
  )
}
