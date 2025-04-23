import React from 'react';
import Card from './Card';
import Intro from './Introduction';

type Props = {
  onSelectType: (type: string) => void;
};

const AlgSelection: React.FC<Props> = ({ onSelectType }) => {
  // card contents
  const cards = [
    {
      title: 'Tree Search',
      type: 'tree-search',
      desc: 'Breadth-first search, Depth-first search',
      imgSrc: 'src/assets/card-images/bfsdfs.png'
    },
    {
      title: 'Minimal Spanning Tree',
      type: 'minimal-tree',
      desc: 'Prim and Kruskal algorithms',
      imgSrc: 'src/assets/card-images/prim2.png'
    },
    {
      title: 'Shortest Path',
      type: 'shortest-path',
      desc: 'Dijkstra and Floyd-Warshall algorithms',
      imgSrc: 'src/assets/card-images/dijk.png'
    },
  ];

  return (
    <div className="ignore-me">
      <Intro/>
      <div className="card-grid">
        {cards.map((card) => (
          <Card
            key={card.type}
            title={card.title}
            desc={card.desc}
            img={card.imgSrc}
            onClick={() => onSelectType(card.type)}
          />
        ))}
      </div>
    </div>
    
  );
};

export default AlgSelection;
