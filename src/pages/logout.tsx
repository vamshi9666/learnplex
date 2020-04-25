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
