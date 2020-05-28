import { client } from './urqlClient'

export async function getSectionBySlugsPathAndBaseSectionId({
  slugsPath,
  baseSectionId,
}: {
  slugsPath: string
  baseSectionId: string
}) {
  const SECTION_BY_SLUGS_PATH = `
    query($slugsPath: String!, $baseSectionId: String!) {
      sectionBySlugsPathAndBaseSectionId(slugsPath: $slugsPath, baseSectionId: $baseSectionId) {
        id
        title
        page {
          content
        }
        previousSectionPath
        nextSectionPath
        isPage
        pathWithSectionIds
      }
    }
  `
  const result = await client
    .query(SECTION_BY_SLUGS_PATH, {
      slugsPath,
      baseSectionId,
    })
    .toPromise()

  if (result.error) {
    return {
      error: false,
      message: result.error.message,
    }
  }
  return result.data.sectionBySlugsPathAndBaseSectionId
}
