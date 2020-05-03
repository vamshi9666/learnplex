import { useMutation } from 'urql'
import React, { useEffect } from 'react'
import NProgress from 'nprogress'
import { useRouter } from 'next/router'
import { Skeleton } from 'antd'

export default function ConfirmEmail() {
  const CONFIRM_EMAIL_MUTATION = `
    mutation($token: String!) {
      confirmUser(token: $token)
    }
  `
  const [, confirmEmail] = useMutation(CONFIRM_EMAIL_MUTATION)
  const router = useRouter()

  useEffect(() => {
    NProgress.start()
    confirmEmail({
      token: router.query.token as string,
    }).then(async (result) => {
      if (result.error) {
        console.log({ 'confirm email error': result.error })
      } else {
        console.log({ result })
        await router.push('/')
      }
    })
    NProgress.done()
  }, [confirmEmail, router])

  return <Skeleton active={true} />
}
