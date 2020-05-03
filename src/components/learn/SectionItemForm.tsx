import { Button, Form, Input, Tooltip, Popconfirm, Skeleton } from 'antd'
import React, { useRef, useState } from 'react'
import {
  CheckCircleOutlined,
  CheckCircleTwoTone,
  DeleteTwoTone,
  DragOutlined,
} from '@ant-design/icons'
import { useMutation } from 'urql'
import { useRouter } from 'next/router'
import NProgress from 'nprogress'
import { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd'

import { Section } from '../../graphql/types'
import { slug } from '../../utils/slug'
import { useSections } from '../../lib/hooks/useSections'

export default function SectionItemForm({
  section,
  sectionsMap,
  dragHandleProps,
}: {
  section: Section
  sectionsMap: Map<string, Section>
  dragHandleProps: DraggableProvidedDragHandleProps | undefined
}) {
  const router = useRouter()
  const resourceSlug = router.query.resource as string
  const username = router.query.username as string
  const {
    setSection: setSectionInSectionsMap,
    deleteSection: deleteSectionInSectionsMap,
  } = useSections({ resourceSlug, username })
  const [editing, setEditing] = useState(false)

  const renders = useRef(0)
  console.log(`renders: ${renders.current++}`)

  const handleTitleChange = ({ e, section }: { e: any; section: Section }) => {
    console.log(e.target.value)
    if (slug(e.target.value) !== section.slug) {
      setEditing(true)
    } else {
      setEditing(false)
    }
  }

  const UPDATE_SECTION_MUTATION = `
    mutation($data: UpdateSectionInput!) {
      updateSection(data: $data) {
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
  const DELETE_SECTION_MUTATION = `
    mutation($sectionId: String!) {
      deleteSection(sectionId: $sectionId)
    }
  `
  const [, updateSectionMutation] = useMutation(UPDATE_SECTION_MUTATION)
  const [, deleteSectionMutation] = useMutation(DELETE_SECTION_MUTATION)

  const updateSection = async ({
    title,
    sectionId,
  }: {
    title: string
    sectionId: string
  }) => {
    NProgress.start()
    updateSectionMutation({
      data: {
        title,
        sectionId,
      },
    }).then((result) => {
      if (result.error) {
        console.log({ updateSectionError: result.error })
      } else {
        console.log({
          section: result.data.updateSection,
          old: sectionsMap.get(section.id),
        })
        setSectionInSectionsMap({ updatedSection: result.data.updateSection })
        setEditing(false)
      }
    })
    NProgress.done()
  }

  const removeSection = async ({
    sectionId,
    parentSectionId,
  }: {
    sectionId: string
    parentSectionId: string
  }) => {
    NProgress.start()
    console.log({ sectionId, parentSectionId })
    deleteSectionMutation({
      sectionId,
    }).then((result) => {
      if (result.error) {
        console.log({ sectionDeleteError: result.error })
      } else {
        console.log({ result })
        deleteSectionInSectionsMap({ sectionId, parentSectionId })
        router.reload()
      }
    })
    NProgress.done()
  }

  if (!section) return <Skeleton active={true} />

  return (
    <Form
      name={`form-${section.id}`}
      initialValues={{ title: section.title }}
      onFinish={({ title }) => updateSection({ title, sectionId: section.id })}
    >
      <Form.Item
        name={'title'}
        rules={[
          {
            required: true,
          },
          () => ({
            validator(rule, value) {
              const parentSectionId = section.parentSection!.id
              const parentSection = sectionsMap.get(parentSectionId)!
              const slugs = parentSection.sections
                .filter((currentSection) => currentSection.id !== section.id)
                .map((currentSection) => sectionsMap.get(currentSection.id)!)
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
        <Input
          onChange={(e) => handleTitleChange({ e, section })}
          suffix={
            <>
              <Tooltip
                placement={'topLeft'}
                title={editing ? 'Save' : 'Already Saved'}
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
                  onConfirm={() =>
                    removeSection({
                      sectionId: section.id,
                      parentSectionId: section.parentSection!.id,
                    })
                  }
                  okText={'Continue'}
                  cancelText={'Cancel'}
                  okType={'danger'}
                  placement={'topRight'}
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
