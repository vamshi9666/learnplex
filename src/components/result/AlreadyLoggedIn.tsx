import { Button, Result, Space } from 'antd'
import React from 'react'
import { useRouter } from 'next/router'
import { SmileTwoTone } from '@ant-design/icons'

export default function AlreadyLoggedIn() {
  const router = useRouter()
  return (
    <Result
      status={'success'}
      title={
        <Space>
          <span>You are logged in!</span>
          <SmileTwoTone />
        </Space>
      }
      extra={[
        <Button type={'primary'} key={'home'} onClick={() => router.push('/')}>
          Go Home
        </Button>,
        <Button key={'logout'} onClick={() => router.push('/logout')}>
          Logout
        </Button>,
      ]}
    />
  )
}
