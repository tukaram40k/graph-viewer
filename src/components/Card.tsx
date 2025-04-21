import React from 'react';

type Props = {
  title: string;
  onClick: () => void;
};

const Card: React.FC<Props> = ({ title, onClick }) => (
  <div className="card" onClick={onClick}>
    <h2>{title}</h2>
  </div>
);

export default Card;
