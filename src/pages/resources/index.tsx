import React from 'react'
import { Button, Skeleton } from 'antd'
import { useQuery } from 'urql'

import { useUser } from '../../lib/hooks/useUser'
import NotAuthenticated from '../../components/error/NotAuthenticated'
import InternalServerError from '../../components/error/InternalServerError'
import { Resource } from '../../graphql/types'
import ResourceCards from '../../components/learn/ResourceCards'
import { useRouter } from 'next/router'

export default function MyResources() {
  const router = useRouter()
  const RESOURCES_QUERY = `
    query {
      resources {
        id
        title
        description
        slug
        user {
          username
        }
      }
    }
  `
  const { user, fetching, error } = useUser()
  const [
    { data, fetching: resourcesFetching, error: resourcesError },
  ] = useQuery({
    query: RESOURCES_QUERY,
  })

  if (fetching) return <p>User Loading....</p>
  if (!user) return <NotAuthenticated />
  if (error) return <InternalServerError />

  if (resourcesFetching) return <Skeleton active={true} />
  if (resourcesError) return <InternalServerError />

  const resources = data.resources as Resource[]

  return (
    <ResourceCards
      resources={resources}
      description={"You don't have any resources yet."}
      actionsIfEmpty={
        <Button type={'primary'} onClick={() => router.push('/resources/new')}>
          Create New Resource
        </Button>
      }
    />
  )
}
