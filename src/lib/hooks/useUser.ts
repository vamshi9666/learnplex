import Cookies from 'js-cookie'
import { useQuery } from 'urql'
import { useEffect, useRef } from 'react'

import { ACCESS_TOKEN_COOKIE } from '../../constants'

export function useUser() {
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
  const accessToken = Cookies.get(ACCESS_TOKEN_COOKIE)
  const [{ data, fetching, error }, reExecuteMeQuery] = useQuery({
    query: ME_QUERY,
  })
  const renders = useRef(0)
  // console.log('useUser called ', renders.current++)
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
