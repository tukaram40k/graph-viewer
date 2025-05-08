import React from 'react';
import BFS from './BFS';
import Prim from './Prim';
import Dijkstra from './Dijkstra';

type Props = {
  type: string;
  onBack: () => void;
};

const AnimationUI: React.FC<Props> = ({ type, onBack }) => {
  switch (type) {
    case 'tree-search': 
      return <BFS onBack={onBack}/>
    case 'minimal-tree': 
      return <Prim onBack={onBack}/>
    case 'shortest-path': 
      return <Dijkstra onBack={onBack}/>
    default:
      return <div>unknown algorithm type</div>
  };
};

export default AnimationUI;