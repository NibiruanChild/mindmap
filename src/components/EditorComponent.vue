<template>
  <div class="editor-container">
    <div class="editor-toolbar">
      <h2 class="panel-title">Editor</h2>
      <div class="toolbar-buttons">
        <button @click="addHeader(1)" class="toolbar-btn" title="Heading 1 (Ctrl+Shift+H)">
          <strong>H1</strong>
        </button>
        <button @click="addHeader(2)" class="toolbar-btn" title="Heading 2">
          <strong>H2</strong>
        </button>
        <button @click="addHeader(3)" class="toolbar-btn" title="Heading 3">
          <strong>H3</strong>
        </button>
        <div class="toolbar-separator"></div>
        <button @click="addParagraph" class="toolbar-btn" title="Paragraph">
          <span>¶</span>
        </button>
        <button @click="addList" class="toolbar-btn" title="List (Ctrl+Shift+L)">
          <span>☰</span>
        </button>
        <div class="toolbar-separator"></div>
        <button class="toolbar-btn info-btn" title="Markdown shortcuts: # for H1, ## for H2, ### for H3, - or * for lists">
          <span>ⓘ</span>
        </button>
      </div>
    </div>
    <div ref="editorRef" class="editor-wrapper"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import EditorJS from '@editorjs/editorjs'
import Header from '@editorjs/header'
import List from '@editorjs/list'
// @ts-ignore
import Marker from '@editorjs/marker'
// @ts-ignore
import InlineCode from '@editorjs/inline-code'
// @ts-ignore
import Underline from '@editorjs/underline'
import MarkdownParagraph from '../plugins/MarkdownParagraph'
import { parseEditorData } from '../utils/hierarchyParser'
import type { ParsedContent, EditorBlock } from '../types'

const emit = defineEmits<{
  change: [content: ParsedContent]
}>()

const editorRef = ref<HTMLElement | null>(null)
let editor: EditorJS | null = null

// Toolbar button handlers
const addHeader = async (level: number) => {
  if (!editor) return
  const currentBlock = await editor.blocks.getCurrentBlockIndex()
  editor.blocks.insert('header', { text: '', level }, {}, currentBlock + 1, true)
}

const addParagraph = async () => {
  if (!editor) return
  const currentBlock = await editor.blocks.getCurrentBlockIndex()
  editor.blocks.insert('paragraph', { text: '' }, {}, currentBlock + 1, true)
}

const addList = async () => {
  if (!editor) return
  const currentBlock = await editor.blocks.getCurrentBlockIndex()
  editor.blocks.insert('list', { style: 'unordered', items: [''] }, {}, currentBlock + 1, true)
}

onMounted(() => {
  if (!editorRef.value) return

  editor = new EditorJS({
    holder: editorRef.value,
    placeholder: 'Start typing... Use # for headings, * or - for lists. Try markdown shortcuts!',
    tools: {
      header: {
        class: Header as any,
        config: {
          levels: [1, 2, 3, 4, 5, 6],
          defaultLevel: 1,
          // Enable markdown shortcuts: # for H1, ## for H2, etc.
          placeholder: 'Enter a header',
          shortcut: 'CMD+SHIFT+H'
        },
        inlineToolbar: ['marker', 'underline', 'inlineCode'],
        shortcut: 'CMD+SHIFT+H'
      },
      list: {
        class: List as any,
        inlineToolbar: ['marker', 'underline', 'inlineCode'],
        config: {
          defaultStyle: 'unordered'
        },
        shortcut: 'CMD+SHIFT+L'
      },
      paragraph: {
        class: MarkdownParagraph as any,
        inlineToolbar: ['marker', 'underline', 'inlineCode'],
        config: {
          placeholder: 'Type text or use / for commands',
          preserveBlank: false
        }
      },
      // Inline formatting tools
      marker: {
        class: Marker as any,
        shortcut: 'CMD+SHIFT+M'
      },
      underline: {
        class: Underline as any,
        shortcut: 'CMD+U'
      },
      inlineCode: {
        class: InlineCode as any,
        shortcut: 'CMD+SHIFT+C'
      }
    },
    onChange: async () => {
      if (!editor) return

      try {
        const outputData = await editor.save()
        const parsedContent = parseEditorData(outputData.blocks as EditorBlock[])
        emit('change', parsedContent)
      } catch (error) {
        console.error('Failed to save editor data:', error)
      }
    },
    autofocus: true,
    // Enable drag-n-drop
    onReady: () => {
      console.log('Editor.js is ready!')
    }
  })
})

