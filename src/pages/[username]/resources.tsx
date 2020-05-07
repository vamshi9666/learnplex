import React from 'react'
import { Skeleton } from 'antd'
import { useQuery } from 'urql'
import { useRouter } from 'next/router'

import { Resource } from '../../graphql/types'
import ResourceCards from '../../components/learn/ResourceCards'
import PageNotFound from '../../components/result/PageNotFound'

export default function UserResources() {
  const router = useRouter()
  const RESOURCES_BY_USERNAME_QUERY = `
    query($username: String!) {
      resourcesByUsername(username: $username) {
        id
        title
        description
        slug
        user {
          username
        }
        topic {
          title
          slug
        }
      }
    }
  `
  const [{ data, fetching, error }] = useQuery({
    query: RESOURCES_BY_USERNAME_QUERY,
    variables: {
      username: router.query.username,
    },
  })

  if (fetching) return <Skeleton active={true} />
  if (error) return <PageNotFound />

  const resources = data.resourcesByUsername as Resource[]

  return (
    <ResourceCards
      resources={resources}
      description={`${router.query.username} doesn't have any resources yet.`}
    />
  )
}
