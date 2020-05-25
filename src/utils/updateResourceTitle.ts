import { client } from './urqlClient'

export async function updateResourceTitle({
  title,
  resourceId,
}: {
  title: string
  resourceId: string
}) {
  const UPDATE_RESOURCE_TITLE_MUTATION = `
    mutation($resourceId: String!, $title: String!) {
      updateResourceTitle(resourceId: $resourceId, title: $title) {
        id
        title
      } 
    }
  `
  const result = await client
    .mutation(UPDATE_RESOURCE_TITLE_MUTATION, {
      resourceId,
      title,
    })
    .toPromise()

  if (result.error) {
    return {
      error: true,
      message: result.error.message,
    }
  }

  return result.data.updateResourceTitle
}
