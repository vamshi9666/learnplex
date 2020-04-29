import { Button, Timeline } from 'antd'
import React, { useState } from 'react'
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons'

import { Section } from '../../graphql/types'
import SectionItem from './SectionItem'

export default function SectionItems({
  sections,
  sectionsMap,
}: {
  sections: Section[]
  sectionsMap: Map<string, Section>
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
        {show && <Button type={'primary'}>Add</Button>}
      </Timeline.Item>
    </Timeline>
  )
}
