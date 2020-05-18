import { NextPage } from 'next'
import React from 'react'
import { useRouter } from 'next/router'

import ResourceIndexV2 from '../../../components/v2/ResourceIndex'

const ViewPrimaryResourceIndexPageV2: NextPage = () => {
  const router = useRouter()
  const resourceSlug = router.query.resource as string
  return <ResourceIndexV2 resourceSlug={resourceSlug} />
}

export default ViewPrimaryResourceIndexPageV2
