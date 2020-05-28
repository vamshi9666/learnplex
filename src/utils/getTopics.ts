import { client } from './urqlClient'

export async function getTopics() {
  const TOPICS_QUERY = `
    query {
      topics {
        id
        title
      }
    }
  `
  const result = await client.query(TOPICS_QUERY).toPromise()
  if (result.error) {
    return {
      error: true,
      message: result.error.message,
    }
  }
  return result.data.topics
}
