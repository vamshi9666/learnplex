import { Client } from '@urql/core'

import { client as defaultClient } from './urqlClient'

export async function getSiblingSections({
  sectionId,
  client = defaultClient,
}: {
  sectionId: string
  client?: Client
}) {
  const SIBLING_SECTIONS_QUERY = `
    query($sectionId: String!) {
      siblingSections(sectionId: $sectionId) {
        id
        title
        slug
        order
        slugsPath
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
