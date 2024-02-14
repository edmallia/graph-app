import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import styled from 'styled-components';
import colors from './node-colors'

const Node = styled.div`
  padding: 10px 20px;
  border-radius: 5px;
  background: ${colors['MAIN'].color};
  color: ${(props) => props.theme.nodeColor};
  // border: 10px solid ${(props) => (props.selected ? props.theme.primary : props.theme.nodeBorder)};
  border: 5px double MintCream;

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
