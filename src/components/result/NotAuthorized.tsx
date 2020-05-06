import { Button, Result } from 'antd'
import React, { useEffect } from 'react'
import { useRouter } from 'next/router'

import { logException } from '../../utils/analytics'

export default function NotAuthorized({
  message = 'Sorry, you are not authorized to access this page. Please login with another account',
}: {
  message?: string
}) {
  const router = useRouter()
  useEffect(() => {
    logException(`403: ${message}`)
  }, [message])
  return (
    <Result
      status={'403'}
      title={'403 - Access Forbidden'}
      subTitle={message}
      extra={
        <>
          <Button type={'primary'} onClick={() => router.push('/')}>
            Back Home
          </Button>
          <Button onClick={() => router.push('/logout')}>
            Logout & Login with different account
          </Button>
        </>
      }
    />
  )
}
