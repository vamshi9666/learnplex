import React, { useContext, useState } from 'react'
import {
  Button,
  Col,
  Form,
  Grid,
  Input,
  Menu,
  message,
  Row,
  Tooltip,
} from 'antd'
import { CheckCircleTwoTone, ExclamationCircleTwoTone } from '@ant-design/icons'
import NProgress from 'nprogress'
import { useRouter } from 'next/router'

import { FORM_LAYOUT, FORM_TAIL_LAYOUT } from '../../constants'
import { SEO } from '../../components/SEO'
import Enrollments from '../../components/user/Enrollments'
import { UserContext } from '../../lib/contexts/UserContext'
import NotAuthenticated from '../../components/result/NotAuthenticated'
import {
  resendVerificationEmail as resendEmail,
  updatePassword,
  updateUser,
  validateEmail,
  validateUsername,
} from '../../graphql/mutations/auth'

export default function ProfileSettings() {
  const router = useRouter()
  const { user } = useContext(UserContext)

  const BASIC = 'basic'
  const SECURITY = 'security'
  const ENROLLMENTS = 'enrollments'
  const [selectedKey, setSelectedKey] = useState(BASIC)

  const [updatePasswordForm] = Form.useForm()
  const [updateUserForm] = Form.useForm()
  const { xs } = Grid.useBreakpoint()

  if (!user) {
    return <NotAuthenticated />
  }

  const resendVerificationEmail = async () => {
    NProgress.start()
    const result = await resendEmail()
    if (result.error) {
      message.error(result.message)
    } else {
      message.success('Please check your inbox for verification email.')
    }
    NProgress.done()
  }

  const onFinish = async ({ name, email, username }: any) => {
    const result = await updateUser({ name, email, username })
    if (result.error) {
      message.error(result.message)
      return
    }
    if (result) {
      message.success('Detqails updated successfully')
    } else {
      message.error('Something went wrong. Try again')
    }
    router.reload()
  }

  const onFinishPassword = async ({ current_password, password }: any) => {
    const result = await updatePassword({
      password,
      currentPassword: current_password,
    })
    if (result.error) {
      message.error(result.message)
      return
    }
    if (result) {
      message.success('Password Updated successfully')
    } else {
      message.error('Something went wrong. Try again')
    }
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
                          return Promise.reject('Something went wrong!')
                        }
                        if (!result) {
                          return Promise.reject(
                            'There is already an account with this email id!'
                          )
                        }
                        return Promise.resolve()
                      })
                    },
                  }),
                ]}
              >
                <Input
                  suffix={
                    !user.disabledOrConfirmed && (
                      <Tooltip
                        placement={'topLeft'}
                        title={'Please verify your email address.'}
                      >
                        <ExclamationCircleTwoTone twoToneColor={'magenta'} />
                      </Tooltip>
                    )
                  }
                />
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
                            return Promise.reject('Something went wrong!')
                          }
                          if (!result) {
                            return Promise.reject(
                              'There is already an account with this username!'
                            )
                          }
                          return Promise.resolve()
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
                  Update
                </Button>
                {!user.disabledOrConfirmed && (
                  <Button
                    className={'float-right'}
                    type={'link'}
                    onClick={() => resendVerificationEmail()}
                  >
                    Resend Verification Email
                  </Button>
                )}
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
