import { NextPage } from 'next'
import React from 'react'
import { useRouter } from 'next/router'

import ResourceIndexV2 from '../../../../components/v2/ResourceIndex'
import { SEO } from '../../../../components/SEO'
import { titleCase } from '../../../../utils/titleCase'

const ViewResourceIndexPageV2: NextPage = () => {
  const router = useRouter()
  const resourceSlug = router.query.resource as string
  const username = router.query.username as string
  return (
    <>
      <SEO title={titleCase(resourceSlug)} />
      <ResourceIndexV2 username={username} resourceSlug={resourceSlug} />
    </>
  )
}

export default ViewResourceIndexPageV2
