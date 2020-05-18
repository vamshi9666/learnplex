import { NextApiRequest, NextApiResponse } from 'next'

import getSectionsListByBaseSectionId, {
  getSectionsMapFromSectionsList,
} from '../../utils/getSectionsListByBaseSectionId'
import { getResource } from '../../utils/getResourceForApi'

export default async (
  { headers, cookies, query: { username, resourceSlug } }: NextApiRequest,
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
   * SectionsList and SectionsMap
   **/
  const sectionsListResult = await getSectionsListByBaseSectionId({
    baseSectionId: resource.baseSectionId,
  })
  if (sectionsListResult.error) {
    console.log({ sectionsListResultError: sectionsListResult.message })
    return res.status(500).json({ message: sectionsListResult.message })
  }
  const sectionsList = sectionsListResult
  const sectionsMap = getSectionsMapFromSectionsList({ sectionsList })

  /**
   * Resource enrollment
   * TODO: Figure out why cookies are not being sent from here
   **/
  // let enrolled
  // const enrolledResult = await checkIfEnrolledQuery({
  //   client: clientWithHeaders(headers),
  //   resourceId: resource.id,
  // })
  // console.log({ enrolledResult })
  // if (enrolledResult.error) {
  //   console.log({ enrolledResultError: enrolledResult.message })
  //   enrolled = false
  // } else {
  //   enrolled = enrolledResult
  // }

  return res.status(200).json({
    resource,
    sectionsList,
    sectionsMap,
    // enrolled,
  })
}
