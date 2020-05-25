import { client } from './urqlClient'

export async function updateSectionTitle({
  title,
  sectionId,
}: {
  title: string
  sectionId: string
}) {
  const UPDATE_SECTION_TITLE_MUTATION = `
    mutation($title: String!, $sectionId: String!) {
      updateSectionTitle(title: $title, sectionId: $sectionId) {
        id
        title
        slug
        order
        slugsPath
        hasSubSections
        isPage
        sections {
          id
          order
        }
        parentSectionId
      }
    }
  `
  const result = await client
    .mutation(UPDATE_SECTION_TITLE_MUTATION, {
      title,
      sectionId,
    })
    .toPromise()
  if (result.error) {
    return {
      error: true,
      message: result.error.message,
    }
  }
  return result.data.updateSectionTitle
}
