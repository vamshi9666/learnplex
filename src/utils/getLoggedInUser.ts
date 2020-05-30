import { client } from './urqlClient'

export default async function getLoggedInUser() {
  const ME_QUERY = `
    query {
      me {
        user {
           id
           name
           email
           username
           roles
           confirmed
           disabledOrConfirmed
        }
        accessToken
      }
    }
  `
  const result = await client.query(ME_QUERY).toPromise()
  if (result.error) {
    return {
      error: true,
      message: result.error.message,
    }
  }
  return result.data.me
}
