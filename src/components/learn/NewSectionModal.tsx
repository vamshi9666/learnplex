import { Form, Input, Modal } from 'antd'
import React from 'react'
import { useRouter } from 'next/router'
import { useMutation } from 'urql'
import NProgress from 'nprogress'

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
  const addSection = ({ title }: { title: string }) => {
    NProgress.start()
    addSectionMutation({
      data: {
        title: title,
        parentSectionId: parentSection.id,
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

  return (
    <>
      <Modal
        title={`Add new section under ' ${parentSection.title}'`}
        visible={show}
        onOk={() => form.submit()}
        onCancel={() => setShow(false)}
        okText={'Add'}
      >
        <Form
          form={form}
          name={'new-section-form'}
          initialValues={{ title: '' }}
          onFinish={({ title }) => addSection({ title })}
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
        </Form>
      </Modal>
    </>
  )
}
