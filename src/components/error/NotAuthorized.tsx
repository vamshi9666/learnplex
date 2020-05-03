import { Button, Result } from 'antd'
import React from 'react'
import { useRouter } from 'next/router'

export default function NotAuthorized() {
  const router = useRouter()
  return (
    <Result
      status={'403'}
      title={'403 - Access Forbidden'}
      subTitle={
        'Sorry, you are not authorized to access this page. Please login with another account'
      }
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
