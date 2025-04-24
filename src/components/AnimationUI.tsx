import React from 'react';
import Dijkstra from './Dijkstra';
import Prim from './Prim';

type Props = {
  type: string;
  onBack: () => void;
};

const AnimationUI: React.FC<Props> = ({ type, onBack }) => {
  switch (type) {
    case 'tree-search': 
      return <div>bfs</div>
    case 'minimal-tree': 
      return <Prim onBack={onBack}/>
    case 'shortest-path': 
      return <Dijkstra onBack={onBack}/>
    default:
      return <div>unknown algorithm type</div>
  };
};

export default AnimationUI;