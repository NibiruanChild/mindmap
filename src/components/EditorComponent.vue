<template>
  <div class="editor-container">
    <div class="editor-toolbar">
      <h2 class="panel-title">Editor</h2>
    </div>
    <div ref="editorRef" class="editor-wrapper"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import EditorJS from '@editorjs/editorjs'
import Header from '@editorjs/header'
import List from '@editorjs/list'
import Paragraph from '@editorjs/paragraph'
import { parseEditorData } from '../utils/hierarchyParser'
import type { ParsedContent, EditorBlock } from '../types'

const emit = defineEmits<{
  change: [content: ParsedContent]
}>()

const editorRef = ref<HTMLElement | null>(null)
let editor: EditorJS | null = null

onMounted(() => {
  if (!editorRef.value) return

  editor = new EditorJS({
    holder: editorRef.value,
    placeholder: 'Start typing... Use headings (H1-H6), paragraphs, and lists to create your mindmap.',
    tools: {
      header: {
        class: Header as any,
        config: {
          levels: [1, 2, 3, 4, 5, 6],
          defaultLevel: 1
        },
        inlineToolbar: true
      },
      list: {
        class: List as any,
        inlineToolbar: true,
        config: {
          defaultStyle: 'unordered'
        }
      },
      paragraph: {
        class: Paragraph as any,
        inlineToolbar: true
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
    autofocus: true
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
}

.panel-title {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
  font-weight: 600;
}

.editor-wrapper {
  flex: 1;
  overflow: auto;
  padding: 20px;
  padding-left: 60px;
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
</style>
