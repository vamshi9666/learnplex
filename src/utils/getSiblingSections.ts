import { client } from './urqlClient'

export async function getSiblingSections({ sectionId }: { sectionId: string }) {
  const SIBLING_SECTIONS_QUERY = `
    query($sectionId: String!) {
      siblingSections(sectionId: $sectionId) {
        id
        title
        slug
        order
        slugsPath
        hasSubSections
        isPage
        depth
        firstLeafSlugsPath
        sections {
          id
          order
        }
      }
    }
  `
  const result = await client
    .query(SIBLING_SECTIONS_QUERY, {
      sectionId,
    })
    .toPromise()

  if (result.error) {
    return {
      error: false,
      message: result.error.message,
    }
  }
  return result.data.siblingSections
}
