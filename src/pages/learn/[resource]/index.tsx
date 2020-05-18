import { NextPage } from 'next'
import React from 'react'
import { useRouter } from 'next/router'

import ResourceIndexV2 from '../../../components/v2/ResourceIndex'
import { SEO } from '../../../components/SEO'
import { titleCase } from '../../../utils/titleCase'

const ViewPrimaryResourceIndexPageV2: NextPage = () => {
  const router = useRouter()
  const resourceSlug = router.query.resource as string
  return (
    <>
      <SEO title={titleCase(resourceSlug)} />
      <ResourceIndexV2 resourceSlug={resourceSlug} />
    </>
  )
}

export default ViewPrimaryResourceIndexPageV2
