import React from 'react'

import { Section } from '../../graphql/types'
import SectionItemsEdit from './SectionItemsEdit'

export default function ResourceIndexEdit({
  baseSectionId,
  sectionsMap,
}: {
  baseSectionId: string
  sectionsMap: Map<string, Section>
}) {
  console.log({ sectionsMap, baseSectionId })
  const baseSection = sectionsMap.get(baseSectionId)!
  return (
    <SectionItemsEdit
      sections={baseSection.sections}
      sectionsMap={sectionsMap}
      parentSection={baseSection}
      topLevel={true}
    />
  )
}
