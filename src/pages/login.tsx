import React, { useContext } from 'react'
import { Button, Divider, Form, Input, message } from 'antd'
import { GithubOutlined } from '@ant-design/icons'
import urljoin from 'url-join'
import { useRouter } from 'next/router'
import NProgress from 'nprogress'

import { SEO } from '../components/SEO'
import { getServerEndPoint } from '../utils/getServerEndPoint'
import { FORM_LAYOUT, FORM_TAIL_LAYOUT } from '../constants'
import { logEvent } from '../utils/analytics'
import AlreadyLoggedIn from '../components/result/AlreadyLoggedIn'
import { UserContext } from '../lib/contexts/UserContext'
import { login } from '../graphql/mutations/auth'

export default function Login() {
  const router = useRouter()
  const { setUser } = useContext(UserContext)

  const onFinish = async ({ usernameOrEmail, password }: any) => {
    NProgress.start()
    logEvent('guest', 'TRIES_TO_LOGIN')
    const result = await login({ usernameOrEmail, password })
    if (result.error) {
      message.error(result.message)
      return
    }
    const user = result.user
    if (!user.disabledOrConfirmed) {
      message.warn(
        'Your email is not yet verified. Please confirm your email address'
      )
    }
    setUser(user)
    logEvent('guest', 'LOGGED_IN')
    const redirectTo = router.query.redirectTo as string
    if (redirectTo) {
      await router.push(redirectTo)
    } else {
      await router.push('/')
    }
    NProgress.done()
  }

  const { user } = useContext(UserContext)

  if (user) {
    return <AlreadyLoggedIn />
  }

  return (
    <>
      <SEO title={'Login'} />

      <Form.Item {...FORM_TAIL_LAYOUT}>
        <Button
          block={true}
          icon={<GithubOutlined />}
          href={urljoin(getServerEndPoint(), 'auth', 'github')}
        >
          Login With Github
        </Button>
      </Form.Item>

      <Form.Item {...FORM_TAIL_LAYOUT}>
        <Divider>(OR)</Divider>
      </Form.Item>

      <Form {...FORM_LAYOUT} name={'login'} onFinish={onFinish}>
        <Form.Item
          name={'usernameOrEmail'}
          label={'Username/Email'}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={'Password'}
          name={'password'}
          rules={[
            {
              required: true,
              message: 'Please input your password!',
            },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item {...FORM_TAIL_LAYOUT}>
          <Button type={'primary'} htmlType={'submit'}>
            Login
          </Button>
          <Button
            type={'link'}
            className={'float-right'}
            onClick={async () => {
              if (router.query.redirectTo) {
                await router.push(
                  `/register?redirectTo=${router.query.redirectTo}`
                )
              } else {
                await router.push('/register')
              }
            }}
          >
            Register
          </Button>
          <Button
            type={'link'}
            className={'float-right'}
            onClick={() => router.push('/user/forgot-password')}
          >
            Reset Password
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}
