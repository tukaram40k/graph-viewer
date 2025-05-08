import React, { useState } from 'react';
import Header from './components/animations/Header';
import GraphArea from './components/animations/GraphArea';
import BenchmarkSection from './components/charts/BenchmarkSection';

const App: React.FC = () => {
  const [selectedAlgType, setSelectedAlgType] = useState<string | null>(null);

  return (
    <div className="app-container">
      <Header />
      <div className="workspace-container">
        <GraphArea selectedType={selectedAlgType} onSelectType={setSelectedAlgType} />
        <BenchmarkSection/>
      </div>
      
    </div>
  );
};

export default App;
