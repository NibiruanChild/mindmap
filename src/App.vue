<template>
  <div class="app">
    <header class="app-header">
      <h1>Text to MindMap Generator</h1>
      <p>Create beautiful mindmaps from structured text using Editor.js</p>
    </header>
    <div class="app-content">
      <div class="editor-panel">
        <EditorComponent @change="handleEditorChange" />
      </div>
      <div class="mindmap-panel">
        <MindMapComponent :root-nodes="parsedContent.rootNodes" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import EditorComponent from './components/EditorComponent.vue'
import MindMapComponent from './components/MindMapComponent.vue'
import type { ParsedContent } from './types'

const parsedContent = ref<ParsedContent>({
  nodes: [],
  rootNodes: []
})

function handleEditorChange(content: ParsedContent) {
  parsedContent.value = content
}
</script>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  min-width: 320px;
  min-height: 100vh;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
    'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  width: 100%;
  height: 100vh;
}

.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

.app-header {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px 30px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  margin: 0;
  font-size: 28px;
  color: #2c3e50;
  font-weight: 700;
}

.app-header p {
  margin: 8px 0 0 0;
  font-size: 14px;
  color: #7f8c8d;
}

.app-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 20px;
  flex: 1;
  overflow: hidden;
}

.editor-panel,
.mindmap-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@media (max-width: 1024px) {
  .app-content {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
}
</style>
