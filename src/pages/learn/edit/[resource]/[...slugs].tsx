import React from 'react'
import { useRouter } from 'next/router'

import EditResourcePageV2 from '../../../../components/v2/edit/EditResourcePageV2'

export default function EditResourceV2() {
  const router = useRouter()
  const resourceSlug = router.query.resource as string
  const slugs = router.query.slugs as string[]

  return <EditResourcePageV2 resourceSlug={resourceSlug} slugs={slugs} />
}
