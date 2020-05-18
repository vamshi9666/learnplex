import { Client } from '@urql/core'

import { client as defaultClient } from './urqlClient'

export async function getResourceByUsernameAndSlug({
  client = defaultClient,
  username,
  resourceSlug,
}: {
  client?: Client
  username: string
  resourceSlug: string
}) {
  const RESOURCE_BY_OWNER_USERNAME_AND_SLUG = `
    query($username: String!, $resourceSlug: String!) {
      resourceByOwnerUsernameAndSlug(username: $username, resourceSlug: $resourceSlug) {
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
    .query(RESOURCE_BY_OWNER_USERNAME_AND_SLUG, {
      username,
      resourceSlug,
    })
    .toPromise()

  if (result.error) {
    return {
      error: true,
      message: result.error.message,
    }
  }
  return result.data.resourceByOwnerUsernameAndSlug
}
