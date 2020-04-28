import React, { useEffect, useState } from 'react'

import { useSections } from './useSections'
import { setCurrentSectionIdFromSlugs } from '../../utils/setSectionIdFromSlugs'

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

  let body
  if (sectionsListFetching || !baseSectionId) {
    body = React.createElement('p', {}, 'Loading....')
  } else if (sectionsListError) {
    body = React.createElement('p', {}, `Oh no... ${sectionsListError.message}`)
  } else {
    body = undefined
  }

  const pageContent = sectionsMap.get(currentSectionId)?.page?.content

  return {
    currentSectionId,
    body,
    pageContent,
    sectionsListFetching,
    baseSectionId,
    sectionsListError,
    sectionsMap,
    sectionsListData,
  }
}
