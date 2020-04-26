import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '../constants'

export default function Home() {
  const router = useRouter()
  const accessToken: string = router.query.accessToken as string
  const refreshToken: string = router.query.refreshToken as string
  const oauth: boolean = Boolean(router.query.oauth) as boolean

  useEffect(() => {
    console.log({ accessToken, refreshToken })
    if (!!accessToken && !!refreshToken && oauth) {
      Cookies.set(REFRESH_TOKEN_COOKIE, refreshToken)
      Cookies.set(ACCESS_TOKEN_COOKIE, accessToken)
      router.push('/').then()
    }
  }, [accessToken, refreshToken, oauth, router])

  return <p>Hello World!</p>
}
