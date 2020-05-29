import { client } from './urqlClient'

export async function updateResourceDescription({
  description,
  resourceId,
}: {
  description: string
  resourceId: string
}) {
  const UPDATE_RESOURCE_DESCRIPTION_MUTATION = `
    mutation($resourceId: String!, $description: String!) {
      updateResourceDescription(resourceId: $resourceId, description: $description) {
        id
        title
        description
      } 
    }
  `
  const result = await client
    .mutation(UPDATE_RESOURCE_DESCRIPTION_MUTATION, {
      resourceId,
      description,
    })
    .toPromise()

  if (result.error) {
    return {
      error: true,
      message: result.error.message,
    }
  }

  return result.data.updateResourceDescription
}
