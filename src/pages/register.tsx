import React, { useContext } from 'react'
import { Button, Divider, Form, Input, message } from 'antd'
import { GithubOutlined } from '@ant-design/icons'
import urljoin from 'url-join'
import { useRouter } from 'next/router'
import NProgress from 'nprogress'
import { useMutation } from 'urql'

import { SEO } from '../components/SEO'
import { getServerEndPoint } from '../utils/getServerEndPoint'
import { FORM_LAYOUT, FORM_TAIL_LAYOUT } from '../constants'
import { logEvent } from '../utils/analytics'
import AlreadyRegistered from '../components/result/AlreadyRegistered'
import { UserContext } from '../lib/contexts/UserContext'

const validateMessages = {
  types: {
    email: 'Not a valid email!',
  },
}

export default function Register() {
  const router = useRouter()
  const VALIDATE_USERNAME_MUTATION = `
    mutation($username: String!) {
      validateUsername(username: $username)
    }
  `
  const VALIDATE_EMAIL_MUTATION = `
    mutation($email: String!) {
      validateEmail(email: $email)
    }
  `

  const REGISTER_MUTATION = `
    mutation($data: RegisterInput!) {
      register(data: $data) {
        accessToken
        user {
          name
          email
          username
          roles
          confirmed
        }
      }
    }
  `
  const [, register] = useMutation(REGISTER_MUTATION)
  const [, validateUsername] = useMutation(VALIDATE_USERNAME_MUTATION)
  const [, validateEmail] = useMutation(VALIDATE_EMAIL_MUTATION)
  const { setUser } = useContext(UserContext)

  const onFinish = async ({ name, email, username, password }: any) => {
    logEvent('guest', 'TRIES_TO_REGISTER')
    NProgress.start()
    register({
      data: {
        name,
        email,
        username,
        password,
      },
    }).then(async (result) => {
      if (result.error) {
        console.log({ 'register error': result.error })
      } else {
        console.log({ result })
        logEvent('guest', 'REGISTERS')
        setUser(result.data.register.user)
        message.warn('Please check your email inbox and verify your email')
        const redirectTo = router.query.redirectTo as string
        if (redirectTo) {
          await router.push(redirectTo)
        } else {
          await router.push('/')
        }
      }
    })
    NProgress.done()
  }

  const { user } = useContext(UserContext)
  const [form] = Form.useForm()

  if (user) {
    return <AlreadyRegistered />
  }

  return (
    <>
      <SEO title={'Register'} />

      <Form.Item {...FORM_TAIL_LAYOUT}>
        <Button
          block={true}
          icon={<GithubOutlined />}
          href={urljoin(getServerEndPoint(), 'auth', 'github')}
        >
          Register With Github
        </Button>
      </Form.Item>

      <Form.Item {...FORM_TAIL_LAYOUT}>
        <Divider>(OR)</Divider>
      </Form.Item>

      <Form
        form={form}
        {...FORM_LAYOUT}
        name={'register'}
        onFinish={onFinish}
        validateMessages={validateMessages}
      >
        <Form.Item
          name={'name'}
          label={'Name'}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name={'email'}
          label={'Email'}
          rules={[
            {
              required: true,
              type: 'email',
            },
            () => ({
              validator(rule, value) {
                if (!value) {
                  return Promise.resolve()
                }
                return validateEmail({ email: value }).then((result) => {
                  if (result.error) {
                    console.log({ validateEmailError: result.error })
                    return Promise.reject('Something went wrong!')
                  } else {
                    const valid = result.data.validateEmail
                    if (!valid) {
                      return Promise.reject(
                        'There is already an account with this email id!'
                      )
                    }
                    return Promise.resolve()
                  }
                })
              },
            }),
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name={'password'}
          rules={[
            {
              required: true,
              min: 5,
            },
          ]}
          label={'Password'}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name={'confirm_password'}
          rules={[
            {
              required: true,
              min: 5,
            },
            () => ({
              validator(rule, value) {
                if (!value) {
                  return Promise.resolve()
                }
                if (value !== form.getFieldValue('password')) {
                  return Promise.reject('Passwords do not match')
                }
                return Promise.resolve()
              },
            }),
          ]}
          label={'Confirm Password'}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name={'username'}
          rules={[
            {
              required: true,
            },
            () => ({
              validator(rule, value) {
                if (!value) {
                  return Promise.resolve()
                }
                return validateUsername({ username: value }).then((result) => {
                  if (result.error) {
                    console.log({ validateUsernameError: result.error })
                    return Promise.reject('Something went wrong!')
                  } else {
                    const valid = result.data.validateUsername
                    if (!valid) {
                      return Promise.reject(
                        'There is already an account with this username!'
                      )
                    }
                    return Promise.resolve()
                  }
                })
              },
            }),
          ]}
          label={'Username'}
        >
          <Input />
        </Form.Item>

        <Form.Item {...FORM_TAIL_LAYOUT}>
          <Button type={'primary'} htmlType={'submit'}>
            Register
          </Button>
          <Button
            className={'float-right'}
            type={'link'}
            onClick={async () => {
              if (router.query.redirectTo) {
                await router.push(
                  `/login?redirectTo=${router.query.redirectTo}`
                )
              } else {
                await router.push('/login')
              }
            }}
          >
            Login
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}
