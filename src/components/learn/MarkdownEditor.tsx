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
  return `<iframe width="700" height="393" src="https://www.youtube-nocookie.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
}

const mdParser: any = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: false,
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
      return params.trim().match(/^yt\s*\[(.*)]$/)
    },
    render: function (tokens: Token[], idx: number) {
      if (tokens[idx].type === 'container_youtube_open') {
        const matches = tokens[idx].info.trim().match(/^yt\s*\[(.*)]$/)
        if (matches && matches[1]) {
          return (
            '<div class="text-center video-container">' +
            getYoutubeIframeMarkup({ url: matches[1].trim() }) +
            '</div><div class="text-center font-weight-light text-capitalize">'
          )
        }
        return
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
          'ctrl+s',
          'ctrl+b',
          'ctrl+i',
          'ctrl+u',
          'ctrl+k',
          'shift+y',
          'alt+shift+1',
          'alt+shift+2',
          'alt+shift+3',
          'alt+shift+4',
          'alt+shift+5',
        ]}
        onKeyEvent={(key: string, e: KeyboardEvent) => {
          console.log({ e, key })
          if (key === 'meta+s' || key === 'ctrl+s') {
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
