import { useCallback, useEffect } from 'react';
import ReactFlow, {
  type Node,
  type Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { MindMapNode } from '../types';
import './MindMap.css';

interface MindMapProps {
  rootNodes: MindMapNode[];
}

const NODE_WIDTH = 180;
const HORIZONTAL_SPACING = 250;
const VERTICAL_SPACING = 100;

// Color scheme for different node types
const NODE_COLORS: Record<string, string> = {
  h1: '#FF6B6B',
  h2: '#4ECDC4',
  h3: '#45B7D1',
  h4: '#96CEB4',
  h5: '#FFEAA7',
  h6: '#DFE6E9',
  p: '#74B9FF',
  li: '#A29BFE',
};

export default function MindMap({ rootNodes }: MindMapProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const calculateNodePositions = useCallback(
    (
      nodes: MindMapNode[],
      startY = 0,
      depth = 0
    ): { nodes: Node[]; edges: Edge[]; height: number } => {
      const flowNodes: Node[] = [];
      const flowEdges: Edge[] = [];
      let totalHeight = 0;

      nodes.forEach((node) => {
        const x = depth * HORIZONTAL_SPACING;

        // Рекурсивно обрабатываем детей чтобы узнать их высоту
        let childrenResult = null;
        if (node.children.length > 0) {
          childrenResult = calculateNodePositions(
            node.children,
            0, // временное значение, обновим позже
            depth + 1
          );
        }

        // Рассчитываем высоту текущего узла с учетом детей
        const nodeHeight = childrenResult
          ? Math.max(VERTICAL_SPACING, childrenResult.height)
          : VERTICAL_SPACING;

        // Позиция текущего узла - в центре его детей или просто по порядку
        const y = startY + totalHeight + (nodeHeight - VERTICAL_SPACING) / 2;

        const flowNode: Node = {
          id: node.id,
          type: 'default',
          position: { x, y },
          data: {
            label: (
              <div className={`mindmap-node mindmap-node-${node.type}`}>
                <div className="mindmap-node-type">{node.type.toUpperCase()}</div>
                <div className="mindmap-node-text">{node.text}</div>
              </div>
            ),
          },
          style: {
            background: NODE_COLORS[node.type] || '#95a5a6',
            border: '2px solid #2c3e50',
            borderRadius: '8px',
            padding: '10px',
            width: NODE_WIDTH,
            fontSize: '12px',
            color: '#2c3e50',
          },
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        };

        flowNodes.push(flowNode);

        if (node.parentId) {
          flowEdges.push({
            id: `edge-${node.parentId}-${node.id}`,
            source: node.parentId,
            target: node.id,
            type: 'smoothstep',
            animated: false,
            style: { stroke: '#2c3e50', strokeWidth: 2 },
          });
        }

        // Добавляем детей с правильными позициями
        if (childrenResult) {
          // Обновляем Y позиции детей
          const childStartY = startY + totalHeight;
          childrenResult.nodes.forEach((childNode) => {
            childNode.position.y += childStartY;
          });

          flowNodes.push(...childrenResult.nodes);
          flowEdges.push(...childrenResult.edges);
        }

        totalHeight += nodeHeight;
      });

      return { nodes: flowNodes, edges: flowEdges, height: totalHeight };
    },
    []
  );

  useEffect(() => {
    if (rootNodes.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const result = calculateNodePositions(rootNodes);
    setNodes(result.nodes);
    setEdges(result.edges);
  }, [rootNodes, calculateNodePositions, setNodes, setEdges]);

  return (
    <div className="mindmap-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-left"
        minZoom={0.1}
        maxZoom={2}
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const type = node.data.label?.props?.className?.split(' ')[1]?.split('-').pop();
            return NODE_COLORS[type] || '#95a5a6';
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  );
}
