import { useQuery } from 'urql'
import React, { useEffect, useRef, useState } from 'react'
import { Skeleton } from 'antd'

import { Section } from '../../graphql/types'

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
  if (sectionsListFetching || !baseSectionId) {
    body = React.createElement(Skeleton, {
      active: true,
      paragraph: { rows: 10 },
    })
  } else if (sectionsListError) {
    body = React.createElement('p', {}, `Oh no... ${sectionsListError.message}`)
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
  }
}
