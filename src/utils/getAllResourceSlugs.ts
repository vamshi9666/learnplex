import { client } from './urqlClient'

export async function getAllResourceSlugs() {
  const RESOURCES_QUERY = `
    query {
      resources {
        slug
      }
    }
  `
  const result = await client.query(RESOURCES_QUERY).toPromise()
  if (result.error) {
    return {
      error: true,
      message: result.error.message,
    }
  }
  return result.data.resources
}
