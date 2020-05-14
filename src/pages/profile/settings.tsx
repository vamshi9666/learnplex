import React, { useState } from 'react'
import {
  Button,
  Col,
  Form,
  Grid,
  Input,
  Menu,
  message,
  Row,
  Skeleton,
} from 'antd'
import { useMutation } from 'urql'
import { useRouter } from 'next/router'

import { useUser } from '../../lib/hooks/useUser'
import InternalServerError from '../../components/result/InternalServerError'
import { FORM_LAYOUT, FORM_TAIL_LAYOUT } from '../../constants'
import { SEO } from '../../components/SEO'
import Enrollments from '../../components/user/Enrollments'

export default function ProfileSettings() {
  const { user, fetching, error } = useUser()

  const BASIC = 'basic'
  const SECURITY = 'security'
  const ENROLLMENTS = 'enrollments'
  const [selectedKey, setSelectedKey] = useState(BASIC)

  const UPDATE_USER_MUTATION = `
    mutation($data: UpdateUserInput!) {
      updateUser(data: $data)
    }
  `

  const UPDATE_PASSWORD_MUTATION = `
    mutation($data: UpdatePasswordInput!) {
      updatePassword(data: $data)
    }
  `

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

  const router = useRouter()
  const [, updateUser] = useMutation(UPDATE_USER_MUTATION)
  const [, validateUsername] = useMutation(VALIDATE_USERNAME_MUTATION)
  const [, validateEmail] = useMutation(VALIDATE_EMAIL_MUTATION)
  const [, updatePassword] = useMutation(UPDATE_PASSWORD_MUTATION)
  const [updatePasswordForm] = Form.useForm()
  const [updateUserForm] = Form.useForm()
  const { xs } = Grid.useBreakpoint()

  if (fetching) return <Skeleton active={true} />
  if (error) return <InternalServerError message={error.message} />

  const onFinish = ({ name, email, username }: any) => {
    updateUser({
      data: {
        name,
        email,
        username,
      },
    }).then((result) => {
      if (result.error) {
        console.log({ updateError: result.error })
      } else {
        console.log({ result })
        if (result.data.updateUser) {
          message.success('Detqails updated successfully')
        } else {
          message.error('Something went wrong. Try again')
        }
        router.reload()
      }
    })
  }

  const onFinishPassword = ({ current_password, password }: any) => {
    updatePassword({
      data: {
        password,
        currentPassword: current_password,
      },
    }).then((result) => {
      if (result.error) {
        console.log({ updatePasswordError: result.error })
      } else {
        console.log({ result })
        updatePasswordForm.resetFields()
        if (result.data.updatePassword) {
          message.success('Password Updated successfully')
        } else {
          message.error('Something went wrong. Try again')
        }
      }
    })
  }

  return (
    <>
      <SEO title={'Profile'} />
      <Row gutter={[16, 16]}>
        <Col sm={8} md={6} lg={5} xs={24}>
          <Menu
            mode={xs ? 'horizontal' : 'inline'}
            selectedKeys={[selectedKey]}
            onClick={({ key }) => setSelectedKey(key)}
          >
            <Menu.Item key={'basic'}>Basic Settings</Menu.Item>
            <Menu.Item key={'security'}>Security Settings</Menu.Item>
            <Menu.Item key={'enrollments'}>Enrollments</Menu.Item>
          </Menu>
        </Col>
        <Col sm={16} md={18} lg={17} xs={24}>
          {selectedKey === BASIC && (
            <Form
              form={updateUserForm}
              {...FORM_LAYOUT}
              name={'update-user'}
              onFinish={onFinish}
              initialValues={{
                name: user.name,
                email: user.email,
                username: user?.username,
              }}
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
                      if (!value || value === user?.email) {
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
                name={'username'}
                rules={[
                  {
                    required: true,
                  },
                  () => ({
                    validator(rule, value) {
                      if (!value || value === user?.username) {
                        return Promise.resolve()
                      }
                      return validateUsername({ username: value }).then(
                        (result) => {
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
                        }
                      )
                    },
                  }),
                ]}
                label={'Username'}
              >
                <Input />
              </Form.Item>

              <Form.Item {...FORM_TAIL_LAYOUT}>
                <Button type={'primary'} htmlType={'submit'}>
                  Update Information
                </Button>
              </Form.Item>
            </Form>
          )}
          {selectedKey === SECURITY && (
            <Form
              {...FORM_LAYOUT}
              form={updatePasswordForm}
              name={'update-password'}
              onFinish={onFinishPassword}
            >
              <Form.Item
                name={'current_password'}
                rules={[
                  {
                    required: true,
                  },
                ]}
                label={'Current Password'}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item
                name={'password'}
                rules={[
                  {
                    required: true,
                    min: 5,
                  },
                ]}
                label={'New Password'}
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
                      if (
                        value !== updatePasswordForm.getFieldValue('password')
                      ) {
                        return Promise.reject('Passwords do not match')
                      }
                      return Promise.resolve()
                    },
                  }),
                ]}
                label={'Confirm New Password'}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item {...FORM_TAIL_LAYOUT}>
                <Button type={'primary'} htmlType={'submit'}>
                  Update Password
                </Button>
              </Form.Item>
            </Form>
          )}
          {selectedKey === ENROLLMENTS && <Enrollments />}
        </Col>
      </Row>
    </>
  )
}
