import { clientWithHeaders } from './urqlClient'

export async function checkIfEnrolledQuery({
  headers,
  resourceId,
}: {
  headers: any
  resourceId: string
}) {
  const HAS_ENROLLED_QUERY = `
    query($resourceId: String!) {
      hasEnrolledByResourceId(resourceId: $resourceId)
    }
  `
  const result = await clientWithHeaders(headers)
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
  headers,
  resourceId,
  sectionId,
}: {
  headers: any
  resourceId: string
  sectionId: string
}) {
  const HAS_COMPLETED_SECTION = `
    query($resourceId: String!, $sectionId: String!) {
      hasCompletedSection(resourceId: $resourceId, sectionId: $sectionId)
    }
  `
  const result = await clientWithHeaders(headers)
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
