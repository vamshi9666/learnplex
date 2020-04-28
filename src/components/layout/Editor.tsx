import { useEffect, useRef, useState } from 'react'
import {
  convertFromRaw,
  convertToRaw,
  Editor,
  EditorState,
  RichUtils,
  getDefaultKeyBinding,
  KeyBindingUtil,
} from 'draft-js'
import { Button, Divider } from 'antd'
import NProgress from 'nprogress'
import { useMutation } from 'urql'

export default function CustomEditor({
  pageContent,
  currentSectionId,
  username,
  resourceSlug,
  inEditMode = false,
}: {
  pageContent: string | undefined
  currentSectionId: string
  username: string
  resourceSlug: string
  inEditMode?: boolean
}) {
  const EMPTY_PAGE_CONTENT = JSON.stringify({
    entityMap: {},
    blocks: [
      {
        text: '',
        key: 'empty',
        type: 'unstyled',
        entityRanges: [],
      },
    ],
  })
  const SAVE_PAGE_MUTATION = `
    mutation($data: SavePageInput!) {
      savePage(data: $data) {
        id
        page {
          id
          content
        }
      }
    }
  `
  const FORK_RESOURCE_MUTATION = `
    mutation($data: ForkResourceInput!) {
      forkResource(data: $data) {
        id
      }
    }
  `
  const SAVE_COMMAND = 'my-editor-save'
  const DRAFT_HANDLED = 'handled'
  const DRAFT_NOT_HANDLED = 'not-handled'
  type SyntheticKeyboardEvent = React.KeyboardEvent<{}>

  if (pageContent === undefined) {
    pageContent = EMPTY_PAGE_CONTENT
  }

  const [editorState, setEditorState] = useState(
    EditorState.createWithContent(convertFromRaw(JSON.parse(pageContent)))
  )

  const editor = useRef(null)

  const focusEditor = () => (editor.current as any).focus()

  const onChange = (editorState: EditorState) => setEditorState(editorState)

  const myKeyBindingFn = (e: SyntheticKeyboardEvent) => {
    if (
      e.keyCode === 83 /* `S` key */ &&
      KeyBindingUtil.hasCommandModifier(e)
    ) {
      return SAVE_COMMAND
    }
    return getDefaultKeyBinding(e)
  }

  const handleKeyCommand = (command: any, editorState: EditorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command)
    if (command === SAVE_COMMAND) {
      save()
    }
    if (newState) {
      onChange(newState)
      return DRAFT_HANDLED
    }
    return DRAFT_NOT_HANDLED
  }

  const [, savePage] = useMutation(SAVE_PAGE_MUTATION)
  const [, forkResource] = useMutation(FORK_RESOURCE_MUTATION)

  useEffect(() => {
    if (pageContent) {
      setEditorState(
        EditorState.createWithContent(convertFromRaw(JSON.parse(pageContent)))
      )
    }
  }, [pageContent])

  const save = () => {
    const pageContentJson = convertToRaw(editorState.getCurrentContent())
    const pageContent = JSON.stringify(pageContentJson)
    NProgress.start()
    savePage({
      data: {
        pageContent,
        sectionId: currentSectionId,
      },
    }).then((result) => {
      if (result.error) {
        console.log({ savePageError: result.error })
      } else {
        console.log({ result })
      }
    })
    NProgress.done()
  }

  const fork = () => {
    NProgress.start()
    forkResource({
      data: {
        username,
        resourceSlug,
      },
    }).then((result) => {
      if (result.error) {
        console.log({ forkResourceError: result.error })
      } else {
        console.log({ result })
      }
    })
    NProgress.done()
  }
  return (
    <div className={'position-fixed overflow-scroll'}>
      <div onClick={focusEditor}>
        {inEditMode ? (
          <Button className={'float-right'} type={'primary'} onClick={save}>
            Save
          </Button>
        ) : (
          <Button className={'float-right'} type={'primary'} onClick={fork}>
            Fork
          </Button>
        )}
      </div>

      <Divider />

      <Editor
        readOnly={!inEditMode}
        editorKey={`editor-${currentSectionId}`}
        ref={editor}
        editorState={editorState}
        onChange={onChange}
        handleKeyCommand={handleKeyCommand}
        keyBindingFn={myKeyBindingFn}
      />
    </div>
  )
}
