import React, { useEffect, useState } from 'react'

import { useSections } from './useSections'
import PageNotFound from '../../components/result/PageNotFound'
import { Section } from '../../graphql/types'

export default function useSlugs({
  resourceSlug,
  username,
  slugs = [],
}: {
  resourceSlug: string
  username: string
  slugs?: string[]
}) {
  const [currentSectionId, setCurrentSectionId] = useState('')
  const {
    sectionsListFetching,
    baseSectionId,
    sectionsListError,
    sectionsMap,
    sectionsListData,
    body,
  } = useSections({ resourceSlug, username })
  const [keys, setKeys] = useState([] as string[])

  useEffect(() => {
    const tempKeys: string[] = []
    let currentParentSectionId = baseSectionId
    for (let depth = 0; depth < slugs.length; depth++) {
      const sections = sectionsMap.get(currentParentSectionId)?.sections ?? []
      const [section] = sections.filter((partialSection: Section) => {
        const section = sectionsMap.get(partialSection.id)!
        return section.depth === depth && section.slug === slugs[depth]
      })
      currentParentSectionId = section?.id ?? ''
      if (currentParentSectionId) {
        tempKeys.push(currentParentSectionId)
      }
    }
    setCurrentSectionId(tempKeys[tempKeys.length - 1])
    setKeys(tempKeys)
  }, [baseSectionId, sectionsMap, slugs])

  let modifiedBody = body

  if (!body) {
    let isValidPage = true

    if (!!currentSectionId) {
      isValidPage = !!sectionsMap.get(currentSectionId)
    }

    if (!isValidPage) {
      modifiedBody = React.createElement(PageNotFound)
    }
  }

  const pageContent = sectionsMap.get(currentSectionId)?.page?.content

  return {
    currentSectionId,
    body: modifiedBody,
    pageContent,
    sectionsListFetching,
    baseSectionId,
    sectionsListError,
    sectionsMap,
    sectionsListData,
    keys,
  }
}
