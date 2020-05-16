import { client } from './urqlClient'

export async function getResourceByUsernameAndSlug({
  username,
  resourceSlug,
}: {
  username: string
  resourceSlug: string
}) {
  const RESOURCE_BY_OWNER_USERNAME_AND_SLUG = `
    query($username: String!, $resourceSlug: String!) {
      resourceByOwnerUsernameAndSlug(username: $username, resourceSlug: $resourceSlug) {
        id
        title
        description
        slug
        baseSectionId
        user {
          username
        }
      }
    }
  `
  const result = await client
    .query(RESOURCE_BY_OWNER_USERNAME_AND_SLUG, {
      username,
      resourceSlug,
    })
    .toPromise()

  if (result.error) {
    return {
      error: true,
      message: result.error.message,
    }
  }
  return result.data.resourceByOwnerUsernameAndSlug
}
