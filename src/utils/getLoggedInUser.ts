import { client } from './urqlClient'

export default async function getLoggedInUser() {
  const ME_QUERY = `
    query {
      me {
        user {
           name
           email
           username
           roles
           confirmed
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
