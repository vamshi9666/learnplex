import { NextApiRequest, NextApiResponse } from 'next'

import { Section } from '../../graphql/types'
import { client } from '../../utils/urqlClient'
import { checkIfEnrolledQuery } from '../../utils/progress'
import { getResource } from '../../utils/getResourceForApi'
import { getSiblingSections } from '../../utils/getSiblingSections'
import { getSectionsMapFromSectionsList } from '../../utils/getSectionsListByBaseSectionId'
import { getUserProgressByResourceId } from '../../utils/getUserProgressByResourceId'

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
    query: { username, resourceSlug, slugsPath },
  }: NextApiRequest,
  res: NextApiResponse
) => {
  /**
   * Resource
   **/
  const resourceResult = await getResource({
    username: username as string,
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
  const sectionsMap = getSectionsMapFromSectionsList({
    sectionsList: siblingSections,
  })

  /**
   * Resource enrollment
   **/
  let enrolled
  const enrolledResult = await checkIfEnrolledQuery({
    headers,
    resourceId: resource.id,
  })
  console.log({ enrolledResult })
  if (enrolledResult.error) {
    console.log({ enrolledResultError: enrolledResult.message })
    enrolled = false
  } else {
    enrolled = enrolledResult
  }

  /**
   * UserProgressList currentSection
   **/
  let completedSectionIds = []
  if (enrolled) {
    const userProgressResult = await getUserProgressByResourceId({
      headers,
      resourceId: resource.id,
    })
    if (userProgressResult.error) {
      console.log({ userProgressError: userProgressResult.message })
      return res.status(500).json({ message: userProgressResult.message })
    }
    completedSectionIds = userProgressResult
  }
  console.log({ completedSectionIds })

  /**
   * completed currentSection
   **/
  const completedCurrentSection = completedSectionIds.includes(
    currentSection.id
  )

  return res.status(200).json({
    resource,
    sectionsMap,
    siblingSections,
    currentSection,
    enrolled,
    completedSectionIds,
    completedCurrentSection,
  })
}
