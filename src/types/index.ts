export interface MindMapNode {
  id: string
  text: string
  level: number
  type: 'header' | 'paragraph' | 'list'
  parentId?: string
  children: MindMapNode[]
}

export interface ParsedContent {
  nodes: MindMapNode[]
  rootNodes: MindMapNode[]
}

export interface EditorBlock {
  type: string
  data: {
    text?: string
    items?: string[]
    level?: number
    style?: string
  }
}
