import { useMutation, useQuery } from 'urql'
import React, { useEffect, useRef, useState } from 'react'
import { Skeleton } from 'antd'
import { DropResult } from 'react-beautiful-dnd'

import { Section } from '../../graphql/types'
import PageNotFound from '../../components/error/PageNotFound'

export function useSections({
  resourceSlug,
  username,
}: {
  resourceSlug: string
  username: string
}) {
  const SECTIONS_LIST_QUERY = `
    query($resourceSlug: String!, $username: String!) {
      sectionsList(resourceSlug: $resourceSlug, username: $username) {
        id
        title
        slug
        isBaseSection
        isPage
        hasSubSections
        sections {
          id
          order
        }
        parentSection {
          id
        }
        page {
          content
        }
      }
    }
  `

  const [
    {
      data: sectionsListData,
      fetching: sectionsListFetching,
      error: sectionsListError,
    },
    reExecuteSectionsListQuery,
  ] = useQuery({
    query: SECTIONS_LIST_QUERY,
    variables: {
      resourceSlug,
      username,
    },
  })
  const initialSectionsMap: Map<string, Section> = new Map()
  const [sectionsMap, setSectionsMap] = useState(initialSectionsMap)
  const [baseSectionId, setBaseSectionId] = useState('')

  useEffect(() => {
    if (
      !sectionsListFetching &&
      !sectionsListError &&
      sectionsListData.sectionsList.length !== 0
    ) {
      const [baseSection] = sectionsListData.sectionsList.filter(
        (section: Section) => section.isBaseSection
      )
      setBaseSectionId(baseSection.id)
      setSectionsMap((prevSectionsMap) => {
        const newSectionsMap = new Map()
        sectionsListData.sectionsList.forEach((section: Section) =>
          newSectionsMap.set(section.id, section)
        )
        return newSectionsMap
      })
    }
  }, [sectionsListData, sectionsListError, sectionsListFetching])

  let body
  if (sectionsListFetching && !sectionsListError) {
    body = React.createElement(Skeleton, {
      active: true,
      paragraph: { rows: 10 },
    })
  } else if (sectionsListError && !baseSectionId) {
    body = React.createElement(PageNotFound, {})
  } else {
    body = undefined
  }

  const renders = useRef(0)
  console.log('renders hook', renders.current++)

  const setSection = ({ updatedSection }: { updatedSection: Section }) => {
    // reExecuteSectionsListQuery()
    setSectionsMap((prevSectionsMap) => {
      const newSectionsMap = new Map<string, Section>()
      const sectionIds = Array.from(prevSectionsMap.keys())
      sectionIds.forEach((sectionId) => {
        newSectionsMap.set(
          sectionId,
          Object.assign({}, prevSectionsMap.get(sectionId)!)
        )
      })
      newSectionsMap.set(updatedSection.id, Object.assign({}, updatedSection))
      return newSectionsMap
    })
  }

  const deleteSection = ({
    sectionId,
    parentSectionId,
  }: {
    sectionId: string
    parentSectionId: string
  }) => {
    setSectionsMap((prevSectionsMap) => {
      const newSectionsMap = new Map<string, Section>()
      const sectionIds = Array.from(prevSectionsMap.keys())
      for (const currentSectionId of sectionIds) {
        // Delete sectionId from sectionsMap
        if (sectionId === currentSectionId) {
          continue
        }
        const newSection = Object.assign(
          {},
          prevSectionsMap.get(currentSectionId)
        )

        // Delete SectionID from the subsections of parent
        if (currentSectionId === parentSectionId) {
          const sections = Object.assign(
            [],
            prevSectionsMap.get(currentSectionId)!.sections
          )
          newSection.sections = sections.filter(
            (section: Section) => section.id !== sectionId
          )
        }
        newSectionsMap.set(currentSectionId, newSection)
      }
      return newSectionsMap
    })
  }

  const REORDER_SECTIONS_MUTATION = `
    mutation($data: ReorderSectionsInput!) {
      reorderSections(data: $data) {
        id
        title
        slug
        isBaseSection
        isPage
        hasSubSections
        sections {
          id
          order
        }
        parentSection {
          id
        }
        page {
          content
        }
      }
    }
  `

  const [, reorderSectionsMutation] = useMutation(REORDER_SECTIONS_MUTATION)

  const reorderSections = async ({
    result,
    parentSectionId,
    sections,
  }: {
    result: DropResult
    parentSectionId: string
    sections: Section[]
  }) => {
    if (!result.destination) {
      return
    }
    const sourceOrder = sections[result.source.index].order
    const destinationOrder = sections[result.destination.index].order

    setSectionsMap((prevSectionsMap) => {
      const sectionIds = Array.from(prevSectionsMap.keys())
      const newSectionsMap = new Map<string, Section>()
      sectionIds.forEach((sectionId) => {
        newSectionsMap.set(
          sectionId,
          Object.assign({}, prevSectionsMap.get(sectionId)!)
        )
      })
      const clonedSections = Object.assign([] as Section[], sections)
      if (sourceOrder < destinationOrder) {
        clonedSections.map((section) => {
          if (
            section.order >= sourceOrder + 1 &&
            section.order <= destinationOrder
          ) {
            section.order -= 1
          } else if (section.order === sourceOrder) {
            section.order = destinationOrder
          }
          return section
        })
      } else {
        clonedSections.map((section) => {
          if (
            section.order >= destinationOrder &&
            section.order <= sourceOrder - 1
          ) {
            section.order += 1
          } else if (section.order === sourceOrder) {
            section.order = destinationOrder
          }
          return section
        })
      }
      const parentSection = newSectionsMap.get(parentSectionId)!
      parentSection.sections = clonedSections
      newSectionsMap.set(parentSectionId, parentSection)
      return newSectionsMap
    })

    reorderSectionsMutation({
      data: {
        sourceOrder,
        destinationOrder,
        parentSectionId,
      },
    }).then((result) => {
      if (result.error) {
        console.log({ reorderSectionsError: result.error })
      } else {
        console.log({ result })
        const updatedSection = result.data.reorderSections
        setSection({ updatedSection })
      }
    })
  }

  return {
    sectionsListFetching,
    baseSectionId,
    sectionsListError,
    sectionsMap,
    sectionsListData,
    body,
    setSection,
    deleteSection,
    reExecuteSectionsListQuery,
    reorderSections,
  }
}
