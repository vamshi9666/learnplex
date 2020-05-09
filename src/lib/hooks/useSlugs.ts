import React, { useEffect, useState } from 'react'

import { useSections } from './useSections'
import PageNotFound from '../../components/result/PageNotFound'

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
    const tempKeys = []
    for (let depth = 0; depth < slugs.length; depth++) {
      const sectionIds = Array.from(sectionsMap.keys())
      const [id] = sectionIds.filter((sectionId) => {
        const section = sectionsMap.get(sectionId)!
        return section.depth === depth && section.slug === slugs[depth]
      })
      tempKeys.push(id)
    }
    setCurrentSectionId(tempKeys[tempKeys.length - 1])
    setKeys(tempKeys)
  }, [sectionsMap, slugs])

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
