import { Client } from '@urql/core'
import { message } from 'antd'

import { client as defaultClient } from './urqlClient'

export async function checkIfEnrolledQuery({
  resourceId,
  client = defaultClient,
}: {
  resourceId: string
  client?: Client
}) {
  const HAS_ENROLLED_QUERY = `
    query($resourceId: String!) {
      hasEnrolledByResourceId(resourceId: $resourceId)
    }
  `
  const result = await client
    .query(HAS_ENROLLED_QUERY, {
      resourceId,
    })
    .toPromise()

  if (result.error) {
    return { error: true, message: result.error.message }
  }

  return result.data.hasEnrolledByResourceId
}

export async function hasCompletedCurrentSection({
  client = defaultClient,
  resourceId,
  sectionId,
}: {
  client?: Client
  resourceId: string
  sectionId: string
}) {
  const HAS_COMPLETED_SECTION = `
    query($resourceId: String!, $sectionId: String!) {
      hasCompletedSection(resourceId: $resourceId, sectionId: $sectionId)
    }
  `
  const result = await client
    .query(HAS_COMPLETED_SECTION, {
      resourceId,
      sectionId,
    })
    .toPromise()
  console.log({ result })
  if (result.error) {
    return { error: true, message: result.error.message }
  }

  return result.data.hasCompletedSection
}

export async function startProgress({
  client = defaultClient,
  resourceId,
}: {
  client?: Client
  resourceId: string
}) {
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
  const result = await client
    ?.mutation(START_PROGRESS_MUTATION, {
      resourceId,
    })
    .toPromise()

  if (result.error) {
    console.log({ startProgressError: result.error })
    message.error('Something went wrong. Please try after sometime.')
    return {
      error: true,
      message: result.error.message,
    }
  } else {
    console.log({ result })
    return result.data.startProgress
  }
}
