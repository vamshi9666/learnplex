import React from 'react'
import { Timeline } from 'antd'

import { Section } from '../../graphql/types'
import SectionItem from './SectionItem'

export default function SectionsItems({
  sections,
  sectionsMap,
  topLevel = false,
  username,
}: {
  sections: Section[]
  sectionsMap: Map<string, Section>
  topLevel?: boolean
  username: string
}) {
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
        <SectionItem
          key={section.id}
          sectionId={section.id}
          sectionsMap={sectionsMap}
          username={username}
        />
      ))}
    </Timeline>
  )
}
