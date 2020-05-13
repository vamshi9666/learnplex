import SectionItems from './SectionItems'
import React from 'react'
import { Button, Skeleton, Tooltip } from 'antd'
import { useMutation, useQuery } from 'urql'
import { useRouter } from 'next/router'
import NProgress from 'nprogress'

import { Section } from '../../graphql/types'
import { useSections } from '../../lib/hooks/useSections'
import { useUser } from '../../lib/hooks/useUser'

export default function ViewResourceIndex({
  baseSectionId,
  sectionsMap,
  username,
}: {
  baseSectionId: string
  sectionsMap: Map<string, Section>
  username: string
}) {
  const baseSection = sectionsMap.get(baseSectionId)!
  const HAS_ENROLLED_QUERY = `
    query($username: String!, $resourceSlug: String!) {
      hasEnrolled(username: $username, resourceSlug: $resourceSlug)
    }
  `
  const router = useRouter()
  const resourceSlug = router.query.resource as string
  const { resourceId } = useSections({ resourceSlug, username })

  const START_PROGRESS_MUTATION = `
    mutation($resourceId: String!) {
      startProgress(resourceId: $resourceId) {
        id
        resource {
          slug
          user {
            username
          }
          firstPageSlugsPath
        }
      }
    }
  `

  const [, startProgressMutation] = useMutation(START_PROGRESS_MUTATION)

  const [{ data, fetching }, reExecuteHasEnrolledQuery] = useQuery({
    query: HAS_ENROLLED_QUERY,
    variables: {
      username,
      resourceSlug,
    },
  })

  const { user, fetching: userFetching } = useUser()

  if (fetching || userFetching) {
    return <Skeleton active={true} />
  }

  const isLoggedIn = !!user

  const startProgress = () => {
    NProgress.start()
    startProgressMutation({ resourceId }).then(async (result) => {
      if (result.error) {
        console.log({ startProgressError: result.error })
      } else {
        console.log({ result })
        reExecuteHasEnrolledQuery()
      }
    })
    NProgress.done()
  }

  return (
    <>
      <SectionItems
        sections={baseSection.sections}
        sectionsMap={sectionsMap}
        topLevel={true}
        username={username}
      />
      <div className={'p-5'}>
        {!isLoggedIn ? (
          <Tooltip title={'Login to start learning and track your progress'}>
            <Button type={'primary'} disabled={true}>
              Start Learning
            </Button>
          </Tooltip>
        ) : !data?.hasEnrolled ? (
          <Tooltip title={'You can track your progress in your profile'}>
            <Button type={'primary'} onClick={() => startProgress()}>
              Start Learning
            </Button>
          </Tooltip>
        ) : (
          <Tooltip title={'You can track your progress in your profile'}>
            <Button type={'primary'}>Already Enrolled</Button>
          </Tooltip>
        )}
      </div>
    </>
  )
}
