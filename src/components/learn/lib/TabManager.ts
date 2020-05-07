export const TabManager = {
  tabKey: 9, // This number means tab key ascii input.
  enableTab: function (textBox: any, keyEvent: any) {
    if (this.isTabKeyInput(keyEvent)) {
      // Put tab key into the current cursor(caret) position.
      this.insertTab(textBox)

      // Block(invalidate) actual tab key input by returning key event handler to false.
      this.blockKeyEvent(keyEvent)
    }
  },
  blockKeyEvent: function (keyEvent: any) {
    if (keyEvent.preventDefault) {
      keyEvent.preventDefault()
    } else {
      keyEvent.returnValue = false
    }
  },
  isTabKeyInput: function (keyEvent: any) {
    return keyEvent.keyCode === this.tabKey
  },
  insertTab: function (textBox: any) {
    const pos = this.getCaretPosition(textBox)
    const preText = textBox.value.substring(0, pos)
    const postText = textBox.value.substring(pos, textBox.value.length)

    textBox.value = preText + '\t' + postText // input tab key

    this.setCaretPosition(textBox, pos + 1)
  },
  setCaretPosition: function (item: any, pos: any) {
    // Firefox, Chrome, IE9~ Support
    if (item.setSelectionRange) {
      item.focus()
      item.setSelectionRange(pos, pos)
    }
    // ~IE9 Support
    else if (item.createTextRange) {
      const range = item.createTextRange()
      range.collapse(true)
      range.moveEnd('character', pos)
      range.moveStart('character', pos)
      range.select()
    }
  },
  getCaretPosition: function (item: any) {
    let caretPosition = 0

    // Firefox, Chrome, IE9~ Support
    if (item.selectionStart || item.selectionStart === '0') {
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
