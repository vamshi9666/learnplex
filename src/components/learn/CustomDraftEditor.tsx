import React, { useEffect, useRef, useState } from 'react'
import {
  convertFromRaw,
  DraftBlockType,
  Editor,
  EditorState,
  getDefaultKeyBinding,
  KeyBindingUtil,
  RichUtils,
} from 'draft-js'
import { Button } from 'antd'
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons'

export default function CustomDraftEditor({
  pageContent,
  fork,
  save,
  inEditMode,
  editorKey,
  showPrevButton,
  showNextButton,
  goToPreviousSection,
  goToNextSection,
}: {
  pageContent: string
  fork: () => void
  save: ({ content }: { content: any }) => void
  inEditMode: boolean
  editorKey: string
  showPrevButton: boolean
  showNextButton: boolean
  goToPreviousSection: () => void
  goToNextSection: () => void
}) {
  const EMPTY_PAGE_CONTENT = JSON.stringify({
    entityMap: {},
    blocks: [
      {
        text: ' ',
        key: 'empty',
        type: 'unstyled',
        entityRanges: [],
      },
    ],
  })
  if (pageContent === undefined) {
    pageContent = EMPTY_PAGE_CONTENT
  }
  const [editorState, setEditorState] = useState(
    EditorState.createWithContent(convertFromRaw(JSON.parse(pageContent)))
  )

  editorState.getCurrentContent()
  const editor = useRef(null)

  const focus = () => (editor.current as any).focus()

  const onChange = (editorState: EditorState) => setEditorState(editorState)

  const handleKeyCommand = (command: string, editorState: EditorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command)
    if (command === SAVE_COMMAND) {
      save({ content: editorState.getCurrentContent() })
    }
    if (newState) {
      onChange(newState)
      return 'handled'
    }
    return 'not-handled'
  }

  useEffect(() => {
    if (pageContent) {
      setEditorState(
        EditorState.createWithContent(convertFromRaw(JSON.parse(pageContent)))
      )
    }
  }, [pageContent])

  const SAVE_COMMAND = 'my-editor-save'
  type SyntheticKeyboardEvent = React.KeyboardEvent<{}>
  const mapKeyToEditorCommand = (e: SyntheticKeyboardEvent) => {
    if (
      e.keyCode === 83 /* `S` key */ &&
      KeyBindingUtil.hasCommandModifier(e)
    ) {
      return SAVE_COMMAND
    }
    if (e.keyCode === 9 /* TAB */) {
      const newEditorState = RichUtils.onTab(e, editorState, 4 /* maxDepth */)
      if (newEditorState !== editorState) {
        onChange(newEditorState)
      }
      return null
    }
    return getDefaultKeyBinding(e)
  }

  const toggleBlockType = (blockType: DraftBlockType | string) => {
    onChange(RichUtils.toggleBlockType(editorState, blockType))
  }

  const toggleInlineStyle = (inlineStyle: string) => {
    onChange(RichUtils.toggleInlineStyle(editorState, inlineStyle))
  }

  let className = 'RichEditor-editor'
  let contentState = editorState.getCurrentContent()
  if (!contentState.hasText()) {
    if (contentState.getBlockMap().first().getType() !== 'unstyled') {
      className += ' RichEditor-hidePlaceholder'
    }
  }

  const StyleButton = ({ onToggle, style, active, label }: any) => {
    const customOnToggle = (e: any) => {
      e.preventDefault()
      onToggle(style)
    }
    let className = 'RichEditor-styleButton'
    if (active) {
      className += ' RichEditor-activeButton'
    }
    return (
      <span className={className} onMouseDown={customOnToggle}>
        {label}
      </span>
    )
  }

  const BLOCK_TYPES = [
    { label: 'H1', style: 'header-one' },
    { label: 'H2', style: 'header-two' },
    { label: 'H3', style: 'header-three' },
    { label: 'H4', style: 'header-four' },
    { label: 'H5', style: 'header-five' },
    { label: 'H6', style: 'header-six' },
    { label: 'Blockquote', style: 'blockquote' },
    { label: 'UL', style: 'unordered-list-item' },
    { label: 'OL', style: 'ordered-list-item' },
    { label: 'Code Block', style: 'code-block' },
  ]

  const BlockStyleControls = ({ editorState, onToggle }: any) => {
    const selection = editorState.getSelection()
    const blockType = editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .getType()

    return (
      <div className="RichEditor-controls">
        {BLOCK_TYPES.map((type) => (
          <StyleButton
            key={type.label}
            active={type.style === blockType}
            label={type.label}
            onToggle={onToggle}
            style={type.style}
          />
        ))}
      </div>
    )
  }

  const INLINE_STYLES = [
    { label: 'Bold', style: 'BOLD' },
    { label: 'Italic', style: 'ITALIC' },
    { label: 'Underline', style: 'UNDERLINE' },
    { label: 'Monospace', style: 'CODE' },
  ]

  const InlineStyleControls = ({ editorState, onToggle }: any) => {
    const currentStyle = editorState.getCurrentInlineStyle()

    return (
      <div className="RichEditor-controls">
        {INLINE_STYLES.map((type) => (
          <StyleButton
            key={type.label}
            active={currentStyle.has(type.style)}
            label={type.label}
            onToggle={onToggle}
            style={type.style}
          />
        ))}
      </div>
    )
  }

  const ActionControls = ({ editorState }: { editorState: EditorState }) => {
    return (
      <div
        className="RichEditor-controls"
        style={{ borderBottom: '1px solid #ddd' }}
      >
        {inEditMode ? (
          <Button
            className={'p-0'}
            type={'link'}
            onClick={async (e) =>
              await save({ content: editorState.getCurrentContent() })
            }
          >
            Save
          </Button>
        ) : (
          <Button className={'p-0'} type={'link'} onClick={() => fork()}>
            Edit
          </Button>
        )}
      </div>
    )
  }

  function getBlockStyle(block: any) {
    switch (block.getType()) {
      case 'blockquote':
        return 'RichEditor-blockquote'
      default:
        return ''
    }
  }

  const styleMap = {
    CODE: {
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
      fontSize: 16,
      padding: 2,
    },
  }

  return (
    <>
      <div className="RichEditor-root">
        <div className={'RichEditor-sticky-controls'}>
          <ActionControls editorState={editorState} />
          {inEditMode && (
            <>
              <BlockStyleControls
                editorState={editorState}
                onToggle={toggleBlockType}
              />
              <InlineStyleControls
                editorState={editorState}
                onToggle={toggleInlineStyle}
              />
            </>
          )}
        </div>
        <div className={className} onClick={focus}>
          <Editor
            readOnly={!inEditMode}
            editorKey={editorKey}
            editorState={editorState}
            onChange={onChange}
            blockStyleFn={getBlockStyle}
            customStyleMap={styleMap}
            handleKeyCommand={handleKeyCommand}
            keyBindingFn={mapKeyToEditorCommand}
            placeholder={'Tell a story...'}
            ref={editor}
            spellCheck={true}
          />
          <br />
          <div className={'text-center bottom-actions'}>
            {showPrevButton && (
              <Button
                className={'float-left'}
                onClick={() => goToPreviousSection()}
              >
                <ArrowLeftOutlined />
                Previous
              </Button>
            )}

            <Button type={'primary'}>Complete</Button>

            {showNextButton && (
              <Button
                className={'float-right'}
                onClick={() => goToNextSection()}
              >
                Next
                <ArrowRightOutlined />
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
