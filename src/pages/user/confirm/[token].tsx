import { useMutation } from 'urql'
import React, { useContext, useEffect } from 'react'
import NProgress from 'nprogress'
import { useRouter } from 'next/router'
import { Skeleton } from 'antd'

import { UserContext } from '../../../lib/contexts/UserContext'

export default function ConfirmEmail() {
  const CONFIRM_EMAIL_MUTATION = `
    mutation($token: String!) {
      confirmUser(token: $token) {
        accessToken
        user {
          name
          email
          username
          roles
        }
      }
    }
  `
  const [, confirmEmail] = useMutation(CONFIRM_EMAIL_MUTATION)
  const router = useRouter()
  const { setUser } = useContext(UserContext)

  useEffect(() => {
    NProgress.start()
    confirmEmail({
      token: router.query.token as string,
    }).then(async (result) => {
      if (result.error) {
        console.log({ 'confirm email error': result.error })
      } else {
        console.log({ result })
        const user = result.data.confirmUser.user
        setUser(user)
        await router.push('/')
      }
    })
    NProgress.done()
  }, [confirmEmail, router, setUser])

  return <Skeleton active={true} />
}
