import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import styled from 'styled-components';
import colors from './node-colors'

const Node = styled.div`
  padding: 10px 20px;
  border-radius: 5px;
  background: ${colors['USER'].color};
  color: ${(props) => props.theme.nodeColor};
  border: 1px solid ${(props) => (props.selected ? props.theme.primary : props.theme.nodeBorder)};

  .react-flow__handle {
    background: ${(props) => props.theme.primary};
    width: 8px;
    height: 10px;
    border-radius: 3px;
  }
`;

export default memo(({ data, selected, targetPosition, sourcePosition }) => {
  return (
    <Node selected={selected}>
      <Handle type="target" position={targetPosition} />
        <strong>{data.label}</strong>
      <Handle type="source" position={sourcePosition} />
    </Node>
  );
});
