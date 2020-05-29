import { Section } from '../graphql/types'

function getExtremeSubSectionIds({
  sectionId,
  sectionsMap,
}: {
  sectionId: string
  sectionsMap: Record<string, Section>
}): { beginning: string; ending: string } {
  const section = sectionsMap[sectionId]
  if (!section) {
    return { beginning: '', ending: '' }
  }
  if (section.sections.length === 0) {
    return {
      beginning: section.id,
      ending: section.id,
    }
  }
  const sortedSections = section.sections.sort((a, b) =>
    a.order > b.order ? 1 : a.order < b.order ? -1 : 0
  )
  return {
    beginning: getExtremeSubSectionIds({
      sectionId: sortedSections[0].id,
      sectionsMap,
    }).beginning,
    ending: getExtremeSubSectionIds({
      sectionId: sortedSections[sortedSections.length - 1].id,
      sectionsMap,
    }).ending,
  }
}

const getNeighbourSectionIds = ({
  sectionId,
  baseSectionId,
  sectionsMap,
}: {
  sectionId: string
  baseSectionId: string
  sectionsMap: Record<string, Section>
}) => {
  const section = sectionsMap[sectionId]
  if (!section || sectionId === baseSectionId) {
    return { prevSectionId: '', nextSectionId: '' }
  }

  const parentSectionId = section.parentSectionId as string
  const parentSection = sectionsMap[parentSectionId]
  const sortedSections = parentSection.sections.sort((a, b) =>
    a.order > b.order ? 1 : a.order < b.order ? -1 : 0
  )
  const sortedSectionIds = sortedSections.map((section) => section.id)
  const currentSectionIdIndex = sortedSectionIds.indexOf(sectionId)
  let prevSectionId = sortedSectionIds[currentSectionIdIndex - 1]
  let nextSectionId = sortedSectionIds[currentSectionIdIndex + 1]
  if (prevSectionId) {
    prevSectionId = getExtremeSubSectionIds({
      sectionId: prevSectionId,
      sectionsMap,
    }).ending
  } else {
    const { prevSectionId: prevParentId } = getNeighbourSectionIds({
      sectionId: parentSectionId,
      sectionsMap,
      baseSectionId,
    })
    prevSectionId = getExtremeSubSectionIds({
      sectionId: prevParentId,
      sectionsMap,
    }).ending
  }

  if (nextSectionId) {
    nextSectionId = getExtremeSubSectionIds({
      sectionId: nextSectionId,
      sectionsMap,
    }).beginning
  } else {
    const { nextSectionId: nextParentId } = getNeighbourSectionIds({
      sectionId: parentSectionId,
      sectionsMap,
      baseSectionId,
    })
    nextSectionId = getExtremeSubSectionIds({
      sectionId: nextParentId,
      sectionsMap,
    }).beginning
  }
  return {
    prevSectionId,
    nextSectionId,
  }
}

export { getNeighbourSectionIds }
