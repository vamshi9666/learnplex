import React, { useContext, useEffect, useState } from 'react'
import { Button, Form, Input, message, Select } from 'antd'
import { useRouter } from 'next/router'
import NProgress from 'nprogress'

import { SEO } from '../../components/SEO'
import { Resource, Topic } from '../../graphql/types'
import NotAuthenticated from '../../components/result/NotAuthenticated'
import { FORM_LAYOUT, FORM_TAIL_LAYOUT } from '../../constants'
import { UserContext } from '../../lib/contexts/UserContext'
import { slug } from '../../utils/slug'
import { createResource } from '../../utils/createResource'
import { getTopics } from '../../utils/getTopics'
import { getAllResourceSlugs } from '../../utils/getAllResourceSlugs'

export default function CreateResource() {
  const [form] = Form.useForm()
  const [slugChangedByUser, setSlugChangedByUser] = useState(false)
  const router = useRouter()
  const { user } = useContext(UserContext)

  const [resources, setResources] = useState([])
  const [topics, setTopics] = useState([])
  useEffect(() => {
    getAllResourceSlugs().then((result) => {
      if (result.error) {
        message.error(result.message)
      } else {
        setResources(result)
      }
    })
  }, [])
  useEffect(() => {
    getTopics().then((result) => {
      if (result.error) {
        message.error(result.message)
      } else {
        setTopics(result)
      }
    })
  }, [])

  const onFinish = async ({
    title,
    topic: topicId,
    description,
    slug,
  }: any) => {
    console.log({ title, topicId, description, slug })
    NProgress.start()
    const result = await createResource({ title, topicId, description, slug })
    if (result.error) {
      message.error(result.message)
    } else {
      await router.push(`/learn/edit/${slug}`)
    }
    NProgress.done()
  }

  if (!user) return <NotAuthenticated />

  const handleChange = (e: any) => {
    if (!slugChangedByUser) {
      form.setFieldsValue({ slug: slug(e.target.value) })
    }
  }

  return (
    <>
      <SEO title={'New Resource'} />

      <Form form={form} {...FORM_LAYOUT} onFinish={onFinish}>
        <Form.Item
          label={'Title'}
          name={'title'}
          rules={[
            { required: true, message: 'Please enter the new resource title!' },
          ]}
        >
          <Input onChange={handleChange} />
        </Form.Item>

        <Form.Item name={'topic'} label={'Topic'} rules={[{ required: true }]}>
          <Select
            showSearch
            placeholder={'Select a topic for the resource'}
            filterOption={(input, option) =>
              option?.props.children
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0
            }
          >
            {topics.map((topic: Topic) => (
              <Select.Option key={topic.id} value={topic.id}>
                {topic.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label={'Custom URL'}
          name={'slug'}
          rules={[
            { required: true },
            () => ({
              validator(rule, value) {
                if (!value) {
                  return Promise.resolve()
                }
                const slugs = resources.map(
                  (resource: Resource) => resource.slug
                )
                if (slugs.includes(value)) {
                  return Promise.reject('Url already taken!')
                }
                return Promise.resolve()
              },
            }),
          ]}
        >
          <Input
            onKeyPress={() => setSlugChangedByUser(true)}
            addonBefore={'https://coderplex.in/learn/'}
          />
        </Form.Item>

        <Form.Item
          label={'Description'}
          name={'description'}
          rules={[{ required: true }]}
        >
          <Input.TextArea autoSize={{ minRows: 3, maxRows: 8 }} />
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
