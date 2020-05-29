import { client } from './urqlClient'

export async function deleteSection({ sectionId }: { sectionId: string }) {
  const DELETE_SECTION_MUTATION = `
    mutation($sectionId: String!) {
      deleteSection(sectionId: $sectionId)
    }
  `
  const result = await client
    .mutation(DELETE_SECTION_MUTATION, {
      sectionId,
    })
    .toPromise()
  if (result.error) {
    return {
      error: true,
      message: result.error.message,
    }
  }
  return result.data.deleteSection
}
