import { Timeline } from 'antd'
import React, { useState } from 'react'
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons'

import { Section } from '../../graphql/types'
import SectionItem from './SectionItem'
import NewSectionModal from './NewSectionModal'

export default function SectionItems({
  sections,
  sectionsMap,
  parentSection,
}: {
  sections: Section[]
  sectionsMap: Map<string, Section>
  parentSection: Section
}) {
  const [show, setShow] = useState(false)
  if (!sections) return <p>loading...</p>
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
    <Timeline>
      {sortedSections.map((section: Section) => (
        <SectionItem
          key={section.id}
          sectionId={section.id}
          sectionsMap={sectionsMap}
        />
      ))}
      <Timeline.Item
        dot={
          show ? (
            <MinusCircleOutlined
              className={'font-large'}
              onClick={() => setShow(false)}
            />
          ) : (
            <PlusCircleOutlined
              className={'font-large'}
              onClick={() => setShow(true)}
            />
          )
        }
      >
        <NewSectionModal
          parentSectionId={parentSection.id}
          show={show}
          setShow={setShow}
          sectionsMap={sectionsMap}
        />
      </Timeline.Item>
    </Timeline>
  )
}
