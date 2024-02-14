import colors from './nodes/node-colors'
import styled from 'styled-components';

const LegendItem = styled.span.attrs((props) => props)`
  padding: 10px 20px;
  border-radius: 5px;
  background: ${(props) => props.bgcolor};
  color:${(props) => props.theme.nodeColor};
  border: 1px solid;
`;

export  default function Legend() {
  return (
    <span >
        <span><strong>Legend: </strong></span>
        {Object.entries(colors).map(([key, value]) => (
          <LegendItem key={value.label} bgcolor={value.color}>{value.label}</LegendItem>
        ))}
    </span>
  )
  ;
}
