import { Button, Result } from 'antd'
import React from 'react'
import { useRouter } from 'next/router'

export default function InternalServerError() {
  const router = useRouter()
  return (
    <Result
      status={'500'}
      title={'500'}
      subTitle={'Sorry, something went wrong.'}
      extra={
        <Button type={'primary'} onClick={() => router.push('/')}>
          Back Home
        </Button>
      }
    />
  )
}
