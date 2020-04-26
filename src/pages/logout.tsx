import { useMutation } from 'urql'
import React, { useEffect } from 'react'
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
  useEffect(() => {
    NProgress.start()
    logout().then(async (result) => {
      if (result.error) {
        console.error({ 'logout error': result.error })
      } else {
        await router.push('/login')
      }
    })
    NProgress.done()
  }, [logout, router])

  return <p>Loading....</p>
}
