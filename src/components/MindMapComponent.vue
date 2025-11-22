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
  header: '#FF6B6B',
  paragraph: '#74B9FF',
  list: '#A29BFE'
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
                 <div class="mindmap-node-type">${node.type.toUpperCase()}</div>
                 <div class="mindmap-node-text">${node.text}</div>
               </div>`,
        type: node.type
      },
      style: {
        background: NODE_COLORS[node.type] || '#95a5a6',
        border: '2px solid #2c3e50',
        borderRadius: '8px',
        padding: '10px',
        width: `${NODE_WIDTH}px`,
        fontSize: '12px',
        color: '#2c3e50'
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
        animated: false,
        style: { stroke: '#2c3e50', strokeWidth: 2 }
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
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.mindmap-toolbar {
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #f5f5f5;
  flex-shrink: 0;
}

.panel-title {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
  font-weight: 600;
}

:deep(.vue-flow) {
  flex: 1;
}

:deep(.mindmap-node) {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

:deep(.mindmap-node-type) {
  font-size: 9px;
  font-weight: bold;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

:deep(.mindmap-node-text) {
  font-size: 13px;
  font-weight: 500;
  line-height: 1.3;
  word-break: break-word;
}

:deep(.mindmap-node-header .mindmap-node-text) {
  font-weight: bold;
  font-size: 14px;
}
</style>
