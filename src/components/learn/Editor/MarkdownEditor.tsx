import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { message, Skeleton, Typography } from 'antd'
import NProgress from 'nprogress'
// import IdleTimer from 'react-idle-timer'

import usePreventRouteChangeIf from '../../../lib/hooks/usePreventRouteChangeIf'
import BottomActionControls from './BottomActionControls'
import CustomKeyboardEventHandler from './CustomKeyboardEventHandler'
import customMdParser from './lib/customMdParser'

let MdEditor = dynamic(() => import('react-markdown-editor-lite'), {
  ssr: false,
})

export default function MarkdownEditor({
  inEditMode,
  save,
  pageContent,
  title,
  showPreviousSection,
  goToPreviousSection,
  showNextSection,
  goToNextSection,
  completeSection,
  isSectionComplete,
  hasEnrolled,
  resourceId,
  updateSectionTitle,
}: {
  inEditMode: boolean
  save: ({ editorState }: { editorState: string }) => void
  pageContent: string
  title: string
  showPreviousSection: boolean
  goToPreviousSection: () => void
  showNextSection: boolean
  goToNextSection: () => void
  completeSection: () => void
  isSectionComplete: boolean
  hasEnrolled: boolean
  resourceId: string
  updateSectionTitle: ({ title }: { title: string }) => void
}) {
  const [editorState, setEditorState] = useState(pageContent)
  const handleEditorChange = ({ text }: { text: string }) => {
    setEditorState(text)
    // console.log('handleEditorChange', html, text)
  }

  useEffect(() => {
    MdEditor = dynamic(() => import('react-markdown-editor-lite'), {
      ssr: false,
    })
    setEditorState(pageContent || '')
  }, [pageContent])

  const isSaved = () => pageContent === editorState

  const handleWindowClose = (e: any) => {
    if (!isSaved()) {
      NProgress.done()
      e.preventDefault()
      // TODO: A default message is being shown instead of this, figure out why
      return (e.returnValue =
        'You have unsaved changes - are you sure you wish to close?')
    }
  }

  useEffect(() => {
    if (inEditMode) {
      window.addEventListener('beforeunload', handleWindowClose)
    }

    return () => {
      window.removeEventListener('beforeunload', handleWindowClose)
    }
  })

  usePreventRouteChangeIf({
    shouldPreventRouteChange: !isSaved(),
    onRouteChangePrevented: () =>
      message.error('You have some unsaved changes.', 1),
  })

  if (!process.browser) {
    return <Skeleton active={true} />
  }

  const mdParser = customMdParser()

  return (
    <>
      <div className={'clearfix'} />
      <Typography>
        <Typography.Title
          level={2}
          editable={
            inEditMode
              ? {
                  onChange: (value) => updateSectionTitle({ title: value }),
                }
              : false
          }
        >
          {title}
        </Typography.Title>
      </Typography>

      <CustomKeyboardEventHandler
        save={() => save({ editorState })}
        setEditorState={setEditorState}
      >
        {/*{inEditMode && (*/}
        {/*  <IdleTimer*/}
        {/*    element={document}*/}
        {/*    onIdle={() => save({ editorState })}*/}
        {/*    debounce={250}*/}
        {/*    timeout={1000}*/}
        {/*    startOnMount={false}*/}
        {/*    events={['keydown', 'mousedown']}*/}
        {/*  />*/}
        {/*)}*/}
        {inEditMode ? (
          <MdEditor
            value={editorState}
            style={{ minHeight: '75vh' }}
            renderHTML={(text: string) => mdParser.render(text)}
            onChange={handleEditorChange}
            placeholder={'Write something here...'}
          />
        ) : (
          <MdEditor
            readOnly={true}
            config={{
              view: {
                menu: true,
                html: true,
                md: false,
              },
            }}
            value={editorState}
            renderHTML={(text: string) => mdParser.render(text)}
            placeholder={'There is nothing here...'}
            plugins={['full-screen']}
          />
        )}
      </CustomKeyboardEventHandler>

      <BottomActionControls
        showPreviousSection={showPreviousSection}
        goToPreviousSection={goToPreviousSection}
        showNextSection={showNextSection}
        goToNextSection={goToNextSection}
        completeSection={completeSection}
        isSectionComplete={isSectionComplete}
        inEditMode={inEditMode}
        save={() => save({ editorState })}
        isCompleteDisabled={editorState === ''}
        hasEnrolled={hasEnrolled}
        resourceId={resourceId}
      />
    </>
  )
}
