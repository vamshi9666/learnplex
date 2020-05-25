import React, { useContext } from 'react'
import { message, Timeline } from 'antd'
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd'

import EditSectionItemV2 from './EditSectionItemV2'
import { Section } from '../../../../graphql/types'
import NewSectionV2 from './NewSectionV2'
import { reorderSections as reorderSectionsInDB } from '../../../../utils/reorderSections'
import { SectionsContext } from '../../../../lib/contexts/SectionsContext'

interface Props {
  sections: Section[]
  parentSectionId: string
  topLevel?: boolean
}

export default function EditSectionItemsV2({
  sections,
  parentSectionId,
  topLevel = false,
}: Props) {
  const { reValidate } = useContext(SectionsContext)
  const sortedSections = sections.sort((a, b) =>
    a.order > b.order ? 1 : a.order < b.order ? -1 : 0
  )

  const reorderSections = async ({ result }: { result: DropResult }) => {
    if (!result.destination) {
      return
    }
    const sourceOrder = sections[result.source.index].order
    const destinationOrder = sections[result.destination.index].order
    const mutationResult = await reorderSectionsInDB({
      sourceOrder,
      destinationOrder,
      parentSectionId,
    })
    if (mutationResult.error) {
      message.error(mutationResult.message)
      return
    }
    await reValidate()
    message.success('Reordered the sections successfully')
  }

  return (
    <Timeline
      className={`edit-resource-timeline timeline-bg ${topLevel ? 'p-5' : ''}`}
    >
      <DragDropContext onDragEnd={(result) => reorderSections({ result })}>
        <Droppable droppableId={`droppable-${parentSectionId}`}>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {sortedSections.map((section, index) => (
                <Draggable
                  key={`draggable-${section.id}`}
                  draggableId={`draggable-${section.id}`}
                  index={index}
                >
                  {(provided1) => (
                    <div ref={provided1.innerRef} {...provided1.draggableProps}>
                      <EditSectionItemV2
                        currentSectionId={section.id}
                        dragHandleProps={provided1.dragHandleProps}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <NewSectionV2 parentSectionId={parentSectionId} />
    </Timeline>
  )
}
