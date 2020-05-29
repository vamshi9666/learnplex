import { Button, Form, Input, message } from 'antd'
import { useRouter } from 'next/router'
import NProgress from 'nprogress'
import { useMutation } from 'urql'

import { SEO } from '../../components/SEO'
import { FORM_LAYOUT, FORM_TAIL_LAYOUT } from '../../constants'

export default function ForgotPassword() {
  const FORGOT_PASSWORD_MUTATION = `
    mutation($email: String!) {
      forgotPassword(email: $email)
    }
  `
  const [, forgotPassword] = useMutation(FORGOT_PASSWORD_MUTATION)
  const router = useRouter()

  const onFinish = async ({ email }: any) => {
    NProgress.start()
    forgotPassword({
      email,
    }).then(async (result) => {
      if (result.error) {
        console.log({ 'forgot-password error': result.error })
      } else {
        console.log({ result })
        message.success(
          'Please check your inbox for instructions to reset your password.'
        )
        await router.push('/')
      }
    })
    NProgress.done()
  }

  return (
    <>
      <SEO title={'Forgot Password'} />
      <Form {...FORM_LAYOUT} name={'forgot-password'} onFinish={onFinish}>
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
        <Form.Item {...FORM_TAIL_LAYOUT}>
          <Button type={'primary'} htmlType={'submit'}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}
