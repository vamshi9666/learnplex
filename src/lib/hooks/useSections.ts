import { useQuery } from 'urql'
import { useEffect, useState } from 'react'

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
        sections {
          id
          slug
          order
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

  return {
    sectionsListFetching,
    baseSectionId,
    sectionsListError,
    sectionsMap,
    sectionsListData,
  }
}
