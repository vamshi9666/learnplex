import { useQuery } from 'urql'
import React from 'react'
import { Skeleton } from 'antd'

import { useUser } from '../../lib/hooks/useUser'
import NotAuthenticated from '../../components/result/NotAuthenticated'
import InternalServerError from '../../components/result/InternalServerError'
import { Progress } from '../../graphql/types'
import ResourceCards from '../../components/learn/ResourceCards'

export default function Enrollments() {
  const USER_PROGRESS_LIST_QUERY = `
    query {
      userProgressList {
        resource {
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
        }
      }
    }
  `
  const [
    { data: progressData, fetching: progressFetching, error: progressError },
  ] = useQuery({
    query: USER_PROGRESS_LIST_QUERY,
  })
  const { fetching, error } = useUser()

  if (fetching || progressFetching) {
    return <Skeleton active={true} />
  }

  if (error) {
    return <NotAuthenticated />
  }

  if (progressError) {
    return <InternalServerError />
  }

  const progressList = progressData.userProgressList
  const resources = progressList.map((progress: Progress) => progress.resource)

  return <ResourceCards resources={resources} />
}
