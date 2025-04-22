import React from 'react';

type Props = {
  type: string;
  onBack: () => void;
};

const AnimationUI: React.FC<Props> = ({ type, onBack }) => (
  <div>
    <button className="back-button" onClick={onBack}>Back</button>
    <div className="animation-ui">
      <h2>{type} animation</h2>
      <p>gaph goes here</p>
    </div>
  </div>
);

export default AnimationUI;
