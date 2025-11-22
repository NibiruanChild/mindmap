/**
 * Custom Paragraph plugin with markdown shortcuts support
 * Converts markdown syntax to corresponding block types:
 * # → H1, ## → H2, ### → H3, etc.
 * - or * → unordered list
 */

export default class MarkdownParagraph {
  private api: any
  private data: { text: string }
  private wrapper: HTMLElement | null = null
  private element: HTMLParagraphElement | null = null

  static get toolbox() {
    return {
      title: 'Paragraph',
      icon: '<svg width="17" height="15" viewBox="0 0 336 276"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-66 39v23c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"></path></svg>'
    }
  }

  constructor({ data, api }: { data: any; api: any }) {
    this.api = api
    this.data = {
      text: data.text || ''
    }
  }

  render() {
    this.wrapper = document.createElement('div')
    this.element = document.createElement('p')
    this.element.classList.add('ce-paragraph')
    this.element.contentEditable = 'true'
    this.element.innerHTML = this.data.text

    // Handle input to detect markdown shortcuts
    this.element.addEventListener('input', this.handleInput.bind(this))
    this.element.addEventListener('keydown', this.handleKeyDown.bind(this))

    this.wrapper.appendChild(this.element)
    return this.wrapper
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (event.key === ' ') {
      // Check for markdown shortcuts when space is pressed
      const text = this.element?.textContent || ''
      this.checkAndConvert(text)
    }
  }

  private handleInput() {
    // Additional handling if needed
  }

  private checkAndConvert(text: string) {
    if (!this.element) return

    // Check for header shortcuts (# ## ### etc)
    const headerMatch = text.match(/^(#{1,6})\s/)
    if (headerMatch && headerMatch[1]) {
      const level = headerMatch[1].length
      const content = text.slice(headerMatch[0].length)
      this.convertToHeader(level, content)
      return
    }

    // Check for list shortcuts (- or *)
    const listMatch = text.match(/^[-*]\s/)
    if (listMatch) {
      const content = text.slice(listMatch[0].length)
      this.convertToList(content)
      return
    }
  }

  private async convertToHeader(level: number, text: string) {
    const currentIndex = this.api.blocks.getCurrentBlockIndex()

    // Insert new header block
    this.api.blocks.insert('header', {
      text: text,
      level: level
    }, {}, currentIndex, true)

    // Delete current paragraph block
    this.api.blocks.delete(currentIndex + 1)
  }

  private async convertToList(text: string) {
    const currentIndex = this.api.blocks.getCurrentBlockIndex()

    // Insert new list block
    this.api.blocks.insert('list', {
      style: 'unordered',
      items: [text]
    }, {}, currentIndex, true)

    // Delete current paragraph block
    this.api.blocks.delete(currentIndex + 1)
  }

  save(blockContent: HTMLElement) {
    const p = blockContent.querySelector('p')
    return {
      text: p?.innerHTML || ''
    }
  }

  static get sanitize() {
    return {
      text: {
        b: true,
        i: true,
        u: true,
        s: true,
        a: {
          href: true
        },
        mark: true,
        code: true
      }
    }
  }

  static get pasteConfig() {
    return {
      tags: ['P']
    }
  }
}
