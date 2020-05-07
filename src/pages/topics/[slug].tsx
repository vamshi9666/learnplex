import React from 'react'
import { Skeleton } from 'antd'
import { useQuery } from 'urql'
import { useRouter } from 'next/router'

import { Resource } from '../../graphql/types'
import ResourceCards from '../../components/learn/ResourceCards'
import PageNotFound from '../../components/result/PageNotFound'

export default function TopicResources() {
  const router = useRouter()
  const RESOURCES_BY_TOPIC_QUERY = `
    query($slug: String!) {
      resourcesByTopic(slug: $slug) {
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
    query: RESOURCES_BY_TOPIC_QUERY,
    variables: {
      slug: router.query.slug,
    },
  })

  if (fetching) return <Skeleton active={true} />
  if (error) return <PageNotFound />

  const resources = data.resourcesByTopic as Resource[]

  return (
    <ResourceCards
      resources={resources}
      description={`${router.query.slug} doesn't have any resources yet.`}
    />
  )
}
