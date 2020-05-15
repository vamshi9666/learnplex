import { useMutation, useQuery } from 'urql'
import React, { useEffect, useState } from 'react'
import { Skeleton } from 'antd'
import { DropResult } from 'react-beautiful-dnd'

import { Section } from '../../graphql/types'
import PageNotFound from '../../components/result/PageNotFound'

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
        order
        depth
        sections {
          id
          order
          slug
        }
        parentSection {
          id
        }
        page {
          content
        }
        resource {
          id
          title
          slug
          description
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
    pause: !username,
  })
  const [resourceId, setResourceId] = useState('')
  const [resourceTitle, setResourceTitle] = useState('')
  const [resourceDescription, setResourceDescription] = useState('')
  const initialSectionsMap: Map<string, Section> = new Map()
  const [sectionsMap, setSectionsMap] = useState(initialSectionsMap)
  const [baseSectionId, setBaseSectionId] = useState('')

  useEffect(() => {
    if (
      username &&
      !sectionsListFetching &&
      !sectionsListError &&
      sectionsListData &&
      sectionsListData.sectionsList.length !== 0
    ) {
      const [baseSection] = sectionsListData.sectionsList.filter(
        (section: Section) => section.isBaseSection
      )
      setResourceId(baseSection.resource.id)
      setResourceTitle(baseSection.resource.title)
      setResourceDescription(baseSection.resource.description)
      setBaseSectionId(baseSection.id)
      setSectionsMap((prevSectionsMap) => {
        const newSectionsMap = new Map()
        sectionsListData.sectionsList.forEach((section: Section) =>
          newSectionsMap.set(section.id, section)
        )
        return newSectionsMap
      })
    }
  }, [sectionsListData, sectionsListError, sectionsListFetching, username])

  let body
  if (username && sectionsListError) {
    body = React.createElement(PageNotFound)
  } else if (sectionsListFetching || sectionsMap.size === 0) {
    body = React.createElement(Skeleton, {
      active: true,
      paragraph: { rows: 10 },
    })
  } else {
    body = undefined
  }

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

  function getExtremeSubSectionIds({
    sectionId,
  }: {
    sectionId: string
  }): { beginning: string; ending: string } {
    const section = sectionsMap.get(sectionId)!
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
      beginning: getExtremeSubSectionIds({ sectionId: sortedSections[0].id })
        .beginning,
      ending: getExtremeSubSectionIds({
        sectionId: sortedSections[sortedSections.length - 1].id,
      }).ending,
    }
  }

  const getSlugsPathUtil = ({
    targetSectionId,
    currentSectionId,
  }: {
    targetSectionId: string
    currentSectionId: string
  }) => {
    const currentSection = sectionsMap.get(currentSectionId)!
    if (targetSectionId === currentSectionId) {
      return [currentSection.slug]
    }
    if (!currentSection) {
      return []
    }
    if (currentSection.sections.length === 0) {
      return []
    }
    for (const section of currentSection.sections) {
      const temp: string[] = getSlugsPathUtil({
        currentSectionId: section.id,
        targetSectionId,
      })
      if (temp.length > 0) {
        if (currentSectionId === baseSectionId) {
          return temp
        } else {
          return [currentSection.slug, ...temp]
        }
      }
    }
    return []
  }

  const getSlugsPathFromSectionId = ({ sectionId }: { sectionId: string }) => {
    if (!sectionId) {
      return {
        slugs: [],
        slugsPath: '/',
      }
    }
    const slugs = getSlugsPathUtil({
      targetSectionId: sectionId,
      currentSectionId: baseSectionId,
    })
    const slugsPath = slugs.reduce((a, b) => `${a}/${b}`, '')
    return { slugs, slugsPath }
  }

  const getNeighbourSectionIds = ({ sectionId }: { sectionId: string }) => {
    const section = sectionsMap.get(sectionId)
    if (!section || sectionId === baseSectionId) {
      return { prevSectionId: '', nextSectionId: '' }
    }

    const parentSectionId = section.parentSection!.id
    const parentSection = sectionsMap.get(parentSectionId)!
    const sortedSections = parentSection.sections.sort((a, b) =>
      a.order > b.order ? 1 : a.order < b.order ? -1 : 0
    )
    const sortedSectionIds = sortedSections.map((section) => section.id)
    const currentSectionIdIndex = sortedSectionIds.indexOf(sectionId)
    let prevSectionId = sortedSectionIds[currentSectionIdIndex - 1]
    let nextSectionId = sortedSectionIds[currentSectionIdIndex + 1]
    if (prevSectionId) {
      prevSectionId = getExtremeSubSectionIds({ sectionId: prevSectionId })
        .ending
    } else {
      const { prevSectionId: prevParentId } = getNeighbourSectionIds({
        sectionId: parentSectionId,
      })
      prevSectionId = getExtremeSubSectionIds({ sectionId: prevParentId })
        .ending
    }

    if (nextSectionId) {
      nextSectionId = getExtremeSubSectionIds({ sectionId: nextSectionId })
        .beginning
    } else {
      const { nextSectionId: nextParentId } = getNeighbourSectionIds({
        sectionId: parentSectionId,
      })
      nextSectionId = getExtremeSubSectionIds({ sectionId: nextParentId })
        .beginning
    }
    return {
      prevSectionId,
      nextSectionId,
    }
  }

  const getNeighbourSectionSlugs = ({ sectionId }: { sectionId: string }) => {
    const { prevSectionId, nextSectionId } = getNeighbourSectionIds({
      sectionId,
    })

    const {
      slugs: prevSectionSlugs,
      slugsPath: prevSectionPath,
    } = getSlugsPathFromSectionId({
      sectionId: prevSectionId,
    })
    const {
      slugs: nextSectionSlugs,
      slugsPath: nextSectionPath,
    } = getSlugsPathFromSectionId({
      sectionId: nextSectionId,
    })

    return {
      prevSectionSlugs,
      nextSectionSlugs,
      prevSectionPath,
      nextSectionPath,
    }
  }

  function getLeastOrderSectionId({
    sectionId,
  }: {
    sectionId: string
  }): string {
    const currentSection = sectionsMap.get(sectionId)!
    if (!currentSection) {
      return ''
    }
    let sectionIdWithLeastOrder = ''
    let leastOrder = -1
    if (currentSection.sections.length === 0) {
      return currentSection.id
    }
    currentSection.sections.forEach((section) => {
      if (leastOrder === -1) {
        sectionIdWithLeastOrder = section.id
        leastOrder = section.order
      } else if (leastOrder > section.order) {
        sectionIdWithLeastOrder = section.id
        leastOrder = section.order
      }
    })
    return getLeastOrderSectionId({ sectionId: sectionIdWithLeastOrder })
  }

  const firstPagePath = () => {
    const leastOrderSectionId = getLeastOrderSectionId({
      sectionId: baseSectionId,
    })
    if (leastOrderSectionId === baseSectionId) {
      return ''
    }
    const { slugsPath } = getSlugsPathFromSectionId({
      sectionId: leastOrderSectionId,
    })
    return slugsPath
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
    getNeighbourSectionSlugs,
    firstPagePath,
    getSlugsPathFromSectionId,
    resourceId,
    resourceTitle,
    resourceDescription,
  }
}
