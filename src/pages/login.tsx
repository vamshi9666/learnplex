import { useMutation } from 'urql'
import React, { useState } from 'react'
import { Alert, Button, Divider, Form, Input } from 'antd'
import { GithubOutlined } from '@ant-design/icons'
import urljoin from 'url-join'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'
import NProgress from 'nprogress'

import { SEO } from '../components/SEO'
import { getServerEndPoint } from '../utils/getServerEndPoint'
import { ACCESS_TOKEN_COOKIE } from '../constants'

export default function Login() {
  const router = useRouter()

  const LOGIN_MUTATION = `
    mutation($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        accessToken
      }
    }
  `
  const [, login] = useMutation(LOGIN_MUTATION)
  const [loginError, setLoginError] = useState(false)
  const [errorDescription, setErrorDescription] = useState('')

  const onFinish = async ({ email, password }: any) => {
    NProgress.start()
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
        Cookies.set(ACCESS_TOKEN_COOKIE, accessToken)
        await router.push('/')
      }
    })
    NProgress.done()
  }

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 8 },
  }

  const tailLayout = {
    wrapperCol: { offset: 8, span: 8 },
  }

  return (
    <>
      <SEO title={'Login'} />

      <Form.Item {...tailLayout}>
        <Button
          block={true}
          icon={<GithubOutlined />}
          href={urljoin(getServerEndPoint(), 'auth', 'github')}
        >
          Login With Github
        </Button>
      </Form.Item>

      <Form.Item {...tailLayout}>
        <Divider>(OR)</Divider>
      </Form.Item>

      {loginError && (
        <Form.Item {...tailLayout}>
          <Alert
            message="Something went Wrong! Try again"
            description={errorDescription}
            type="error"
            closable
            onClose={() => setLoginError(false)}
          />
        </Form.Item>
      )}

      <Form {...layout} name={'login'} onFinish={onFinish}>
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
          label={'password'}
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

        <Form.Item {...tailLayout}>
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
