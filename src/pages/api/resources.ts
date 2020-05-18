import { NextApiRequest, NextApiResponse } from 'next'

import { getAllResources } from '../../utils/getAllResources'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const allResourcesResult = await getAllResources({})

  if (allResourcesResult.error) {
    return res.status(500).json({ message: allResourcesResult.message })
  }

  return res.status(200).json({ resources: allResourcesResult })
}
