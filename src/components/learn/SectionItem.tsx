import { Timeline } from 'antd'
import React, { useState } from 'react'
import { RightOutlined, DownOutlined } from '@ant-design/icons'

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
  const [isOpen, setOpen] = useState(false)
  if (!currentSection) return <p>loading...</p>

  const toggleOpen = () => {
    setOpen(!isOpen)
  }
  return (
    <Timeline.Item
      className={'pb-1 font-large'}
      dot={
        currentSection.hasSubSections && (
          <span className={'cursor-pointer'} onClick={() => toggleOpen()}>
            {isOpen ? <DownOutlined /> : <RightOutlined />}
          </span>
        )
      }
    >
      <SectionItemForm section={currentSection} sectionsMap={sectionsMap} />
      {isOpen && !currentSection.isPage && (
        <SectionItems
          sections={currentSection.sections}
          sectionsMap={sectionsMap}
          parentSection={currentSection}
        />
      )}
    </Timeline.Item>
  )
}
