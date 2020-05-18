import { Client } from '@urql/core'

import { client as defaultClient } from './urqlClient'

export async function getAllResources({
  client = defaultClient,
}: {
  client?: Client
}) {
  const ALL_RESOURCES_FOR_ADMIN_QUERY = `
    query {
      allResourcesForAdmin {
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
        published
        createdDate
      }
    }
  `
  const result = await client.query(ALL_RESOURCES_FOR_ADMIN_QUERY).toPromise()
  if (result.error) {
    return {
      error: true,
      message: result.error.message,
    }
  }
  return result.data.allResourcesForAdmin
}
