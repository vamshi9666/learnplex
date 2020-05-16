import { getResourceByUsernameAndSlug } from './getResourceByUsernameAndSlug'
import { getPrimaryResourceBySlug } from './getPrimaryResourceBySlug'

export async function getResource({
  username,
  resourceSlug,
}: {
  username: string
  resourceSlug: string
}) {
  if (username) {
    const resourceResult = await getResourceByUsernameAndSlug({
      username: username as string,
      resourceSlug: resourceSlug as string,
    })
    if (resourceResult.error) {
      return {
        error: true,
        message: resourceResult.message,
      }
    }
    return resourceResult
  }

  const resourceResult = await getPrimaryResourceBySlug({
    resourceSlug: resourceSlug as string,
  })
  if (resourceResult.error) {
    console.log({ resourceResult })
    console.log({ resourceResultError: resourceResult.message })
    return {
      error: true,
      message: resourceResult.message,
    }
  }
  return resourceResult
}
