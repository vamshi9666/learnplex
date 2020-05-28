import { NextApiRequest, NextApiResponse } from 'next'

import getSectionsListByBaseSectionId, {
  getSectionsMapFromSectionsList,
} from '../../utils/getSectionsListByBaseSectionId'
import { getResourceBySlug } from '../../utils/getResourceBySlug'

export default async (
  { headers, cookies, query: { resourceSlug } }: NextApiRequest,
  res: NextApiResponse
) => {
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

  return res.status(200).json({
    resource,
    sectionsList,
    sectionsMap,
  })
}
