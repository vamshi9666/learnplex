import React, { useEffect, useState } from 'react'

import { useSections } from './useSections'
import { setCurrentSectionIdFromSlugs } from '../../utils/setSectionIdFromSlugs'
import PageNotFound from '../../components/error/PageNotFound'

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

  useEffect(() => {
    if (
      slugs.length &&
      !sectionsListFetching &&
      !sectionsListError &&
      !!baseSectionId
    ) {
      setCurrentSectionIdFromSlugs({
        baseSectionId,
        slugs,
        sectionsMap,
        setCurrentSectionId,
      })
    }
  }, [
    slugs,
    baseSectionId,
    sectionsListError,
    sectionsListFetching,
    sectionsMap,
  ])

  let isValidPage = true

  if (!sectionsListFetching) {
    isValidPage = !!sectionsMap.get(currentSectionId)
  }

  let modifiedBody = body

  if (!isValidPage) {
    modifiedBody = React.createElement(PageNotFound)
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
  }
}
