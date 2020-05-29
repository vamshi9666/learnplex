import { useMutation } from 'urql'
import React, { useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import NProgress from 'nprogress'
import { Skeleton } from 'antd'
import { UserContext } from '../lib/contexts/UserContext'

export default function Logout() {
  const router = useRouter()
  const { setUser } = useContext(UserContext)
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
        setUser(null)
        await router.push('/login')
      }
    })
    NProgress.done()
  }, [logout, router, setUser])

  return <Skeleton active={true} />
}
