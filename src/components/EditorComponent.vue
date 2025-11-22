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
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  border: 1px solid var(--color-border);
  transition: all var(--transition-base);
}

.editor-container:hover {
  box-shadow: var(--shadow-2xl);
  border-color: var(--color-border-hover);
}

.editor-toolbar {
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background-mute);
  display: flex;
  align-items: center;
  justify-content: space-between;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.panel-title {
  margin: 0;
  font-size: 1.125rem;
  color: var(--color-text-primary);
  font-weight: 600;
  letter-spacing: -0.01em;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.panel-title::before {
  content: '✏️';
  font-size: 1.25rem;
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
  padding: var(--space-6);
  background: var(--color-surface);
}

/* Editor.js Custom Styling */
:deep(.ce-block__content) {
  max-width: 100%;
  padding: var(--space-2) 0;
}

:deep(.ce-toolbar__content) {
  max-width: 100%;
}

:deep(.codex-editor__redactor) {
  padding-bottom: var(--space-6) !important;
}

:deep(.ce-toolbar__plus),
:deep(.ce-toolbar__settings-btn) {
  color: var(--primary-600);
  transition: all var(--transition-fast);
}

:deep(.ce-toolbar__plus:hover),
:deep(.ce-toolbar__settings-btn:hover) {
  color: var(--primary-700);
  background: var(--primary-50);
}

:deep(.ce-inline-toolbar) {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
  border-radius: var(--radius-md);
}

:deep(.ce-conversion-toolbar) {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
  border-radius: var(--radius-md);
}

:deep(.ce-popover) {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
  border-radius: var(--radius-md);
}

:deep(.ce-header) {
  font-weight: 600;
  margin: 0.67em 0;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
  transition: color var(--transition-fast);
}

:deep(h1.ce-header) {
  font-size: 2.25em;
  font-weight: 700;
  color: var(--color-heading);
  background: linear-gradient(135deg, var(--primary-600), var(--secondary-600));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

:deep(h2.ce-header) {
  font-size: 1.875em;
  color: var(--gray-800);
}

:deep(h3.ce-header) {
  font-size: 1.5em;
  color: var(--gray-800);
}

:deep(h4.ce-header) {
  font-size: 1.25em;
  color: var(--gray-700);
}

:deep(h5.ce-header) {
  font-size: 1.125em;
  color: var(--gray-700);
}

:deep(h6.ce-header) {
  font-size: 1em;
  color: var(--gray-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

:deep(.ce-paragraph) {
  line-height: 1.7;
  color: var(--color-text);
  font-size: 1rem;
}

:deep(.cdx-list) {
  padding-left: 0;
}

:deep(.cdx-list__item) {
  padding: var(--space-1) 0;
  line-height: 1.7;
  color: var(--color-text);
  transition: all var(--transition-fast);
}

:deep(.cdx-list__item:hover) {
  color: var(--primary-600);
}

:deep(.cdx-list__item::before) {
  color: var(--primary-500);
}

:deep(.ce-block--focused) {
  background: var(--primary-50);
  border-radius: var(--radius-md);
}

/* Placeholder styling */
:deep(.ce-block:first-child .ce-paragraph[data-placeholder]:empty::before) {
  color: var(--color-text-tertiary);
  font-style: italic;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .editor-container {
    background: var(--color-surface);
    border-color: var(--color-border);
  }

  .editor-toolbar {
    background: var(--color-background-mute);
  }

  .editor-wrapper {
    background: var(--color-surface);
  }

  :deep(h1.ce-header) {
    background: linear-gradient(135deg, var(--primary-400), var(--secondary-400));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  :deep(h2.ce-header),
  :deep(h3.ce-header) {
    color: var(--gray-200);
  }

  :deep(h4.ce-header),
  :deep(h5.ce-header) {
    color: var(--gray-300);
  }

  :deep(h6.ce-header) {
    color: var(--gray-400);
  }

  :deep(.ce-block--focused) {
    background: rgba(59, 130, 246, 0.1);
  }

  :deep(.cdx-list__item:hover) {
    color: var(--primary-400);
  }
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
