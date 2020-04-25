import { Button, Form, Input } from 'antd'
import { useRouter } from 'next/router'
import NProgress from 'nprogress'
import { useMutation } from 'urql'

import { SEO } from '../../components/SEO'

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
      <SEO title={'Forgot Password'} />
      <Form {...layout} name={'forgot-password'} onFinish={onFinish}>
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
        <Form.Item {...tailLayout}>
          <Button type={'primary'} htmlType={'submit'}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}
