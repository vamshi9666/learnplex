import { useMutation } from 'urql'
import React, { useContext, useState } from 'react'
import { Alert, Button, Divider, Form, Input } from 'antd'
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

export default function Login() {
  const router = useRouter()

  const LOGIN_MUTATION = `
    mutation($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        accessToken
        user {
          name
          email
          username
          roles
        }
      }
    }
  `
  const [, login] = useMutation(LOGIN_MUTATION)
  const [loginError, setLoginError] = useState(false)
  const [errorDescription, setErrorDescription] = useState('')
  const { setUser } = useContext(UserContext)

  const onFinish = async ({ email, password }: any) => {
    NProgress.start()
    logEvent('guest', 'TRIES_TO_LOGIN')
    login({
      email,
      password,
    }).then(async (result) => {
      if (result.error) {
        console.log({ 'login error': result.error })
        setLoginError(true)
        setErrorDescription(result.error.message)
      } else {
        const { accessToken } = result.data.login
        console.log({ accessToken, result })
        setUser(result.data.login.user)
        // Cookie will be set by server
        // Cookies.set(ACCESS_TOKEN_COOKIE, accessToken)
        logEvent('guest', 'LOGGED_IN')
        await router.push('/')
      }
    })
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

      {loginError && (
        <Form.Item {...FORM_TAIL_LAYOUT}>
          <Alert
            message="Something went Wrong! Try again"
            description={errorDescription}
            type="error"
            closable
            onClose={() => setLoginError(false)}
          />
        </Form.Item>
      )}

      <Form {...FORM_LAYOUT} name={'login'} onFinish={onFinish}>
        <Form.Item
          name={'email'}
          label={'Email'}
          rules={[
            {
              required: true,
              type: 'email',
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
            onClick={() => router.push('/register')}
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
