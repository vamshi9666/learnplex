import { client } from './urqlClient'

export async function repopulateAllSlugs() {
  const POPULATE_SLUGS_FOR_ALL_RESOURCES_MUTATION = `
    mutation {
      populateSlugsForAllResources
    }
  `
  const result = await client
    .mutation(POPULATE_SLUGS_FOR_ALL_RESOURCES_MUTATION)
    .toPromise()
  if (result.error) {
    return {
      error: true,
      message: result.error.message,
    }
  }
  return result.data.populateSlugsForAllResources
}

export async function populateSlugsForResource({
  resourceId,
}: {
  resourceId: string
}) {
  const POPULATE_SLUGS_FOR_RESOURCE_MUTATION = `
    mutation($resourceId: String!) {
      populateSlugsByResourceId(resourceId: $resourceId)
    }
  `
  const result = await client
    .mutation(POPULATE_SLUGS_FOR_RESOURCE_MUTATION, {
      resourceId,
    })
    .toPromise()
  if (result.error) {
    return {
      error: true,
      message: result.error.message,
    }
  }
  return result.data.populateSlugsByResourceId
}
