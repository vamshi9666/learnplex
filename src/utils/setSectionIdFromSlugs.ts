import React from 'react'

import { Section } from '../graphql/types'

const util = ({
  sectionIds,
  index,
  sectionsMap,
  slugs,
  setCurrentSectionId,
}: {
  sectionIds: string[]
  index: number
  sectionsMap: Map<string, Section>
  slugs: string[]
  setCurrentSectionId: React.Dispatch<React.SetStateAction<string>>
}) => {
  sectionIds.forEach((sectionId) => {
    if (sectionsMap.get(sectionId)!.slug === slugs[index]) {
      if (index === slugs.length - 1) {
        console.log({ section: sectionsMap.get(sectionId) })
        setCurrentSectionId(sectionId)
        return
      }
      const nextSectionIds = sectionsMap
        .get(sectionId)!
        .sections.map((section) => section.id)
      util({
        sectionIds: nextSectionIds,
        index: index + 1,
        sectionsMap,
        slugs,
        setCurrentSectionId,
      })
      return
    }
  })
}

const setCurrentSectionIdFromSlugs = ({
  baseSectionId,
  sectionsMap,
  slugs,
  setCurrentSectionId,
}: {
  baseSectionId: string
  sectionsMap: Map<string, Section>
  slugs: string[]
  setCurrentSectionId: React.Dispatch<React.SetStateAction<string>>
}) => {
  const baseSection = sectionsMap.get(baseSectionId)!
  util({
    sectionIds: baseSection.sections.map((section) => section.id),
    index: 0,
    sectionsMap,
    slugs,
    setCurrentSectionId,
  })
}

export { setCurrentSectionIdFromSlugs }
