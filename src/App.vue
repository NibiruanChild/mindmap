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
  background: linear-gradient(
    135deg,
    var(--primary-500) 0%,
    var(--secondary-600) 50%,
    var(--secondary-700) 100%
  );
  background-size: 200% 200%;
  animation: gradientShift 15s ease infinite;
  overflow: hidden;
  position: relative;
}

/* Subtle animated gradient background */
@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Glass morphism effect overlay */
.app::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 100%
  );
  pointer-events: none;
  z-index: 0;
}

.app-header {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: var(--space-6) var(--space-8);
  text-align: center;
  box-shadow: var(--shadow-lg);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 10;
  transition: all var(--transition-base);
}

.app-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-600), var(--secondary-600));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.app-header p {
  margin: var(--space-2) 0 0 0;
  font-size: 0.9375rem;
  color: var(--gray-600);
  font-weight: 500;
  letter-spacing: -0.01em;
}

.app-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
  padding: var(--space-6);
  flex: 1;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.editor-panel,
.mindmap-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: fadeInUp var(--transition-slow) ease-out;
}

.editor-panel {
  animation-delay: 100ms;
}

.mindmap-panel {
  animation-delay: 200ms;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .app-content {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
    gap: var(--space-4);
    padding: var(--space-4);
  }

  .app-header {
    padding: var(--space-4) var(--space-5);
  }

  .app-header h1 {
    font-size: 1.5rem;
  }

  .app-header p {
    font-size: 0.875rem;
  }
}

@media (max-width: 640px) {
  .app-content {
    gap: var(--space-3);
    padding: var(--space-3);
  }

  .app-header {
    padding: var(--space-3) var(--space-4);
  }

  .app-header h1 {
    font-size: 1.25rem;
  }

  .app-header p {
    font-size: 0.8125rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .app-header {
    background: rgba(31, 41, 55, 0.95);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .app-header p {
    color: var(--gray-400);
  }
}
</style>
