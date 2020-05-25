import { client } from './urqlClient'

export async function addSection({
  title,
  content,
  parentSectionId,
}: {
  title: string
  content: string
  parentSectionId: string
}) {
  const ADD_SECTION_MUTATION = `
    mutation($data: AddSectionInput!) {
      addSection(data: $data) {
        id
        title
        slug
      }
    }
  `
  const result = await client
    .mutation(ADD_SECTION_MUTATION, {
      data: {
        title,
        parentSectionId,
        content,
      },
    })
    .toPromise()

  if (result.error) {
    return {
      error: true,
      message: result.error.message,
    }
  }

  return result.data.addSection
}
