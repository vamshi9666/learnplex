import { Client } from '@urql/core'

import { client as defaultClient } from './urqlClient'

export async function togglePublishStatus({
  resourceId,
  client = defaultClient,
}: {
  resourceId: string
  client?: Client
}) {
  const TOGGLE_PUBLISH_STATUS_MUTATION = `
    mutation($resourceId: String!) {
      togglePublishStatus(resourceId: $resourceId) {
        id
        title
        description
        slug
        baseSectionId
        user {
          username
        }
        verified
        published
      }
    }
  `
  const result = await client
    ?.mutation(TOGGLE_PUBLISH_STATUS_MUTATION, {
      resourceId,
    })
    .toPromise()

  if (result.error) {
    console.log({ togglePublishStatusError: result.error.message })
    return {
      error: true,
      message: result.error.message,
    }
  } else {
    console.log({ result })
    return result.data.togglePublishStatus
  }
}

export async function togglePrimaryStatus({
  resourceId,
  client = defaultClient,
}: {
  resourceId: string
  client?: Client
}) {
  const TOGGLE_PRIMARY_STATUS_MUTATION = `
    mutation($resourceId: String!) {
      togglePrimaryStatus(resourceId: $resourceId) {
        id
      }
    }
  `
  const result = await client
    ?.mutation(TOGGLE_PRIMARY_STATUS_MUTATION, {
      resourceId,
    })
    .toPromise()

  if (result.error) {
    console.log({ togglePrimaryStatusError: result.error.message })
    return {
      error: true,
      message: result.error.message,
    }
  } else {
    console.log({ result })
    return result.data.togglePrimaryStatus
  }
}
