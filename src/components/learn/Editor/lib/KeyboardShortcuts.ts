import React from 'react'

export const KeyboardShortcuts = {
  types: {
    TAB: {
      isTrue: (keyEvent: KeyboardEvent) => keyEvent.keyCode === 9,
      left: '\t',
      right: '',
    },
    BOLD: {
      isTrue: (keyEvent: KeyboardEvent) =>
        (keyEvent.code === 'KeyB' && keyEvent.metaKey) ||
        (keyEvent.code === 'KeyB' && keyEvent.ctrlKey),
      left: '**',
      right: '**',
    },
    ITALIC: {
      isTrue: (keyEvent: KeyboardEvent) =>
        (keyEvent.code === 'KeyI' && keyEvent.metaKey) ||
        (keyEvent.code === 'KeyI' && keyEvent.ctrlKey),
      left: '*',
      right: '*',
    },
    UNDERLINE: {
      isTrue: (keyEvent: KeyboardEvent) =>
        (keyEvent.code === 'KeyU' && keyEvent.metaKey) ||
        (keyEvent.code === 'KeyU' && keyEvent.ctrlKey),
      left: '++',
      right: '++',
    },
    HYPERLINK: {
      isTrue: (keyEvent: KeyboardEvent) =>
        (keyEvent.code === 'KeyK' && keyEvent.metaKey) ||
        (keyEvent.code === 'KeyK' && keyEvent.ctrlKey),
      left: '[',
      right: ']()',
    },
    H1: {
      isTrue: (keyEvent: KeyboardEvent) =>
        keyEvent.code === 'Digit1' && keyEvent.altKey && keyEvent.shiftKey,
      left: '\n# ',
      right: '\n',
    },
    H2: {
      isTrue: (keyEvent: KeyboardEvent) =>
        keyEvent.code === 'Digit2' && keyEvent.altKey && keyEvent.shiftKey,
      left: '\n## ',
      right: '\n',
    },
    H3: {
      isTrue: (keyEvent: KeyboardEvent) =>
        keyEvent.code === 'Digit3' && keyEvent.altKey && keyEvent.shiftKey,
      left: '\n### ',
      right: '\n',
    },
    H4: {
      isTrue: (keyEvent: KeyboardEvent) =>
        keyEvent.code === 'Digit4' && keyEvent.altKey && keyEvent.shiftKey,
      left: '\n#### ',
      right: '\n',
    },
    H5: {
      isTrue: (keyEvent: KeyboardEvent) =>
        keyEvent.code === 'Digit5' && keyEvent.altKey && keyEvent.shiftKey,
      left: '\n##### ',
      right: '\n',
    },
    YOUTUBE: {
      isTrue: (keyEvent: KeyboardEvent) =>
        keyEvent.code === 'KeyY' &&
        keyEvent.shiftKey &&
        (keyEvent.ctrlKey || keyEvent.metaKey),
      left: ':::yt [',
      right: ']\n:::',
    },
  },
  getType: function (keyEvent: KeyboardEvent) {
    const keyTypes = Object.keys(this.types)
    for (const currType of keyTypes) {
      if ((this.types as any)[currType].isTrue(keyEvent)) {
        return currType
      }
    }
    return ''
  },
  handle: function (
    textBox: HTMLTextAreaElement,
    keyEvent: KeyboardEvent,
    setEditorState: React.Dispatch<React.SetStateAction<string>>
  ) {
    // @ts-ignore
    const currentType = this.types[this.getType(keyEvent)]
    this.addTextAround(
      textBox,
      currentType.left,
      currentType.right,
      setEditorState,
      this.getType(keyEvent)
    )
    this.blockKeyEvent(keyEvent)
  },
  blockKeyEvent: function (keyEvent: KeyboardEvent) {
    if (keyEvent.preventDefault) {
      keyEvent.preventDefault()
    } else {
      keyEvent.returnValue = false
    }
  },
  addTextAround: function (
    textBox: HTMLTextAreaElement,
    left: string,
    right: string,
    setEditorState: React.Dispatch<React.SetStateAction<string>>,
    currentType?: string
  ) {
    const selectionStart = this.getStartCaretPosition(textBox)
    const selectionEnd = this.getEndCaretPosition(textBox)
    const preText = textBox.value.substring(0, selectionStart)
    const selectedText = textBox.value.substring(selectionStart, selectionEnd)
    const postText = textBox.value.substring(selectionEnd, textBox.value.length)
    textBox.value = preText + left + selectedText + right + postText
    setEditorState(textBox.value)

    this.setSelected(
      textBox,
      selectionStart + left.length,
      selectionEnd + left.length
    )
  },
  setSelected: function (
    item: HTMLTextAreaElement,
    start: number,
    end: number
  ) {
    if (item.setSelectionRange) {
      item.focus()
      item.setSelectionRange(start, end)
    }
  },
  getEndCaretPosition: function (item: HTMLTextAreaElement) {
    let caretPosition = 0

    // Firefox, Chrome, IE9~ Support
    if (item.selectionStart || item.selectionStart === 0) {
      caretPosition = item.selectionEnd
    }
    return caretPosition
  },
  getStartCaretPosition: function (item: HTMLTextAreaElement) {
    let caretPosition = 0

    // Firefox, Chrome, IE9~ Support
    if (item.selectionStart || item.selectionStart === 0) {
      caretPosition = item.selectionStart
    }

    // ~IE9 Support
    else {
      // @ts-ignore
      if (document.selection) {
        item.focus()
        // @ts-ignore
        const sel = document.selection.createRange()
        sel.moveStart('character', -item.value.length)
        caretPosition = sel.text.length
      }
    }

    return caretPosition
  },
}
