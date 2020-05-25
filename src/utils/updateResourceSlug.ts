import { client } from './urqlClient'

export async function updateResourceSlug({
  slug,
  resourceId,
}: {
  slug: string
  resourceId: string
}) {
  const UPDATE_RESOURCE_SLUG_MUTATION = `
    mutation($resourceId: String!, $updatedSlug: String!) {
      updateResourceSlug(resourceId: $resourceId, updatedSlug: $updatedSlug) {
        id
        slug
      } 
    }
  `
  const result = await client
    .mutation(UPDATE_RESOURCE_SLUG_MUTATION, {
      resourceId,
      updatedSlug: slug,
    })
    .toPromise()

  if (result.error) {
    return {
      error: true,
      message: result.error.message,
    }
  }

  return result.data.updateResourceSlug
}
