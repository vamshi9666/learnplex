import { client } from './urqlClient'

export async function reorderSections({
  sourceOrder,
  destinationOrder,
  parentSectionId,
}: {
  sourceOrder: number
  destinationOrder: number
  parentSectionId: string
}) {
  const REORDER_SECTIONS_MUTATION = `
    mutation($data: ReorderSectionsInput!) {
      reorderSections(data: $data) {
        id
        title
        sections {
          id
          title
        }
      }
    }
  `
  const result = await client
    .mutation(REORDER_SECTIONS_MUTATION, {
      data: {
        sourceOrder,
        destinationOrder,
        parentSectionId,
      },
    })
    .toPromise()
  if (result.error) {
    return {
      error: true,
      message: result.error.message,
    }
  }
  return result.data.reorderSections
}
