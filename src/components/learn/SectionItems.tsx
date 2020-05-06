import { Skeleton, Timeline } from 'antd'
import React, { useState } from 'react'
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd'
import NProgress from 'nprogress'
import { useRouter } from 'next/router'

import { Section } from '../../graphql/types'
import SectionItem from './SectionItem'
import NewSectionButton from './NewSectionButton'
import { useSections } from '../../lib/hooks/useSections'

export default function SectionItems({
  sections,
  sectionsMap,
  parentSection,
  topLevel = false,
}: {
  sections: Section[]
  sectionsMap: Map<string, Section>
  parentSection: Section
  topLevel?: boolean
}) {
  const [show, setShow] = useState(false)
  const router = useRouter()
  const resourceSlug = router.query.resource as string
  const username = router.query.username as string
  const { reorderSections } = useSections({ resourceSlug, username })

  if (!sections) return <Skeleton active={true} />

  const sortedSections = sections.sort(
    (section: Section, anotherSection: Section) => {
      return section.order > anotherSection.order
        ? 1
        : section.order < anotherSection.order
        ? -1
        : 0
    }
  )

  const reorder = async ({ result }: { result: DropResult }) => {
    NProgress.start()
    await reorderSections({
      result,
      parentSectionId: parentSection.id,
      sections: sortedSections,
    })
    NProgress.done()
  }

  return (
    <Timeline className={`${topLevel ? 'p-5' : ''} timeline-bg`}>
      <DragDropContext
        onDragEnd={(result) =>
          reorder({
            result,
          })
        }
      >
        <Droppable droppableId={`droppable-${parentSection.id}`}>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {sortedSections.map((section: Section, index: number) => (
                <Draggable
                  key={`draggable-${section.id}`}
                  draggableId={`draggable-${section.id}`}
                  index={index}
                >
                  {(provided1) => (
                    <div ref={provided1.innerRef} {...provided1.draggableProps}>
                      <SectionItem
                        key={section.id}
                        sectionId={section.id}
                        sectionsMap={sectionsMap}
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

      <NewSectionButton
        show={show}
        setShow={setShow}
        parentSectionId={parentSection.id}
        sectionsMap={sectionsMap}
      />
    </Timeline>
  )
}
