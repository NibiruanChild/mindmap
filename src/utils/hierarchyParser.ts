import type { MindMapNode, ParsedContent, EditorBlock } from '../types'

let nodeIdCounter = 0

export function parseEditorData(blocks: EditorBlock[]): ParsedContent {
  nodeIdCounter = 0
  const allNodes: MindMapNode[] = []
  const stack: MindMapNode[] = []

  function createNode(text: string, type: MindMapNode['type'], level: number): MindMapNode {
    return {
      id: `node-${nodeIdCounter++}`,
      text,
      level,
      type,
      children: []
    }
  }

  function addNodeToHierarchy(node: MindMapNode) {
    // Find the correct parent based on level
    while (stack.length > 0 && stack[stack.length - 1]!.level >= node.level) {
      stack.pop()
    }

    if (stack.length > 0) {
      const parent = stack[stack.length - 1]!
      parent.children.push(node)
      node.parentId = parent.id
    }

    stack.push(node)
    allNodes.push(node)
  }

  blocks.forEach((block) => {
    if (block.type === 'header') {
      const level = block.data.level || 1
      const text = block.data.text || ''

      if (text.trim()) {
        const headingNode = createNode(text.replace(/<[^>]*>/g, ''), 'header', level)
        addNodeToHierarchy(headingNode)
      }
    } else if (block.type === 'paragraph') {
      const text = block.data.text || ''

      if (text.trim()) {
        const level = stack.length > 0 ? stack[stack.length - 1]!.level + 1 : 7
        const paragraphNode = createNode(text.replace(/<[^>]*>/g, ''), 'paragraph', level)
        addNodeToHierarchy(paragraphNode)
      }
    } else if (block.type === 'list') {
      const items = block.data.items || []
      const baseLevel = stack.length > 0 ? stack[stack.length - 1]!.level + 1 : 7

      items.forEach((item) => {
        if (item.trim()) {
          const listItemNode = createNode(item.replace(/<[^>]*>/g, ''), 'list', baseLevel)
          addNodeToHierarchy(listItemNode)
        }
      })
    }
  })

  // Get root nodes (nodes without parents)
  const rootNodes = allNodes.filter((node) => !node.parentId)

  return {
    nodes: allNodes,
    rootNodes
  }
}