onBeforeUnmount(() => {
  if (editor) {
    editor.destroy()
    editor = null
  }
})
</script>

<style scoped>
.editor-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.editor-toolbar {
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  gap: 16px;
}

.panel-title {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
  font-weight: 600;
}

.toolbar-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.toolbar-btn {
  padding: 6px 12px;
  border: 1px solid #d0d0d0;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: #2c3e50;
  transition: all 0.2s;
  min-width: 36px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toolbar-btn:hover {
  background: #e8e8e8;
  border-color: #b0b0b0;
}

.toolbar-btn:active {
  background: #d8d8d8;
}

.toolbar-btn.info-btn {
  background: transparent;
  border: none;
  color: #666;
  font-size: 16px;
}

.toolbar-btn.info-btn:hover {
  background: transparent;
  color: #2c3e50;
}

.toolbar-separator {
  width: 1px;
  height: 24px;
  background: #d0d0d0;
  margin: 0 4px;
}

.editor-wrapper {
  flex: 1;
  overflow: auto;
  padding: 20px;
}

:deep(.ce-block__content) {
  max-width: 100%;
}

:deep(.ce-toolbar__content) {
  max-width: 100%;
}

:deep(.codex-editor__redactor) {
  padding-bottom: 20px !important;
}

:deep(.ce-header) {
  font-weight: bold;
  margin: 0.67em 0;
}

:deep(h1.ce-header) {
  font-size: 2em;
  color: #1a1a1a;
}

:deep(h2.ce-header) {
  font-size: 1.5em;
  color: #2a2a2a;
}

:deep(h3.ce-header) {
  font-size: 1.3em;
  color: #3a3a3a;
}

:deep(h4.ce-header) {
  font-size: 1.1em;
  color: #4a4a4a;
}

:deep(h5.ce-header) {
  font-size: 1em;
  color: #5a5a5a;
}

:deep(h6.ce-header) {
  font-size: 0.9em;
  color: #6a6a6a;
}

:deep(.ce-paragraph) {
  line-height: 1.6;
  color: #333;
}

:deep(.cdx-list) {
  padding-left: 0;
}

:deep(.cdx-list__item) {
  padding: 4px 0;
  line-height: 1.6;
}

/* Drag and Drop styles */
:deep(.ce-block) {
  position: relative;
}

:deep(.ce-toolbar__plus) {
  visibility: visible !important;
  opacity: 1 !important;
}

:deep(.ce-toolbar__settings-btn) {
  visibility: visible !important;
  opacity: 1 !important;
}

/* Make drag handle visible and functional */
:deep(.ce-toolbar__actions) {
  opacity: 0;
  transition: opacity 0.2s;
}

:deep(.ce-block:hover .ce-toolbar__actions) {
  opacity: 1;
}

:deep(.ce-toolbar__plus:hover),
:deep(.ce-toolbar__settings-btn:hover) {
  background-color: rgba(0, 0, 0, 0.1);
}

/* Dragging state */
:deep(.ce-block--drop-target) {
  background: rgba(34, 186, 255, 0.1);
  border-radius: 4px;
}

/* Ensure drag handle is clickable */
:deep(.ce-toolbar) {
  pointer-events: all !important;
}

:deep(.ce-toolbar__content) {
  pointer-events: all !important;
}
</style>
