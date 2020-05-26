import { NextApiRequest, NextApiResponse } from 'next'

import { Section } from '../../graphql/types'
import { client } from '../../utils/urqlClient'
import { getSiblingSections } from '../../utils/getSiblingSections'
import getSectionsListByBaseSectionId, {
  getSectionsMapFromSectionsList,
} from '../../utils/getSectionsListByBaseSectionId'
import { getResourceBySlug } from '../../utils/getResourceBySlug'

async function getSectionBySlugsPathAndBaseSectionId({
  slugsPath,
  baseSectionId,
}: {
  slugsPath: string
  baseSectionId: string
}) {
  const SECTION_BY_SLUGS_PATH = `
    query($slugsPath: String!, $baseSectionId: String!) {
      sectionBySlugsPathAndBaseSectionId(slugsPath: $slugsPath, baseSectionId: $baseSectionId) {
        id
        title
        page {
          content
        }
        previousSectionPath
        nextSectionPath
        isPage
        pathWithSectionIds
      }
    }
  `
  const result = await client
    .query(SECTION_BY_SLUGS_PATH, {
      slugsPath,
      baseSectionId,
    })
    .toPromise()

  if (result.error) {
    return {
      error: false,
      message: result.error.message,
    }
  }
  return result.data.sectionBySlugsPathAndBaseSectionId
}

export default async (
  {
    headers,
    cookies,
    query: { resourceSlug, slugsPath, editMode },
  }: NextApiRequest,
  res: NextApiResponse
) => {
  console.log({ headers, cookies })
  /**
   * Resource
   **/
  const resourceResult = await getResourceBySlug({
    resourceSlug: resourceSlug as string,
  })
  if (resourceResult.error) {
    return res.status(500).json({ message: resourceResult.message })
  }
  const resource = resourceResult

  /**
   * currentSection
   **/
  let currentSection: Section
  const sectionResult = await getSectionBySlugsPathAndBaseSectionId({
    slugsPath: slugsPath as string,
    baseSectionId: resource.baseSectionId,
  })
  if (sectionResult.error) {
    console.log({ sectionResultError: sectionResult.message })
    return res.status(500).json({ message: sectionResult.message })
  }
  currentSection = sectionResult
  console.log({ currentSection })

  let sections

  const sectionsListResult = await getSectionsListByBaseSectionId({
    baseSectionId: resource.baseSectionId,
  })
  if (sectionsListResult.error) {
    console.log({ sectionsListResultError: sectionsListResult.message })
    return res.status(500).json({ message: sectionsListResult.message })
  }
  sections = sectionsListResult
  /**
   * sibling sections
   **/
  const siblingSectionsResult = await getSiblingSections({
    sectionId: currentSection.id,
  })
  if (siblingSectionsResult.error) {
    console.log({ siblingSectionsResultError: siblingSectionsResult.message })
    return res.status(500).json({ message: siblingSectionsResult.message })
  }
  const siblingSections = siblingSectionsResult

  /**
   * sectionsMap
   **/
  console.log({ sections })
  const sectionsMap = getSectionsMapFromSectionsList({
    sectionsList: sections,
  })

  return res.status(200).json({
    resource,
    sectionsMap,
    sections,
    currentSection,
    siblingSections,
  })
}
