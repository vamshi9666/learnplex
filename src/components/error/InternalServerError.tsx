import { Button, Result } from 'antd'
import React, { useEffect } from 'react'
import { useRouter } from 'next/router'

import { logException } from '../../utils/analytics'

export default function InternalServerError({
  message = 'Sorry, something went wrong.',
}: {
  message?: string
}) {
  const router = useRouter()
  useEffect(() => {
    logException(`500: ${message}`)
  }, [message])
  return (
    <Result
      status={'500'}
      title={'500 - Internal Server Error'}
      subTitle={message}
      extra={
        <Button type={'primary'} onClick={() => router.push('/')}>
          Back Home
        </Button>
      }
    />
  )
}
