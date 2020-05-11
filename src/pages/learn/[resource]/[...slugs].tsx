import React from 'react'
import { useQuery } from 'urql'
import { useRouter } from 'next/router'
import { Skeleton } from 'antd'

import ResourcePage from '../../../components/learn/ResourcePage'
import InternalServerError from '../../../components/result/InternalServerError'

export default function ViewPrimaryResource() {
  const router = useRouter()
  const resourceSlug = router.query.resource as string
  const PRIMARY_RESOURCE_BY_SLUG_QUERY = `
    query($resourceSlug: String!) {
      primaryResourceBySlug(resourceSlug: $resourceSlug) {
        id
        title
        slug
        description
        user {
          username
        }
      }
    }
  `

  const [{ data, fetching, error }] = useQuery({
    query: PRIMARY_RESOURCE_BY_SLUG_QUERY,
    variables: {
      resourceSlug,
    },
  })
  if (fetching) {
    return <Skeleton active={true} />
  }

  if (error) {
    return <InternalServerError message={error.message} />
  }
  const username = data.primaryResourceBySlug.user.username
  return <ResourcePage inEditMode={false} username={username} />
}
