import { useRouter } from 'next/router'
import { Button, Form, Input } from 'antd'
import NProgress from 'nprogress'
import { useMutation } from 'urql'
import Cookies from 'js-cookie'

import { SEO } from '../../../components/SEO'
import {
  ACCESS_TOKEN_COOKIE,
  FORM_LAYOUT,
  FORM_TAIL_LAYOUT,
} from '../../../constants'

export default function ChangePassword() {
  const router = useRouter()
  const CHANGE_PASSWORD_MUTATION = `
    mutation($data: ChangePasswordInput!) {
      changePassword(data: $data) {
        accessToken
      }
    }
  `
  const [, changePassword] = useMutation(CHANGE_PASSWORD_MUTATION)

  const onFinish = async ({ password }: any) => {
    NProgress.start()
    changePassword({
      data: {
        password,
        token: router.query.token as string,
      },
    }).then(async (result) => {
      if (result.error) {
        console.log({ 'change-password error': result.error })
      } else {
        const { accessToken } = result.data.changePassword
        console.log({ accessToken })
        Cookies.set(ACCESS_TOKEN_COOKIE, accessToken)
        await router.push('/')
      }
    })
    NProgress.done()
  }

  return (
    <>
      <SEO title={'Change Password'} />
      <Form {...FORM_LAYOUT} name={'change-password'} onFinish={onFinish}>
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
        <Form.Item {...FORM_TAIL_LAYOUT}>
          <Button type={'primary'} htmlType={'submit'}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}
