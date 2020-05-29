import { Timeline } from 'antd'
import React from 'react'
import SectionItemV2 from './SectionItem'

import { Section } from '../../../graphql/types'

interface Props {
  sections: Section[]
  sectionsMap: Record<string, Section>
  topLevel?: boolean
  resourceSlug: string
}

export default function SectionItemsV2({
  sections,
  sectionsMap,
  topLevel,
  resourceSlug,
}: Props) {
  const sortedSections = sections.sort(
    (section: Section, anotherSection: Section) => {
      return section.order > anotherSection.order
        ? 1
        : section.order < anotherSection.order
        ? -1
        : 0
    }
  )

  return (
    <Timeline className={`${topLevel ? 'p-5' : ''} timeline-bg`}>
      {sortedSections.map((section: Section) => (
        <SectionItemV2
          key={section.id}
          sectionId={section.id}
          sectionsMap={sectionsMap}
          resourceSlug={resourceSlug}
        />
      ))}
    </Timeline>
  )
}
