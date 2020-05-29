import { Client } from '@urql/core'

import { client as defaultClient } from './urqlClient'
import { Section } from '../graphql/types'

export async function getUserProgressByResourceId({
  client = defaultClient,
  resourceId,
}: {
  client?: Client
  resourceId: string
}) {
  const USER_PROGRESS_BY_RESOURCE_ID_QUERY = `
    query($resourceId: String!) {
      userProgressByResourceId(resourceId: $resourceId) {
        id
        completedSections {
          id
        }
      }
    }
  `
  const result = await client
    .query(USER_PROGRESS_BY_RESOURCE_ID_QUERY, {
      resourceId,
    })
    .toPromise()
  if (result.error) {
    return {
      error: false,
      message: result.error.message,
    }
  }
  return result.data.userProgressByResourceId.completedSections.map(
    (section: Section) => section.id
  )
}
