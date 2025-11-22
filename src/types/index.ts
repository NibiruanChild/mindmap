export interface MindMapNode {
  id: string;
  text: string;
  level: number;
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'li';
  parentId?: string;
  children: MindMapNode[];
}

export interface ParsedContent {
  nodes: MindMapNode[];
  rootNodes: MindMapNode[];
}
