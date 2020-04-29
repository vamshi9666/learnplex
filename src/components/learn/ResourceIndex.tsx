import React from 'react'

import { Section } from '../../graphql/types'
import SectionItems from './SectionItems'

export default function ResourceIndex({
  baseSectionId,
  sectionsMap,
}: {
  baseSectionId: string
  sectionsMap: Map<string, Section>
}) {
  console.log({ sectionsMap, baseSectionId })
  const baseSection = sectionsMap.get(baseSectionId)!
  return (
    <SectionItems sections={baseSection.sections} sectionsMap={sectionsMap} />
  )
}
