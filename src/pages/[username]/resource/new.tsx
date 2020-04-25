import React from 'react'
import { Button, Form, Input, Select } from 'antd'
import { useMutation, useQuery } from 'urql'
import { useRouter } from 'next/router'
import NProgress from 'nprogress'

import { SEO } from '../../../components/SEO'
import { Resource, Topic } from '../../../graphql/types'
import { slug } from '../../../utils/slug'
import { useUser } from '../../../lib/hooks/useUser'

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 8 },
}
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
}

export default function NewResource() {
  const [form] = Form.useForm()
  const router = useRouter()
  const { user, fetching, error } = useUser()

  const TOPICS_QUERY = `
      query {
        topics {
          id
          title
        }
      }
  `

  // Since this query is authenticated query, there is no need to pass
  //    username, we just fetch the resources of the currentUser
  const RESOURCES_QUERY = `
      query {
        resources {
          slug
        }
      }
  `
  const CREATE_RESOURCE_MUTATION = `
    mutation($data: CreateResourceInput!) {
      createResource(data: $data) {
        id
        slug
      }
    }
  `
  const [, createResource] = useMutation(CREATE_RESOURCE_MUTATION)

  const [
    { data: resourcesData, fetching: resourcesFetching, error: resourcesError },
    reExecuteResourcesQuery,
  ] = useQuery({
    query: RESOURCES_QUERY,
  })

  const [
    { data: topicsData, fetching: topicsFetching, error: topicsError },
  ] = useQuery({
    query: TOPICS_QUERY,
  })

  const onFinish = async ({ title, topic: topicId }: any) => {
    NProgress.start()
    createResource({
      data: {
        title,
        topicId,
      },
    }).then((result) => {
      if (result.error) {
        console.log({ 'create resource error': result.error })
      } else {
        console.log({ result })
        reExecuteResourcesQuery()
        form.resetFields()
      }
    })
    NProgress.done()
  }

  if (fetching) return <p>User Loading....</p>
  if (!user) return <p>Oh no... {error?.message}</p>
  if (router.query.username !== user.username) return <p>Access Forbidden...</p>
  if (topicsFetching || resourcesFetching) return <p>Loading....</p>
  if (topicsError) return <p>Oh no... {topicsError.message}</p>
  if (resourcesError) return <p>Oh no... {resourcesError.message}</p>

  return (
    <>
      <SEO title={'New Resource'} />

      <Form form={form} {...layout} onFinish={onFinish}>
        <Form.Item
          label={'Title'}
          name={'title'}
          rules={[
            { required: true, message: 'Please enter the new resource title!' },
            () => ({
              validator(rule, value) {
                if (!value) {
                  return Promise.resolve()
                }
                const slugs = resourcesData.resources.map(
                  (resource: Resource) => resource.slug
                )
                if (slugs.includes(slug(value))) {
                  return Promise.reject('Resource already exists!')
                }
                return Promise.resolve()
              },
            }),
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item name={'topic'} label={'Topic'} rules={[{ required: true }]}>
          <Select placeholder={'Select a topic for the resource'}>
            {topicsData.topics.map((topic: Topic) => (
              <Select.Option key={topic.id} value={topic.id}>
                {topic.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item {...tailLayout}>
          <Button type={'primary'} htmlType={'submit'}>
            Add Resource
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}
