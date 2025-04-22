import React, { useState } from 'react';
import Header from './components/Header';
import Intro from './components/Introduction';
import GraphArea from './components/GraphArea';

const App: React.FC = () => {
  const [selectedAlgType, setSelectedAlgType] = useState<string | null>(null);

  return (
    <div className="app-container">
      <Header />
      <div className="workspace-container">
        <Intro />
        <GraphArea selectedType={selectedAlgType} onSelectType={setSelectedAlgType} />
      </div>
    </div>
  );
};

export default App;
