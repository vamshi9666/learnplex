import React from 'react'

import { KeyboardShortcuts } from './lib/KeyboardShortcuts'

let KeyboardEventHandler: any
if (process.browser) {
  KeyboardEventHandler = require('react-keyboard-event-handler')
}

export default function CustomKeyboardEventHandler({
  save,
  children,
  setEditorState,
}: {
  save: () => void
  children: any
  setEditorState: React.Dispatch<React.SetStateAction<string>>
}) {
  return (
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
        'ctrl+shift+y',
        'meta+shift+y',
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
      {children}
    </KeyboardEventHandler>
  )
}
