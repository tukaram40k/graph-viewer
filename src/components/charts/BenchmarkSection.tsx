import React, { useState } from 'react';
import { graphTypes } from './utils/graphTypes';
import GraphTab from './GraphTab';
import '../../styles/components/_benchmark-section.scss';

const BenchmarkSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState(graphTypes[0]);

  return (
    <div className="benchmark-section">
      <div className="tab-bar">
        {graphTypes.map((type) => (
          <button
            key={type}
            className={`tab-button ${type === activeTab ? 'active' : ''}`}
            onClick={() => setActiveTab(type)}
          >
            {type}
          </button>
        ))}
      </div>
      <div className="tab-content">
        <GraphTab graphType={activeTab} />
      </div>
    </div>
  );
};

export default BenchmarkSection;