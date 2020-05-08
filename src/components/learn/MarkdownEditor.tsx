import React from 'react'
import dynamic from 'next/dynamic'
import MarkdownIt from 'markdown-it'
import insert from 'markdown-it-ins'
import markdownItContainer from 'markdown-it-container'
import hljs from 'highlight.js'
import { Skeleton } from 'antd'
import Token from 'markdown-it/lib/token'

import { KeyboardShortcuts } from './lib/KeyboardShortcuts'

const MdEditor = dynamic(() => import('react-markdown-editor-lite'), {
  ssr: false,
})
let KeyboardEventHandler: any
if (process.browser) {
  KeyboardEventHandler = require('react-keyboard-event-handler')
}

function getYoutubeVideoId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)

  return match && match[2].length === 11 ? match[2] : null
}

const getYoutubeIframeMarkup = ({ url }: { url: string }) => {
  console.log({ url })
  const videoId = getYoutubeVideoId(url)
  if (!videoId) {
    return ''
  }
  return `<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
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
})
  .use(insert)
  .use(markdownItContainer, 'youtube', {
    validate: function (params: string) {
      return params.trim().match(/^youtube$/)
    },
    render: function (tokens: Token[], idx: number) {
      if (tokens[idx].type === 'container_youtube_open') {
        let urlsIndex
        if (tokens[idx + 1].type === 'code_block') {
          urlsIndex = idx + 1
        } else {
          urlsIndex = idx + 2
        }
        const urls = tokens[urlsIndex].content
          .split('\n')
          .map((url) => url.trim())
        let markup = '<div>'
        for (const url of urls) {
          markup += getYoutubeIframeMarkup({ url })
        }
        return markup
      } else if (tokens[idx].type === 'container_youtube_close') {
        return '</div>'
      }
    },
  })

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
    // console.log('handleEditorChange', html, text)
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
