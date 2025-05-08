import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { runAlgorithmsOnGraph } from './utils/benchmarkUtils';

interface GraphTabProps {
  graphType: string;
}

const GraphTab: React.FC<GraphTabProps> = ({ graphType }) => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const results = runAlgorithmsOnGraph(graphType);
    setData(results);
  }, [graphType]);

  useEffect(() => {
    if (data.length === 0) return;

    d3.select('#chart').selectAll('*').remove();
    const svg = d3.select('#chart')
      .append('svg')
      .attr('width', 600)
      .attr('height', 400);

    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = +svg.attr('width') - margin.left - margin.right;
    const height = +svg.attr('height') - margin.top - margin.bottom;
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([0, d3.max(data, d => d.nodes)]).range([0, width]);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.time)]).range([height, 0]);

    g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x));
    g.append('g').call(d3.axisLeft(y));

    const line = d3.line<any>()
      .x(d => x(d.nodes))
      .y(d => y(d.time));

    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const algorithms = [...new Set(data.map(d => d.algorithm))];

    algorithms.forEach((algo, i) => {
      const algoData = data.filter(d => d.algorithm === algo);
      g.append('path')
        .datum(algoData)
        .attr('fill', 'none')
        .attr('stroke', color(`${i}`))
        .attr('stroke-width', 2)
        .attr('d', line);
    });
  }, [data]);

  return (
    <div>
      <h2>{graphType} Graph</h2>
      <div id="chart"></div>
    </div>
  );
};

export default GraphTab;