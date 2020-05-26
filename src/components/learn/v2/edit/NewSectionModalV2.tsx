import React, { useContext, useState } from 'react'
import { Button, Form, Input, message, Modal, Typography } from 'antd'
import { FileMarkdownOutlined } from '@ant-design/icons'

import { SectionsContext } from '../../../../lib/contexts/SectionsContext'
import { Section } from '../../../../graphql/types'
import { slug } from '../../../../utils/slug'
import { addSection as addSectionInDB } from '../../../../utils/addSection'

interface Props {
  visible: boolean
  parentSectionId: string
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>
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

let KeyboardEventHandler: any
if (process.browser) {
  KeyboardEventHandler = require('react-keyboard-event-handler')
}

export default function NewSectionModalV2({
  visible,
  parentSectionId,
  setShowModal,
}: Props) {
  const [form] = Form.useForm()
  const [showContentBox, setShowContentBox] = useState(false)
  const { sectionsMap, reValidate } = useContext(SectionsContext)
  const parentSection = sectionsMap[parentSectionId]

  const reset = () => {
    setShowModal(false)
    setShowContentBox(false)
  }

  const addSection = async ({
    title,
    content,
  }: {
    title: string
    content: string
  }) => {
    const result = await addSectionInDB({ title, content, parentSectionId })
    if (result.error) {
      message.error(result.message)
      return
    }
    message.success('New section added successfully')
    reValidate()
    reset()
    form.resetFields()
  }

  return (
    <Modal
      title={`Add new section under '${parentSection.title}'`}
      visible={visible}
      onOk={() => form.submit()}
      onCancel={() => reset()}
      okText={'Add'}
    >
      <Form
        {...FORM_LAYOUT_LOCAL}
        form={form}
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
          {visible && (
            <Form.Item
              name={'title'}
              label={'Title'}
              rules={[
                { required: true },
                () => ({
                  validator(rule, value) {
                    const slugs = parentSection.sections
                      .map((section: Section) => sectionsMap[section.id])
                      .map((section: Section) => section.slug)
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
              <Input autoFocus />
            </Form.Item>
          )}
          {!showContentBox && (
            <Form.Item {...FORM_TAIL_LAYOUT_LOCAL}>
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  setShowContentBox((a) => !a)
                }}
              >
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
                autoFocus
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
  )
}
