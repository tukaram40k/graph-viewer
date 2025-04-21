import React from 'react';
import AlgSelection from './AlgSelection';
import AnimationUI from './AnimationUI';

type Props = {
  selectedType: string | null;
  onSelectType: (type: string | null) => void;
};

const GraphArea: React.FC<Props> = ({ selectedType, onSelectType }) => {
  return (
    <main className="graph-area">
      {!selectedType ? (
        <AlgSelection onSelectType={onSelectType} />
      ) : (
        <AnimationUI type={selectedType} onBack={() => onSelectType(null)} />
      )}
    </main>
  );
};

export default GraphArea;
