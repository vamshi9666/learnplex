import { Button, Result } from 'antd'
import React, { useEffect } from 'react'
import { useRouter } from 'next/router'

import { logException } from '../../utils/analytics'

export default function PageNotFound({
  message = 'Sorry, the page you visited does not exist.',
}: {
  message?: string
}) {
  const router = useRouter()
  useEffect(() => {
    logException(`404: ${message}`)
  }, [message])
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
