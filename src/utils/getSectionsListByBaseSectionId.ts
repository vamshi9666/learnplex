import { Client } from '@urql/core'

import { client as defaultClient } from './urqlClient'
import { Section } from '../graphql/types'

export default async function getSectionsListByBaseSectionId({
  baseSectionId,
  client = defaultClient,
}: {
  baseSectionId: string
  client?: Client
}) {
  const SECTIONS_LIST_BY_BASE_SECTION_ID = `
    query($baseSectionId: String!) {
      sectionsListByBaseSectionId(baseSectionId: $baseSectionId) {
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
        firstLeafSlugsPath
      }
    }
  `
  const result = await client
    .query(SECTIONS_LIST_BY_BASE_SECTION_ID, {
      baseSectionId,
    })
    .toPromise()
  if (result.error) {
    return {
      error: true,
      message: result.error.message,
    }
  }
  return result.data.sectionsListByBaseSectionId
}

export function getSectionsMapFromSectionsList({
  sectionsList,
}: {
  sectionsList: Section[]
}) {
  const sectionsMap = {} as Record<string, Section>
  for (const section of sectionsList) {
    sectionsMap[section.id] = section
  }
  return sectionsMap
}
