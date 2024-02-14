import React, { useCallback } from 'react';
import ReactFlow, {
  addEdge,
  ConnectionLineType,
  Panel,
  useNodesState,
  useEdgesState,
  MiniMap
} from 'reactflow';
import dagre from 'dagre';

import styled, { ThemeProvider } from 'styled-components';
import MainNode from './nodes/MainNode';
import UserNode from './nodes/UserNode';
import RoleNode from './nodes/RoleNode';
import BucketNode from './nodes/BucketNode';
import PayloadNode from './nodes/PayloadNode';
import 'reactflow/dist/style.css';
const nodeTypes = {
    MAIN: MainNode,
    USER: UserNode,
    ROLE: RoleNode,
    BUCKET: BucketNode,
    PAYLOAD: PayloadNode
};
import Legend from './Legend';

const ReactFlowStyled = styled(ReactFlow)`
  background-color: ${(props) => props.theme.bg};
`;

//for calling the API
import axios from 'axios';


import { useLoaderData } from "react-router-dom";

//initialise DAGRE Graph
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const nodeWidth = 172;
const nodeHeight = 36;


//helper function to layout elements - see https://reactflow.dev/examples/layout/dagre
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? 'left' : 'top';
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

const GraphLayoutFlow = () => {
  const graph  = useLoaderData();
  const vertices = graph.vertices.map(v => {
        if (v.id === graph.assetName) {
            v.type = 'MAIN';
        } 
        return v;
    });
  
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    vertices,
    graph.edges
  );
  
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({ ...params, type: ConnectionLineType.SmoothStep, animated: true }, eds)
      ),
    []
  );
  const onLayout = useCallback(
    (direction) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        direction
      );

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    [nodes, edges]
  );

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
    <ReactFlowStyled
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      connectionLineType={ConnectionLineType.SmoothStep}
      fitView
    >
      <Panel position="top-left">
        <button onClick={() => onLayout('TB')}>vertical layout</button>
        <button onClick={() => onLayout('LR')}>horizontal layout</button>
        <Legend/>
      </Panel>
      <MiniMap pannable zoomable nodeStrokeColor="DarkSlateGrey" nodeColor="DarkSlateGrey"/>
      
    </ReactFlowStyled>
    </div>
  );
};

export default GraphLayoutFlow;

//load the graph formed data from the API
export async function loader({ params }) {  
  const result = await axios.get('/api/asset/' + params.assetName + '/graph');   
  return result.data;
}