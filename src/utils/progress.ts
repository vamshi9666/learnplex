import { Client } from '@urql/core'

import { client as defaultClient } from './urqlClient'

export async function checkIfEnrolledQuery({
  resourceId,
  client = defaultClient,
}: {
  resourceId: string
  client?: Client
}) {
  const HAS_ENROLLED_QUERY = `
    query($resourceId: String!) {
      hasEnrolledByResourceId(resourceId: $resourceId)
    }
  `
  const result = await client
    .query(HAS_ENROLLED_QUERY, {
      resourceId,
    })
    .toPromise()

  if (result.error) {
    return { error: true, message: result.error.message }
  }

  return result.data.hasEnrolledByResourceId
}

export async function hasCompletedCurrentSection({
  client = defaultClient,
  resourceId,
  sectionId,
}: {
  client?: Client
  resourceId: string
  sectionId: string
}) {
  const HAS_COMPLETED_SECTION = `
    query($resourceId: String!, $sectionId: String!) {
      hasCompletedSection(resourceId: $resourceId, sectionId: $sectionId)
    }
  `
  const result = await client
    .query(HAS_COMPLETED_SECTION, {
      resourceId,
      sectionId,
    })
    .toPromise()
  console.log({ result })
  if (result.error) {
    return { error: true, message: result.error.message }
  }

  return result.data.hasCompletedSection
}
