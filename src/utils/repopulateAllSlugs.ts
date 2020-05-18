import { client } from './urqlClient'

export async function repopulateAllSlugs() {
  const INITIALIZE_SLUGS_FOR_ALL_SECTIONS_MUTATION = `
    mutation {
      initializeSlugsForAllSections
    }
  `
  const result = await client
    .mutation(INITIALIZE_SLUGS_FOR_ALL_SECTIONS_MUTATION)
    .toPromise()
  if (result.error) {
    return {
      error: true,
      message: result.error.message,
    }
  }
  return result.data.initializeSlugsForAllSections
}
