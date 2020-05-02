import React, { useRef, useState } from 'react'
import {
  DraftBlockType,
  Editor,
  EditorState,
  getDefaultKeyBinding,
  RichUtils,
} from 'draft-js'

export default function CustomDraftEditorBackup() {
  const [editorState, setEditorState] = useState(EditorState.createEmpty())

  const editor = useRef(null)

  const focus = () => (editor.current as any).focus()

  const onChange = (editorState: EditorState) => setEditorState(editorState)

  const handleKeyCommand = (command: string, editorState: EditorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command)
    if (newState) {
      onChange(newState)
      return 'handled'
    }
    return 'not-handled'
  }

  type SyntheticKeyboardEvent = React.KeyboardEvent<{}>
  const mapKeyToEditorCommand = (e: SyntheticKeyboardEvent) => {
    if (e.keyCode === 9 /* TAB */) {
      const newEditorState = RichUtils.onTab(e, editorState, 4 /* maxDepth */)
      if (newEditorState !== editorState) {
        onChange(newEditorState)
      }
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
    <div className="RichEditor-root">
      <BlockStyleControls
        editorState={editorState}
        onToggle={toggleBlockType}
      />
      <InlineStyleControls
        editorState={editorState}
        onToggle={toggleInlineStyle}
      />
      <div className={className} onClick={focus}>
        <Editor
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
      </div>
    </div>
  )
}
