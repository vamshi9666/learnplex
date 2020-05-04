import React from 'react'
import { Button, Divider, Form, Input, Skeleton } from 'antd'
import { GithubOutlined } from '@ant-design/icons'
import urljoin from 'url-join'
import { useRouter } from 'next/router'
import NProgress from 'nprogress'
import { useMutation, useQuery } from 'urql'

import { SEO } from '../components/SEO'
import { getServerEndPoint } from '../utils/getServerEndPoint'
import { User } from '../graphql/types'
import InternalServerError from '../components/error/InternalServerError'
import { FORM_LAYOUT, FORM_TAIL_LAYOUT } from '../constants'

const validateMessages = {
  types: {
    email: 'Not a valid email!',
  },
}

export default function Register() {
  const router = useRouter()
  const USERNAMES_QUERY = `
    query {
      users {
        email
        username
      }
    }
  `
  const [{ data, fetching, error }] = useQuery({
    query: USERNAMES_QUERY,
  })

  const REGISTER_MUTATION = `
    mutation($data: RegisterInput!) {
      register(data: $data)
    }
  `
  const [, register] = useMutation(REGISTER_MUTATION)

  const onFinish = async ({ name, email, username, password }: any) => {
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
        await router.push('/')
      }
    })
    NProgress.done()
  }

  if (fetching) return <Skeleton active={true} />
  if (error) return <InternalServerError message={error.message} />

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
                const emails = data.users.map((user: User) => user.email)
                if (emails.includes(value)) {
                  return Promise.reject(
                    'There is already an account with this email id!'
                  )
                }
                return Promise.resolve()
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
                const usernames = data.users.map((user: User) => user.username)
                if (usernames?.includes(value)) {
                  return Promise.reject('This username is already taken!')
                }
                return Promise.resolve()
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
            onClick={() => router.push('/login')}
          >
            Login
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}
