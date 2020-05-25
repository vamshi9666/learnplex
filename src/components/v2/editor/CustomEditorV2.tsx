import React, { useState } from 'react'
import { Button, message, Typography } from 'antd'
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'

import { updateSectionTitle as updateSectionTitleInDB } from '../../../utils/updateSectionTitle'
import { Section } from '../../../graphql/types'
import customMdParser from '../../learn/Editor/lib/customMdParser'
import CustomKeyboardEventHandler from '../../learn/Editor/CustomKeyboardEventHandler'
import { savePageContent as savePageContentInDB } from '../../../utils/savePageContent'

interface Props {
  currentSection: Section
  resourceSlug: string
}

let MdEditor = dynamic(() => import('react-markdown-editor-lite'), {
  ssr: false,
})

export default function CustomEditorV2({
  currentSection,
  resourceSlug,
}: Props) {
  const router = useRouter()
  const [editorState, setEditorState] = useState(
    currentSection.page?.content ?? ''
  )
  const handleEditorChange = ({ text }: { text: string }) => {
    setEditorState(text)
  }
  const mdParser = customMdParser()
  const updateSectionTitle = async ({ title }: { title: string }) => {
    const result = await updateSectionTitleInDB({
      title,
      sectionId: currentSection.id,
    })
    if (result.error) {
      message.error(result.message)
      return
    }
    message.success('Section title updated successfully')
    console.log({ result })
    await router.push(`/learn/edit/${resourceSlug}${result.slugsPath}`)
  }

  const savePageContent = async () => {
    const result = await savePageContentInDB({
      pageContent: editorState,
      sectionId: currentSection.id,
    })
    if (result.error) {
      message.error(result.message)
      return
    }
    message.success('Page content updated successfully')
  }

  const goToPreviousSection = async () => {
    await router.push(
      `/learn/edit/${resourceSlug}${currentSection.previousSectionPath}`
    )
  }

  const goToNextSection = async () => {
    await router.push(
      `/learn/edit/${resourceSlug}${currentSection.nextSectionPath}`
    )
  }

  return (
    <>
      <div className={'clearfix'} />
      <Typography>
        <Typography.Title
          level={2}
          editable={{
            onChange: (value) => updateSectionTitle({ title: value }),
          }}
        >
          {currentSection.title}
        </Typography.Title>
      </Typography>

      <CustomKeyboardEventHandler
        save={() => savePageContent()}
        setEditorState={setEditorState}
      >
        <MdEditor
          value={editorState}
          style={{ minHeight: '75vh' }}
          renderHTML={(text: string) => mdParser.render(text)}
          onChange={handleEditorChange}
          placeholder={'Write something here...'}
        />
      </CustomKeyboardEventHandler>

      <div
        className={'text-center bg-component border-0 m-0 p-2'}
        style={{ position: 'sticky', bottom: 0 }}
      >
        <Button
          className={'float-left'}
          disabled={!currentSection.previousSectionPath}
          onClick={() => goToPreviousSection()}
        >
          <ArrowLeftOutlined />
          Previous
        </Button>
        <Button
          type={'primary'}
          onClick={() => savePageContent()}
          icon={<SaveOutlined />}
        >
          Save
        </Button>
        <Button
          className={'float-right'}
          disabled={!currentSection.nextSectionPath}
          onClick={() => goToNextSection()}
        >
          Next
          <ArrowRightOutlined />
        </Button>
      </div>
    </>
  )
}
