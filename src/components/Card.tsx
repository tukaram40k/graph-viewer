import React from 'react';

type Props = {
  title: string;
  desc: string;
  img: string;
  onClick: () => void;
};

const Card: React.FC<Props> = ({ title, desc, img, onClick }) => (
  <div className="card" onClick={onClick}>
    <h2>{title}</h2>
    <p className="card-desc">{desc}</p>
    <img src={img} alt={title} className="card-image" />
  </div>
);

export default Card;
