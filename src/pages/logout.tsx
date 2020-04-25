import { useMutation } from 'urql'
import React from 'react'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'
import NProgress from 'nprogress'

import { ACCESS_TOKEN_COOKIE } from '../constants'

export default function Logout() {
  const router = useRouter()
  const LOGOUT_MUTATION = `
    mutation {
      logout
    }
  `
  const [, logout] = useMutation(LOGOUT_MUTATION)
  /*
    TODO: (Fix this)
          This code throws error when the user closes tab while still
          being loggedin and Then opens a new tab and tries to logout.
      POTENTIAL_FIX:
          Wrapping this around useEffect
          For unknown reasons, wrapping this around useEffect is not
          setting the accessToken to '', but call to the server to
          reset refresh_token is working
  */
  NProgress.start()
  logout().then(async (result) => {
    if (result.error) {
      console.error({ 'logout error': result.error })
    } else {
      console.log({ logoutResult: result })
      Cookies.set(ACCESS_TOKEN_COOKIE, '')
      await router.push('/login').then()
    }
  })
  NProgress.done()

  return <p>Loading....</p>
}
