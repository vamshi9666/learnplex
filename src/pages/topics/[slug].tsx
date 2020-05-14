import React from 'react'
import { Skeleton } from 'antd'
import { useQuery } from 'urql'
import { useRouter } from 'next/router'
import { pascalCase } from 'pascal-case'

import { Resource } from '../../graphql/types'
import ResourceCards from '../../components/learn/ResourceCards'
import PageNotFound from '../../components/result/PageNotFound'
import { SEO } from '../../components/SEO'

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
        firstPageSlugsPath
        verified
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
    <>
      <SEO title={`Resources | ${pascalCase(router.query.slug as string)}`} />
      <ResourceCards resources={resources} />
    </>
  )
}
