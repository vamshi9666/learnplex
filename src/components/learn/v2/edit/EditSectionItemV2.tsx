import { Timeline } from 'antd'
import React, { useContext, useState } from 'react'
import { RightOutlined, DownOutlined } from '@ant-design/icons'
import { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd'

import EditSectionItemsV2 from './EditSectionItemsV2'
import EditSectionItemFormV2 from './EditSectionItemFormV2'
import { SectionsContext } from '../../../../lib/contexts/SectionsContext'

interface Props {
  currentSectionId: string
  dragHandleProps: DraggableProvidedDragHandleProps | undefined
}

export default function EditSectionItemV2({
  currentSectionId,
  dragHandleProps,
}: Props) {
  const { sectionsMap } = useContext(SectionsContext)
  const currentSection = sectionsMap[currentSectionId]
  const [collapseSubSections, setCollapseSubSections] = useState(true)

  return (
    <Timeline.Item
      className={'font-large'}
      dot={
        !currentSection.isPage && (
          <span
            className={'cursor-pointer'}
            onClick={() => setCollapseSubSections((a) => !a)}
          >
            {collapseSubSections ? <RightOutlined /> : <DownOutlined />}
          </span>
        )
      }
    >
      <EditSectionItemFormV2
        currentSectionId={currentSectionId}
        dragHandleProps={dragHandleProps}
      />
      {!collapseSubSections && !currentSection.isPage && (
        <EditSectionItemsV2
          sections={currentSection.sections}
          parentSectionId={currentSectionId}
        />
      )}
    </Timeline.Item>
  )
}
