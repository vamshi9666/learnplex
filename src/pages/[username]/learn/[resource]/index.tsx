import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { Button, Empty, Skeleton } from 'antd'

import { useSections } from '../../../../lib/hooks/useSections'
import { useUser } from '../../../../lib/hooks/useUser'

export default function ViewResourceIndex() {
  const router = useRouter()
  const resourceSlug = router.query.resource as string
  const username = router.query.username as string
  const { firstPagePath } = useSections({ username, resourceSlug })
  const { user } = useUser()

  useEffect(() => {
    if (firstPagePath()) {
      router
        .push(`/${username}/learn/${resourceSlug}/${firstPagePath()}`)
        .then()
    }
  }, [firstPagePath, resourceSlug, router, username])

  if (!firstPagePath()) {
    return (
      <Empty
        description={'The resource is empty'}
        children={
          user?.username === username && (
            <Button
              onClick={() =>
                router.push(
                  `/${username}/learn/edit/${resourceSlug}/resource-index`
                )
              }
              type={'primary'}
            >
              Edit
            </Button>
          )
        }
      />
    )
  }

  return <Skeleton active={true} />
}
