import React from 'react'
import dynamic from 'next/dynamic'
import MarkdownIt from 'markdown-it'
import insert from 'markdown-it-ins'
import hljs from 'highlight.js'
import { Skeleton } from 'antd'

import { KeyboardShortcuts } from './lib/KeyboardShortcuts'

const MdEditor = dynamic(() => import('react-markdown-editor-lite'), {
  ssr: false,
})
let KeyboardEventHandler: any
if (process.browser) {
  KeyboardEventHandler = require('react-keyboard-event-handler')
}

const mdParser: any = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value
      } catch (__) {}
    }

    return '' // use external default escaping
  },
}).use(insert)

export default function MarkdownEditor({
  inEditMode,
  editorState,
  setEditorState,
  save,
}: {
  inEditMode: boolean
  editorState: string
  setEditorState: React.Dispatch<React.SetStateAction<string>>
  save: () => void
}) {
  const handleEditorChange = ({ html, text }: any) => {
    setEditorState(text)
    console.log('handleEditorChange', html, text)
  }

  if (!process.browser) {
    return <Skeleton active={true} />
  }

  return (
    <>
      <KeyboardEventHandler
        handleKeys={[
          'tab',
          'meta+s',
          'meta+b',
          'meta+i',
          'meta+u',
          'meta+k',
          'alt+shift+1',
          'alt+shift+2',
          'alt+shift+3',
          'alt+shift+4',
          'alt+shift+5',
        ]}
        onKeyEvent={(key: string, e: KeyboardEvent) => {
          console.log({ e })
          if (key === 'meta+s') {
            e.preventDefault()
            save()
            return
          }
          KeyboardShortcuts.handle(
            document.querySelector('textarea')!,
            e,
            setEditorState
          )
        }}
      >
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
      </KeyboardEventHandler>
    </>
  )
}
