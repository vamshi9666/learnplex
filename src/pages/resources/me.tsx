import React from 'react'
import { Skeleton } from 'antd'
import { useQuery } from 'urql'

import { useUser } from '../../lib/hooks/useUser'
import NotAuthenticated from '../../components/result/NotAuthenticated'
import InternalServerError from '../../components/result/InternalServerError'
import { Resource } from '../../graphql/types'
import ResourceCards from '../../components/learn/ResourceCards'
import { SEO } from '../../components/SEO'

export default function MyResources() {
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
        topic {
          title
          slug
        }
        firstPageSlugsPath
        verified
      }
    }
  `
  const { user, fetching, error } = useUser()
  const [
    { data, fetching: resourcesFetching, error: resourcesError },
  ] = useQuery({
    query: RESOURCES_QUERY,
  })

  if (fetching) return <Skeleton active={true} />
  if (!user) return <NotAuthenticated />
  if (error) return <InternalServerError message={error.message} />

  if (resourcesFetching) return <Skeleton active={true} />
  if (resourcesError) return <InternalServerError />

  const resources = data.resources as Resource[]

  return (
    <>
      <SEO title={'My Resources'} />
      <ResourceCards resources={resources} />
    </>
  )
}
