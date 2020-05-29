import { client } from './urqlClient'

export async function createResource({
  title,
  topicId,
  description,
  slug,
}: {
  title: string
  topicId: string
  description: string
  slug: string
}) {
  const CREATE_RESOURCE_MUTATION = `
    mutation($data: CreateResourceInput!) {
      createResourceV2(data: $data) {
        id
      }
    }
  `
  const result = await client
    .mutation(CREATE_RESOURCE_MUTATION, {
      data: {
        title,
        topicId,
        description,
        slug,
      },
    })
    .toPromise()
  if (result.error) {
    return {
      error: true,
      message: result.error.message,
    }
  }
  return result.data.createResourceV2
}
