import { Button, Form, Input, Modal, Skeleton, Typography } from 'antd'
import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { useMutation } from 'urql'
import NProgress from 'nprogress'
import { FileMarkdownOutlined } from '@ant-design/icons'

import { slug } from '../../utils/slug'
import { Section } from '../../graphql/types'
import { useSections } from '../../lib/hooks/useSections'
import { populateSlugsForResource } from '../../utils/populateSlugs'

let KeyboardEventHandler: any
if (process.browser) {
  KeyboardEventHandler = require('react-keyboard-event-handler')
}

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
  const { setSection, resourceId } = useSections({ username, resourceSlug })
  const [, addSectionMutation] = useMutation(ADD_SECTION_MUTATION)
  const [showContentBox, setShowContentBox] = useState(false)
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
    }).then(async (result) => {
      if (result.error) {
        console.log({ addSectionError: result.error })
      } else {
        console.log({ result })
        const newSection = result.data.addSection
        setSection({ updatedSection: newSection })
        reset()
        await populateSlugsForResource({ resourceId })
        form.resetFields()
        NProgress.done()
      }
    })
    NProgress.done()
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

  const FORM_TAIL_LAYOUT_LOCAL = {
    wrapperCol: {
      xs: { offset: 0, span: 24 },
      sm: { offset: 4, span: 20 },
      md: { offset: 4, span: 20 },
      lg: { offset: 4, span: 20 },
    },
  }

  const toggleShowContent = (e: any) => {
    e.preventDefault()
    setShowContentBox(!showContentBox)
  }

  const reset = () => {
    setShow(false)
    setShowContentBox(false)
  }

  if (!process.browser) {
    return <Skeleton active={true} />
  }

  return (
    <>
      <Modal
        title={`Add new section under '${parentSection.title}'`}
        visible={show}
        onOk={() => form.submit()}
        onCancel={() => reset()}
        okText={'Add'}
      >
        <Form
          {...FORM_LAYOUT_LOCAL}
          form={form}
          name={'new-section-form'}
          initialValues={{ title: '' }}
          onFinish={({ title, content }) => addSection({ title, content })}
        >
          <KeyboardEventHandler
            handleKeys={['ctrl+enter', 'meta+enter']}
            onKeyEvent={(key: string, e: KeyboardEvent) => {
              console.log({ e, key })
              if (key === 'meta+enter' || key === 'ctrl+enter') {
                addSection({
                  title: form.getFieldValue('title') as string,
                  content: form.getFieldValue('content') as string,
                })
              }
            }}
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
            {!showContentBox && (
              <Form.Item {...FORM_TAIL_LAYOUT_LOCAL}>
                <Button onClick={(e) => toggleShowContent(e)}>
                  Add Content
                </Button>
              </Form.Item>
            )}

            {showContentBox && (
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
            )}
          </KeyboardEventHandler>
        </Form>
      </Modal>
    </>
  )
}
