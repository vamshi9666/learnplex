import React, { useContext, useEffect, useState } from 'react'
import { Button, Form, Input, message, Popconfirm, Tooltip } from 'antd'
import {
  CheckCircleOutlined,
  CheckCircleTwoTone,
  DeleteTwoTone,
  DragOutlined,
} from '@ant-design/icons'
import { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd'

import { slug } from '../../../../utils/slug'
import { updateSectionTitle as updateSectionTitleInDB } from '../../../../utils/updateSectionTitle'
import { SectionsContext } from '../../../../lib/contexts/SectionsContext'
import { Section } from '../../../../graphql/types'
import { deleteSection as deleteSectionInDB } from '../../../../utils/deleteSection'

interface Props {
  currentSectionId: string
  dragHandleProps: DraggableProvidedDragHandleProps | undefined
}

export default function EditSectionItemFormV2({
  currentSectionId,
  dragHandleProps,
}: Props) {
  const { sectionsMap, reValidate } = useContext(SectionsContext)
  const [form] = Form.useForm()
  const [currentSection, setCurrentSection] = useState(
    sectionsMap[currentSectionId]
  )

  useEffect(() => {
    setCurrentSection(sectionsMap[currentSectionId])
  }, [currentSectionId, sectionsMap])

  const parentSectionId = currentSection.parentSectionId!
  const parentSection = sectionsMap[parentSectionId]
  const [editing, setEditing] = useState(false)
  const updateEditing = (title: string) =>
    setEditing(slug(title) !== currentSection.slug)

  const updateSectionTitle = async ({ title }: { title: string }) => {
    const result = await updateSectionTitleInDB({
      title,
      sectionId: currentSectionId,
    })
    if (result.error) {
      message.error(result.message)
      return
    }
    message.success('Title updated successfully')
    setEditing(false)
    reValidate()
  }

  const deleteSection = async () => {
    const result = await deleteSectionInDB({ sectionId: currentSectionId })
    if (result.error) {
      message.error(result.message)
      return
    }
    message.success('Section Deleted Successfully')
    reValidate()
  }

  return (
    <Form
      form={form}
      initialValues={{ title: currentSection.title }}
      onFinish={({ title }) => updateSectionTitle({ title })}
    >
      <Form.Item
        name={'title'}
        rules={[
          { required: true },
          () => ({
            validator(rule, value) {
              const slugs = parentSection.sections
                .filter((section: Section) => section.id !== currentSectionId)
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
        <Input
          onChange={(e) => updateEditing(e.target.value)}
          suffix={
            <>
              <Tooltip
                placement={'topLeft'}
                title={editing ? 'Click to Save' : 'Already Saved'}
              >
                <Button
                  type={'link'}
                  htmlType={'submit'}
                  icon={
                    editing ? (
                      <CheckCircleOutlined />
                    ) : (
                      <CheckCircleTwoTone twoToneColor={'#52c41a'} />
                    )
                  }
                />
              </Tooltip>
              <Tooltip placement={'topLeft'} title={'Delete'}>
                <Popconfirm
                  title={'This will delete all the contents of this section.'}
                  okText={'Continue'}
                  cancelText={'Cancel'}
                  okType={'danger'}
                  placement={'topRight'}
                  onConfirm={() => deleteSection()}
                >
                  <DeleteTwoTone
                    className={'font-larger'}
                    twoToneColor={'#eb2f96'}
                  />
                </Popconfirm>
              </Tooltip>
              <div className={'ml-3'} {...dragHandleProps}>
                <DragOutlined />
              </div>
            </>
          }
        />
      </Form.Item>
    </Form>
  )
}
