import React, { useEffect, useMemo, useState } from 'react'

import { Section } from '../../../../graphql/types'
import { SectionsContext } from '../../../../lib/contexts/SectionsContext'
import EditSectionItemsV2 from './EditSectionItemsV2'

interface Props {
  baseSectionId: string
  sectionsMapData: Record<string, Section>
  reValidate: Function
}

export default function EditResourceIndexV2({
  baseSectionId,
  sectionsMapData,
  reValidate,
}: Props) {
  const [sectionsMap, setSectionsMap] = useState(
    sectionsMapData as Record<string, Section>
  )

  useEffect(() => {
    setSectionsMap(sectionsMapData)
  }, [sectionsMapData])
  const value = useMemo(() => ({ sectionsMap, setSectionsMap, reValidate }), [
    sectionsMap,
    setSectionsMap,
    reValidate,
  ])

  const baseSection = sectionsMap[baseSectionId]

  return (
    <SectionsContext.Provider value={value}>
      <EditSectionItemsV2
        sections={baseSection.sections}
        parentSectionId={baseSectionId}
        topLevel={true}
      />
    </SectionsContext.Provider>
  )
}
