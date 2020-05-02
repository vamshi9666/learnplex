import { Button, Result } from 'antd'
import React from 'react'
import { useRouter } from 'next/router'

export default function NotAuthenticated() {
  const router = useRouter()
  return (
    <Result
      status={403}
      title={'401'}
      subTitle={
        'Sorry, you are not authenticated. You need to be logged in to view this page.'
      }
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
