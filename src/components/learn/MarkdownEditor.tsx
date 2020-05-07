import React from 'react'
import dynamic from 'next/dynamic'
import MarkdownIt from 'markdown-it'
import insert from 'markdown-it-ins'
import hljs from 'highlight.js'
import { Skeleton } from 'antd'

import { TabManager } from './lib/TabManager'

const MdEditor = dynamic(() => import('react-markdown-editor-lite'), {
  ssr: false,
})
let KeyboardEventHandler: any
if (process.browser) {
  KeyboardEventHandler = require('react-keyboard-event-handler')
}

export const mdParser: any = new MarkdownIt({
  html: true,
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
  editorState,
  setEditorState,
  save,
}: {
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
        handleKeys={['meta+s', 'tab']}
        onKeyEvent={(key: any, e: any) => {
          TabManager.enableTab(document.querySelector('textarea'), e)
          if (key === 'meta+s') {
            e.preventDefault()
            save()
          }
          console.log(`do something upon keydown event of ${key}`)
        }}
      >
        <MdEditor
          value={editorState}
          style={{ minHeight: '75vh' }}
          renderHTML={(text) => mdParser.render(text)}
          onChange={handleEditorChange}
          placeholder={'Write something here...'}
        />
      </KeyboardEventHandler>
    </>
  )
}
