import { Button, Result } from 'antd'
import React from 'react'
import { useRouter } from 'next/router'

export default function PageNotFound({
  message = 'Sorry, the page you visited does not exist.',
}: {
  message?: string
}) {
  const router = useRouter()
  return (
    <Result
      status={'404'}
      title={'404'}
      subTitle={message}
      extra={
        <Button type={'primary'} onClick={() => router.push('/')}>
          Back Home
        </Button>
      }
    />
  )
}
