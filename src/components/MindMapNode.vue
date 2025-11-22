<template>
  <div class="mindmap-node" :class="`mindmap-node-${data.type}`">
    <div class="mindmap-node-type">{{ data.type.toUpperCase() }}</div>
    <div class="mindmap-node-text">{{ data.text }}</div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

const props = defineProps<{
  data: {
    text: string
    type: string
  }
}>()
</script>

<style scoped>
.mindmap-node {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
  border-radius: 8px;
  min-width: 160px;
}

.mindmap-node-type {
  font-size: 9px;
  font-weight: bold;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mindmap-node-text {
  font-size: 13px;
  font-weight: 500;
  line-height: 1.3;
  word-break: break-word;
}

.mindmap-node-header .mindmap-node-text {
  font-weight: bold;
  font-size: 14px;
}
</style>
