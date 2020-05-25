import { client } from './urqlClient'

export async function savePageContent({
  pageContent,
  sectionId,
}: {
  pageContent: string
  sectionId: string
}) {
  const SAVE_PAGE_MUTATION = `
    mutation($data: SavePageInput!) {
      savePage(data: $data) {
        id
        page {
          id
          content
        }
      }
    }
  `
  const result = await client
    .mutation(SAVE_PAGE_MUTATION, {
      data: {
        pageContent,
        sectionId,
      },
    })
    .toPromise()

  if (result.error) {
    return {
      error: true,
      message: result.error.message,
    }
  }
  return result.data.savePage
}
