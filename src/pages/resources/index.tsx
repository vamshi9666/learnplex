import React from 'react'
import { Skeleton } from 'antd'
import { useQuery } from 'urql'

import InternalServerError from '../../components/result/InternalServerError'
import { Resource } from '../../graphql/types'
import ResourceCards from '../../components/learn/ResourceCards'

export default function VerifiedResources() {
  const ALL_VERIFIED_RESOURCES_QUERY = `
    query {
      allVerifiedResources {
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
        verified
        published
        createdDate
      }
    }
  `
  const [{ data, fetching, error }] = useQuery({
    query: ALL_VERIFIED_RESOURCES_QUERY,
  })

  if (fetching) return <Skeleton active={true} />
  if (error) return <InternalServerError message={error.message} />

  const resources = data.allVerifiedResources as Resource[]

  return <ResourceCards resources={resources} />
}
