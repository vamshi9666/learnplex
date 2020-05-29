import NProgress from 'nprogress'
import { Client } from '@urql/core'

import { client as defaultClient } from './urqlClient'

export async function completeSection({
  client = defaultClient,
  sectionId,
}: {
  client?: Client
  sectionId: string
}) {
  console.log({ sectionId })
  const COMPLETE_SECTION_MUTATION = `
    mutation($sectionId: String!) {
      completeSection(sectionId: $sectionId) {
        id
        user {
          username
        }
        completedSections {
          slug
          id
        }
      }
    }
  `
  NProgress.start()
  const result = await client
    .mutation(COMPLETE_SECTION_MUTATION, {
      sectionId,
    })
    .toPromise()
  console.log({ result })
  NProgress.done()
  if (result.error) {
    return {
      error: true,
      message: result.error.message,
    }
  }
  return result.data.completeSection
}
