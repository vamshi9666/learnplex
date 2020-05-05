import { Button, Result } from 'antd'
import React, { useEffect } from 'react'
import { useRouter } from 'next/router'

import { logException } from '../../utils/analytics'

export default function NotAuthenticated({
  message = 'Sorry, you are not authenticated. You need to be logged in to view this page.',
}: {
  message?: string
}) {
  const router = useRouter()
  useEffect(() => {
    logException(`401: ${message}`)
  }, [message])
  return (
    <Result
      status={403}
      title={'401 - Not Authenticated'}
      subTitle={message}
      extra={
        <>
          <Button type={'primary'} onClick={() => router.push('/')}>
            Back Home
          </Button>
          <Button onClick={() => router.push('/login')}>Login</Button>
        </>
      }
    />
  )
}
