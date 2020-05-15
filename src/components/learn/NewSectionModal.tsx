import { Button, Form, Input, Modal, Typography } from 'antd'
import React from 'react'
import { useRouter } from 'next/router'
import { useMutation } from 'urql'
import NProgress from 'nprogress'
import { FileMarkdownOutlined } from '@ant-design/icons'

import { slug } from '../../utils/slug'
import { Section } from '../../graphql/types'
import { useSections } from '../../lib/hooks/useSections'

export default function NewSectionModal({
  parentSectionId,
  show,
  setShow,
  sectionsMap,
}: {
  parentSectionId: string
  show: boolean
  setShow: React.Dispatch<React.SetStateAction<boolean>>
  sectionsMap: Map<string, Section>
}) {
  const [form] = Form.useForm()
  const parentSection = sectionsMap.get(parentSectionId)!
  const ADD_SECTION_MUTATION = `
    mutation($data: AddSectionInput!) {
      addSection(data: $data) {
        id
        title
        slug
        isBaseSection
        isPage
        hasSubSections
        sections {
          id
          order
        }
        parentSection {
          id
        }
        page {
          content
        }
      }
    }
  `
  const router = useRouter()
  const username = router.query.username as string
  const resourceSlug = router.query.resource as string
  const { setSection } = useSections({ username, resourceSlug })
  const [, addSectionMutation] = useMutation(ADD_SECTION_MUTATION)
  const addSection = ({
    title,
    content,
  }: {
    title: string
    content: string
  }) => {
    NProgress.start()
    addSectionMutation({
      data: {
        title: title,
        parentSectionId: parentSection.id,
        content,
      },
    }).then((result) => {
      if (result.error) {
        console.log({ addSectionError: result.error })
      } else {
        console.log({ result })
        const newSection = result.data.addSection
        setSection({ updatedSection: newSection })
        setShow(false)
      }
    })
    NProgress.done()
    form.resetFields()
  }

  const FORM_LAYOUT_LOCAL = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 4 },
      md: { span: 4 },
      lg: { span: 4 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 20 },
      md: { span: 20 },
      lg: { span: 20 },
    },
  }

  return (
    <>
      <Modal
        title={`Add new section under '${parentSection.title}'`}
        visible={show}
        onOk={() => form.submit()}
        onCancel={() => setShow(false)}
        okText={'Add'}
      >
        <Form
          {...FORM_LAYOUT_LOCAL}
          form={form}
          name={'new-section-form'}
          initialValues={{ title: '' }}
          onFinish={({ title, content }) => addSection({ title, content })}
        >
          <Form.Item
            name={'title'}
            label={'Title'}
            rules={[
              {
                required: true,
              },
              () => ({
                validator(rule, value) {
                  const slugs = parentSection.sections
                    .map(
                      (currentSection) => sectionsMap.get(currentSection.id)!
                    )
                    .map((currentSection) => currentSection.slug)
                  if (slugs.includes(slug(value))) {
                    return Promise.reject(
                      'A section with this title already exists'
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
            name={'content'}
            label={'Content'}
            help={
              <>
                <Button
                  type={'link'}
                  target={'_blank'}
                  href={
                    'https://guides.github.com/features/mastering-markdown/'
                  }
                  className={'p-0 m-0'}
                  icon={<FileMarkdownOutlined />}
                >
                  Styling with Markdown is supported.
                </Button>
                <Typography>
                  <Typography.Text>
                    <b>Note:</b> If you add content for this section, there
                    cannot be any more subsections for this page.
                    <br />
                    <br />
                    You can always add/edit content later.
                  </Typography.Text>
                </Typography>
              </>
            }
          >
            <Input.TextArea
              autoSize={{
                minRows: 3,
                maxRows: 10,
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
