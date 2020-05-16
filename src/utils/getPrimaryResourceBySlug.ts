import { client } from './urqlClient'

export async function getPrimaryResourceBySlug({
  resourceSlug,
}: {
  resourceSlug: string
}) {
  const PRIMARY_RESOURCE_BY_SLUG = `
    query($resourceSlug: String!) {
      primaryResourceBySlug(resourceSlug: $resourceSlug) {
        id
        title
        description
        slug
        baseSectionId
        user {
          username
        }
      }
    }
  `
  const result = await client
    .query(PRIMARY_RESOURCE_BY_SLUG, {
      resourceSlug,
    })
    .toPromise()

  if (result.error) {
    return {
      error: true,
      message: result.error.message,
    }
  }
  return result.data.primaryResourceBySlug
}
