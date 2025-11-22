<template>
  <div class="mindmap-container">
    <div class="mindmap-toolbar">
      <h2 class="panel-title">MindMap</h2>
    </div>
    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      :fit-view-on-init="true"
      :min-zoom="0.1"
      :max-zoom="2"
    >
      <Background pattern-color="#aaa" :gap="16" />
      <Controls />
      <MiniMap :node-color="getNodeColor" mask-color="rgba(0, 0, 0, 0.1)" />
    </VueFlow>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { VueFlow, Position } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import type { Node, Edge } from '@vue-flow/core'
import type { MindMapNode } from '../types'

const props = defineProps<{
  rootNodes: MindMapNode[]
}>()

const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])

const NODE_WIDTH = 180
const HORIZONTAL_SPACING = 250
const VERTICAL_SPACING = 100

const NODE_COLORS: Record<string, string> = {
  header: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
  paragraph: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  list: 'linear-gradient(135deg, #A855F7 0%, #9333EA 100%)'
}

const NODE_BORDER_COLORS: Record<string, string> = {
  header: '#2563EB',
  paragraph: '#059669',
  list: '#9333EA'
}

const NODE_TEXT_COLORS: Record<string, string> = {
  header: '#FFFFFF',
  paragraph: '#FFFFFF',
  list: '#FFFFFF'
}

function getNodeColor(node: Node): string {
  const type = node.data?.type as string
  return NODE_COLORS[type] || '#95a5a6'
}

function calculateNodePositions(
  mindMapNodes: MindMapNode[],
  startY = 0,
  depth = 0
): { nodes: Node[]; edges: Edge[]; height: number } {
  const flowNodes: Node[] = []
  const flowEdges: Edge[] = []
  let totalHeight = 0

  mindMapNodes.forEach((node) => {
    const x = depth * HORIZONTAL_SPACING

    // Recursively process children to get their height
    let childrenResult = null
    if (node.children.length > 0) {
      childrenResult = calculateNodePositions(node.children, 0, depth + 1)
    }

    // Calculate current node height including children
    const nodeHeight = childrenResult
      ? Math.max(VERTICAL_SPACING, childrenResult.height)
      : VERTICAL_SPACING

    // Position current node - centered relative to its children
    const y = startY + totalHeight + (nodeHeight - VERTICAL_SPACING) / 2

    const flowNode: Node = {
      id: node.id,
      type: 'default',
      position: { x, y },
      data: {
        label: `<div class="mindmap-node mindmap-node-${node.type}">
                 <div class="mindmap-node-badge">${node.type}</div>
                 <div class="mindmap-node-text">${node.text}</div>
               </div>`,
        type: node.type
      },
      style: {
        background: NODE_COLORS[node.type] || 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
        border: `2px solid ${NODE_BORDER_COLORS[node.type] || '#4B5563'}`,
        borderRadius: '12px',
        padding: '14px 16px',
        width: `${NODE_WIDTH}px`,
        fontSize: '13px',
        color: NODE_TEXT_COLORS[node.type] || '#FFFFFF',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left
    }

    flowNodes.push(flowNode)

    if (node.parentId) {
      flowEdges.push({
        id: `edge-${node.parentId}-${node.id}`,
        source: node.parentId,
        target: node.id,
        type: 'smoothstep',
        animated: true,
        style: {
          stroke: NODE_BORDER_COLORS[node.type] || '#6B7280',
          strokeWidth: 2.5,
          strokeDasharray: '0'
        },
        markerEnd: {
          type: 'arrowclosed',
          color: NODE_BORDER_COLORS[node.type] || '#6B7280',
          width: 20,
          height: 20
        }
      })
    }

    // Add children with correct positions
    if (childrenResult) {
      const childStartY = startY + totalHeight
      childrenResult.nodes.forEach((childNode) => {
        childNode.position.y += childStartY
      })

      flowNodes.push(...childrenResult.nodes)
      flowEdges.push(...childrenResult.edges)
    }

    totalHeight += nodeHeight
  })

  return { nodes: flowNodes, edges: flowEdges, height: totalHeight }
}

watch(
  () => props.rootNodes,
  (newRootNodes) => {
    if (newRootNodes.length === 0) {
      nodes.value = []
      edges.value = []
      return
    }

    const result = calculateNodePositions(newRootNodes)
    nodes.value = result.nodes
    edges.value = result.edges
  },
  { immediate: true, deep: true }
)
</script>

<style scoped>
.mindmap-container {
  width: 100%;
  height: 100%;
  background: var(--color-background-mute);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
  transition: all var(--transition-base);
}

.mindmap-container:hover {
  box-shadow: var(--shadow-2xl);
  border-color: var(--color-border-hover);
}

.mindmap-toolbar {
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background-mute);
  flex-shrink: 0;
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
  content: '🗺️';
  font-size: 1.25rem;
}

:deep(.vue-flow) {
  flex: 1;
  background: var(--color-surface);
}

:deep(.vue-flow__background) {
  opacity: 0.3;
}

:deep(.vue-flow__minimap) {
  background: var(--color-background-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

:deep(.vue-flow__controls) {
  background: var(--color-background-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

:deep(.vue-flow__controls-button) {
  background: var(--color-surface);
  border: none;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-primary);
  transition: all var(--transition-fast);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.vue-flow__controls-button:hover) {
  background: var(--primary-50);
  color: var(--primary-600);
}

:deep(.vue-flow__controls-button:last-child) {
  border-bottom: none;
}

:deep(.mindmap-node) {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: 100%;
}

:deep(.mindmap-node-badge) {
  display: inline-block;
  font-size: 0.625rem;
  font-weight: 700;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(255, 255, 255, 0.25);
  padding: 2px 8px;
  border-radius: 9999px;
  width: fit-content;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

:deep(.mindmap-node-text) {
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.4;
  word-break: break-word;
  color: inherit;
}

:deep(.mindmap-node-header .mindmap-node-text) {
  font-weight: 700;
  font-size: 0.9375rem;
}

/* Node hover effects */
:deep(.vue-flow__node) {
  cursor: pointer;
  transition: all var(--transition-base);
}

:deep(.vue-flow__node:hover) {
  transform: scale(1.05);
  z-index: 1000 !important;
}

:deep(.vue-flow__node.selected) {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.4);
}

/* Edge animations */
:deep(.vue-flow__edge-path) {
  transition: all var(--transition-base);
}

:deep(.vue-flow__edge:hover .vue-flow__edge-path) {
  stroke-width: 3 !important;
}

/* Animated gradient on edges */
:deep(.vue-flow__edge.animated path) {
  stroke-dasharray: 5;
  animation: dashdraw 0.5s linear infinite;
}

@keyframes dashdraw {
  to {
    stroke-dashoffset: -10;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .mindmap-container {
    background: var(--color-surface);
  }

  .mindmap-toolbar {
    background: var(--color-background-mute);
  }

  :deep(.vue-flow) {
    background: var(--color-surface);
  }

  :deep(.vue-flow__controls-button:hover) {
    background: rgba(59, 130, 246, 0.1);
    color: var(--primary-400);
  }
}
</style>
