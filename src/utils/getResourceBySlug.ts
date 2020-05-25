import { Client } from '@urql/core'

import { client as defaultClient } from './urqlClient'

export async function getResourceBySlug({
  client = defaultClient,
  resourceSlug,
}: {
  client?: Client
  resourceSlug: string
}) {
  const RESOURCE_BY_SLUG = `
    query($resourceSlug: String!) {
      resourceBySlug(resourceSlug: $resourceSlug) {
        id
        title
        description
        slug
        baseSectionId
        user {
          username
        }
        verified
      }
    }
  `
  const result = await client
    .query(RESOURCE_BY_SLUG, {
      resourceSlug,
    })
    .toPromise()

  if (result.error) {
    return {
      error: true,
      message: result.error.message,
    }
  }
  return result.data.resourceBySlug
}
