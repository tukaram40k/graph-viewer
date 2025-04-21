import React from 'react';
import Card from './Card';

type Props = {
  onSelectType: (type: string) => void;
};

const AlgSelection: React.FC<Props> = ({ onSelectType }) => {
  const cards = [
    { title: 'Search Algorithm', type: 'search' },
    { title: 'Minimal Tree', type: 'tree' },
    { title: 'Shortest Path', type: 'shortest' },
  ];

  return (
    <div className="card-grid">
      {cards.map((card) => (
        <Card key={card.type} title={card.title} onClick={() => onSelectType(card.type)} />
      ))}
    </div>
  );
};

export default AlgSelection;
