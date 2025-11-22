import { $getRoot, $isElementNode, type LexicalNode } from 'lexical';
import { $isHeadingNode, type HeadingTagType } from '@lexical/rich-text';
import { $isListNode, $isListItemNode } from '@lexical/list';
import { $isParagraphNode } from 'lexical';
import type { MindMapNode, ParsedContent } from '../types';

const HEADING_LEVELS: Record<HeadingTagType, number> = {
  h1: 1,
  h2: 2,
  h3: 3,
  h4: 4,
  h5: 5,
  h6: 6,
};

let nodeIdCounter = 0;

export function parseEditorContent(): ParsedContent {
  nodeIdCounter = 0;
  const root = $getRoot();
  const allNodes: MindMapNode[] = [];
  const stack: MindMapNode[] = [];

  function getTextContent(node: LexicalNode): string {
    return node.getTextContent().trim();
  }

  function createNode(
    text: string,
    type: MindMapNode['type'],
    level: number
  ): MindMapNode {
    return {
      id: `node-${nodeIdCounter++}`,
      text,
      level,
      type,
      children: [],
    };
  }

  function addNodeToHierarchy(node: MindMapNode) {
    // Find the correct parent based on level
    while (stack.length > 0 && stack[stack.length - 1].level >= node.level) {
      stack.pop();
    }

    if (stack.length > 0) {
      const parent = stack[stack.length - 1];
      parent.children.push(node);
      node.parentId = parent.id;
    }

    stack.push(node);
    allNodes.push(node);
  }

  function processListItems(listNode: LexicalNode, baseLevel: number) {
    if (!$isElementNode(listNode)) return;

    const children = listNode.getChildren();

    children.forEach((child) => {
      if ($isListItemNode(child)) {
        const text = getTextContent(child);
        if (text) {
          const listItemNode = createNode(text, 'li', baseLevel);
          addNodeToHierarchy(listItemNode);
        }

        // Check for nested lists
        const listItemChildren = child.getChildren();
        listItemChildren.forEach((nestedChild) => {
          if ($isListNode(nestedChild)) {
            processListItems(nestedChild, baseLevel + 1);
          }
        });
      }
    });
  }

  const children = root.getChildren();

  children.forEach((child) => {
    if ($isHeadingNode(child)) {
      const tag = child.getTag();
      const level = HEADING_LEVELS[tag];
      const text = getTextContent(child);

      if (text) {
        const headingNode = createNode(text, tag, level);
        addNodeToHierarchy(headingNode);
      }
    } else if ($isParagraphNode(child)) {
      const text = getTextContent(child);

      if (text) {
        // Determine level based on current stack
        const level = stack.length > 0 ? stack[stack.length - 1].level + 1 : 7;
        const paragraphNode = createNode(text, 'p', level);
        addNodeToHierarchy(paragraphNode);
      }
    } else if ($isListNode(child)) {
      // Determine base level for list items
      const baseLevel = stack.length > 0 ? stack[stack.length - 1].level + 1 : 7;
      processListItems(child, baseLevel);
    }
  });

  // Get root nodes (nodes without parents)
  const rootNodes = allNodes.filter((node) => !node.parentId);

  return {
    nodes: allNodes,
    rootNodes,
  };
}
