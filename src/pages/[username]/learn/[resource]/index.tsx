import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { Skeleton } from 'antd'

import { useSections } from '../../../../lib/hooks/useSections'

export default function ViewResourceIndex() {
  const router = useRouter()
  const resourceSlug = router.query.resource as string
  const username = router.query.username as string
  const { firstPagePath } = useSections({ username, resourceSlug })

  useEffect(() => {
    if (firstPagePath()) {
      router
        .push(`/${username}/learn/${resourceSlug}/${firstPagePath()}`)
        .then()
    }
  }, [firstPagePath, resourceSlug, router, username])

  return <Skeleton active={true} />
}
