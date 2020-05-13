import React from 'react'
import { Skeleton } from 'antd'
import { useQuery } from 'urql'

import InternalServerError from '../components/result/InternalServerError'
import { Resource } from '../graphql/types'
import ResourceCards from '../components/learn/ResourceCards'
import { SEO } from '../components/SEO'

export default function AllResources() {
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
        topic {
          title
          slug
        }
        firstPageSlugsPath
        verified
      }
    }
  `
  const [{ data, fetching, error }] = useQuery({
    query: ALL_RESOURCES_QUERY,
  })

  if (fetching) return <Skeleton active={true} />
  if (error) return <InternalServerError message={error.message} />

  const resources = data.allResources as Resource[]

  return (
    <>
      <SEO title={'All Resources'} />
      <ResourceCards resources={resources} />
    </>
  )
}
