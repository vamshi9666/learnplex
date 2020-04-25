import { useMutation } from 'urql'
import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'
import NProgress from 'nprogress'

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
    logout().then(() => {
      Cookies.remove('accessToken')
      router.push('/login').then()
    })
    NProgress.done()
  }, [logout, router])

  return <p>Loading....</p>
}
