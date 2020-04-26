import Cookies from 'js-cookie'
import { useQuery } from 'urql'
import { useEffect } from 'react'

import { ACCESS_TOKEN_COOKIE } from '../../constants'

export function useUser() {
  const ME_QUERY = `
    query {
        me {
          user {
             username
             roles
          }
          accessToken
        }
    }
  `
  const accessToken = Cookies.get(ACCESS_TOKEN_COOKIE)
  const [{ data, fetching, error }, reExecuteMeQuery] = useQuery({
    query: ME_QUERY,
  })

  useEffect(() => {
    reExecuteMeQuery()
  }, [accessToken, reExecuteMeQuery])

  return fetching
    ? { user: undefined, fetching: true, error: undefined }
    : error
    ? { user: undefined, fetching: false, error }
    : data && data.me
    ? { user: data.me.user, fetching: false, error: undefined }
    : { user: undefined, fetching: false, error: undefined }
}
