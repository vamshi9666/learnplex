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

  if (editMode) {
    const sectionsListResult = await getSectionsListByBaseSectionId({
      baseSectionId: resource.baseSectionId,
    })
    if (sectionsListResult.error) {
      console.log({ sectionsListResultError: sectionsListResult.message })
      return res.status(500).json({ message: sectionsListResult.message })
    }
    sections = sectionsListResult
  } else {
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
    sections = siblingSectionsResult
  }

  /**
   * sectionsMap
   **/
  console.log({ sections })
  const sectionsMap = getSectionsMapFromSectionsList({
    sectionsList: sections,
  })

  /**
   * Resource enrollment
   * TODO: Figure out why cookies are not being sent from here
   **/
  // let enrolled
  // const enrolledResult = await checkIfEnrolledQuery({
  //   client: clientWithHeaders(headers),
  //   resourceId: resource.id,
  // })
  // console.log({ enrolledResult, headers })
  // if (enrolledResult.error) {
  //   console.log({ enrolledResultError: enrolledResult.message })
  //   enrolled = false
  // } else {
  //   enrolled = enrolledResult
  // }

  /**
   * UserProgressList
   * TODO: Figure out why cookies are not being sent from here
   **/
  // let completedSectionIds = []
  // if (enrolled) {
  //   const userProgressResult = await getUserProgressByResourceId({
  //     client: clientWithHeaders(headers),
  //     resourceId: resource.id,
  //   })
  //   if (userProgressResult.error) {
  //     console.log({ userProgressError: userProgressResult.message })
  //     return res.status(500).json({ message: userProgressResult.message })
  //   }
  //   completedSectionIds = userProgressResult
  // }
  // console.log({ completedSectionIds })

  /**
   * completed currentSection
   **/
  // const completedCurrentSection = completedSectionIds.includes(
  //   currentSection.id
  // )

  return res.status(200).json({
    resource,
    sectionsMap,
    sections,
    currentSection,
    // enrolled,
    // completedSectionIds,
    // completedCurrentSection,
  })
}
