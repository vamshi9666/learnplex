import React from 'react'
import { Button, Skeleton } from 'antd'
import { useQuery } from 'urql'
import { useRouter } from 'next/router'

import { useUser } from '../../lib/hooks/useUser'
import NotAuthenticated from '../../components/result/NotAuthenticated'
import InternalServerError from '../../components/result/InternalServerError'
import { Resource, UserRole } from '../../graphql/types'
import ResourceCards from '../../components/learn/ResourceCards'
import NotAuthorized from '../../components/result/NotAuthorized'

export default function MyResources() {
  const router = useRouter()
  const ALL_RESOURCES_QUERY = `
    query {
      allResources {
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
    query: ALL_RESOURCES_QUERY,
  })

  if (fetching) return <Skeleton active={true} />
  if (!user) return <NotAuthenticated />
  if (!user.roles.includes(UserRole.Admin)) return <NotAuthorized />
  if (error) return <InternalServerError message={error.message} />

  if (resourcesFetching) return <Skeleton active={true} />
  if (resourcesError) return <InternalServerError />

  const resources = data.allResources as Resource[]

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
