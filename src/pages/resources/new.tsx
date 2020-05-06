import React from 'react'
import { Button, Form, Input, Select, Skeleton } from 'antd'
import { useMutation, useQuery } from 'urql'
import { useRouter } from 'next/router'
import NProgress from 'nprogress'

import { SEO } from '../../components/SEO'
import { Resource, Topic } from '../../graphql/types'
import { slug } from '../../utils/slug'
import { useUser } from '../../lib/hooks/useUser'
import NotAuthenticated from '../../components/error/NotAuthenticated'
import InternalServerError from '../../components/error/InternalServerError'
import { FORM_LAYOUT, FORM_TAIL_LAYOUT } from '../../constants'

export default function CreateResource() {
  const [form] = Form.useForm()
  const router = useRouter()
  const { user, fetching } = useUser()

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
        user {
          username
        }
        description
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

  const onFinish = async ({ title, topic: topicId, description }: any) => {
    NProgress.start()
    createResource({
      data: {
        title,
        topicId,
        description,
      },
    }).then((result) => {
      if (result.error) {
        console.log({ 'create resource error': result.error })
      } else {
        console.log({ result })
        const username = result.data.createResource.user.username
        const resourceSlug = result.data.createResource.slug
        router.push(`/${username}/learn/edit/${resourceSlug}/resource-index`)
      }
    })
    NProgress.done()
  }

  if (fetching) return <Skeleton active={true} />
  if (!user) return <NotAuthenticated />
  if (topicsFetching || resourcesFetching) return <Skeleton active={true} />
  if (topicsError) return <InternalServerError message={topicsError.message} />
  if (resourcesError)
    return <InternalServerError message={resourcesError.message} />

  return (
    <>
      <SEO title={'New Resource'} />

      <Form form={form} {...FORM_LAYOUT} onFinish={onFinish}>
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

        <Form.Item
          label={'Description'}
          name={'description'}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item {...FORM_TAIL_LAYOUT}>
          <Button type={'primary'} htmlType={'submit'}>
            Create
          </Button>
          <Button
            className={'float-right'}
            onClick={() => router.push(`/resources`)}
          >
            My Resources
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}
