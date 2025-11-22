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
</style>
