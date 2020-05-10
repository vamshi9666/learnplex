import { Skeleton, Timeline } from 'antd'
import React, { useState } from 'react'
import { RightOutlined, DownOutlined } from '@ant-design/icons'
import { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd'

import { Section } from '../../graphql/types'
import SectionItemsEdit from './SectionItemsEdit'
import SectionItemForm from './SectionItemForm'

export default function SectionItemEdit({
  sectionId,
  sectionsMap,
  dragHandleProps,
}: {
  sectionId: string
  sectionsMap: Map<string, Section>
  dragHandleProps: DraggableProvidedDragHandleProps | undefined
}) {
  const currentSection = sectionsMap.get(sectionId)!
  const [isOpen, setOpen] = useState(false)
  if (!currentSection) return <Skeleton active={true} />

  const toggleOpen = () => {
    setOpen(!isOpen)
  }
  return (
    <Timeline.Item
      className={'font-large'}
      dot={
        !currentSection.isPage && (
          <span className={'cursor-pointer'} onClick={() => toggleOpen()}>
            {isOpen ? <DownOutlined /> : <RightOutlined />}
          </span>
        )
      }
    >
      <SectionItemForm
        section={currentSection}
        sectionsMap={sectionsMap}
        dragHandleProps={dragHandleProps}
      />
      {isOpen && !currentSection.isPage && (
        <SectionItemsEdit
          sections={currentSection.sections}
          sectionsMap={sectionsMap}
          parentSection={currentSection}
        />
      )}
    </Timeline.Item>
  )
}
