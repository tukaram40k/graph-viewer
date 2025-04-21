import React, { useState } from 'react';
import Header from './components/Header';
import GraphArea from './components/GraphArea';

const App: React.FC = () => {
  const [selectedAlgType, setSelectedAlgType] = useState<string | null>(null);

  return (
    <div className="app-container">
      <Header />
      <GraphArea selectedType={selectedAlgType} onSelectType={setSelectedAlgType} />
    </div>
  );
};

export default App;
