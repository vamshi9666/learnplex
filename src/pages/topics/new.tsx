import React from 'react'
import { Button, Form, Input } from 'antd'
import { useMutation, useQuery } from 'urql'
import NProgress from 'nprogress'

import { useUser } from '../../lib/hooks/useUser'
import { SEO } from '../../components/SEO'
import { Topic, UserRole } from '../../graphql/types'
import { slug } from '../../utils/slug'
import NotAuthorized from '../../components/error/NotAuthorized'
import NotAuthenticated from '../../components/error/NotAuthenticated'

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 8 },
}
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
}

export default function CreateTopic() {
  const { user, fetching } = useUser()

  const [form] = Form.useForm()
  const CREATE_TOPIC_MUTATION = `
    mutation($data: CreateTopicInput!) {
      createTopic(data: $data) {
        id
        slug
      }
    }
  `
  const TOPICS_QUERY = `
      query {
        topics {
          slug
        }
      }
  `
  const [, createTopic] = useMutation(CREATE_TOPIC_MUTATION)
  const [
    { data: topicsData, fetching: topicsFetching, error: topicsError },
    reExecuteTopicsQuery,
  ] = useQuery({
    query: TOPICS_QUERY,
  })

  const onFinish = async ({ title }: any) => {
    NProgress.start()
    createTopic({
      data: {
        title,
      },
    }).then((result) => {
      if (result.error) {
        console.log({ 'create topic error': result.error })
      } else {
        console.log({ result })
        reExecuteTopicsQuery()
        form.resetFields()
      }
    })
    NProgress.done()
  }

  if (fetching) return <p>User Loading....</p>
  if (!user) return <NotAuthenticated />
  if (!user.roles.includes(UserRole.Admin)) return <NotAuthorized />

  if (topicsFetching) return <p>Loading....</p>
  if (topicsError) return <p>Oh no... {topicsError.message}</p>

  return (
    <>
      <SEO title={'New Topic'} />

      <Form form={form} {...layout} onFinish={onFinish}>
        <Form.Item
          label={'Title'}
          name={'title'}
          rules={[
            { required: true, message: 'Please enter the new topic title!' },
            () => ({
              validator(rule, value) {
                if (!value) {
                  return Promise.resolve()
                }
                const slugs = topicsData.topics.map(
                  (topic: Topic) => topic.slug
                )
                if (slugs.includes(slug(value))) {
                  return Promise.reject('Topic already exists!')
                }
                return Promise.resolve()
              },
            }),
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item {...tailLayout}>
          <Button type={'primary'} htmlType={'submit'}>
            Add Topic
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}
