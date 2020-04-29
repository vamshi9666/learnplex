import { Timeline } from 'antd'
import React from 'react'

import { Section } from '../../graphql/types'
import SectionItems from './SectionItems'
import SectionItemForm from './SectionItemForm'

export default function SectionItem({
  sectionId,
  sectionsMap,
}: {
  sectionId: string
  sectionsMap: Map<string, Section>
}) {
  const currentSection = sectionsMap.get(sectionId)!
  if (!currentSection) return <p>loading...</p>
  return (
    <Timeline.Item className={'pb-1'}>
      <SectionItemForm section={currentSection} sectionsMap={sectionsMap} />
      {!currentSection.isPage && (
        <SectionItems
          sections={currentSection.sections}
          sectionsMap={sectionsMap}
        />
      )}
    </Timeline.Item>
  )
}
