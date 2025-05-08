// components/GraphTab.tsx
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
    const expandedResults: any[] = [];

    console.log(results)

    results.forEach(entry => {
      const { nodes, algorithm, time } = entry;
      const algos = algorithm.split('+');
      const timePerAlgo = time / algos.length;
      algos.forEach(a => {
        expandedResults.push({ algorithm: a, nodes, time: timePerAlgo });
      });
    });

    setData(expandedResults);
  }, [graphType]);

  useEffect(() => {
    if (data.length === 0) return;

    d3.select('#chart').selectAll('*').remove();

    const groups = [
      { title: 'DFS + BFS', algorithms: ['DFS', 'BFS'] },
      { title: 'Prim + Kruskal', algorithms: ['Prim', 'Kruskal'] },
      { title: 'Dijkstra + FloydWarshall', algorithms: ['Dijkstra', 'Floyd-Warshall'] },
    ];

    const container = d3.select('#chart');
    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    groups.forEach((group, index) => {
      const chartId = `chart-${index}`;
      container.append('div').attr('id', chartId).style('margin-bottom', '2rem');

      const svg = d3.select(`#${chartId}`)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
      const chartWidth = width - margin.left - margin.right;
      const chartHeight = height - margin.top - margin.bottom;

      const groupData = data.filter(d => group.algorithms.includes(d.algorithm));
      const x = d3.scaleLinear().domain([0, d3.max(groupData, d => d.nodes)!]).range([0, chartWidth]);
      const y = d3.scaleLinear().domain([0, d3.max(groupData, d => d.time)!]).range([chartHeight, 0]);

      g.append('g').attr('transform', `translate(0,${chartHeight})`).call(d3.axisBottom(x));
      g.append('g').call(d3.axisLeft(y));

      const line = d3.line<any>()
        .x(d => x(d.nodes))
        .y(d => y(d.time));

      group.algorithms.forEach((algo) => {
        const algoData = groupData.filter(d => d.algorithm === algo);
        g.append('path')
          .datum(algoData)
          .attr('fill', 'none')
          .attr('stroke', color(algo))
          .attr('stroke-width', 2)
          .attr('d', line);

        g.selectAll(`.dot-${algo}`)
          .data(algoData)
          .enter()
          .append('circle')
          .attr('cx', d => x(d.nodes))
          .attr('cy', d => y(d.time))
          .attr('r', 3)
          .attr('fill', color(algo));
      });

      // Add legend
      const legend = svg.append('g')
        .attr('transform', `translate(${width - 100}, 20)`);

      group.algorithms.forEach((algo, i) => {
        const legendRow = legend.append('g').attr('transform', `translate(0, ${i * 20})`);
        legendRow.append('rect').attr('width', 10).attr('height', 10).attr('fill', color(algo));
        legendRow.append('text')
          .attr('x', 15)
          .attr('y', 10)
          .text(algo)
          .attr('font-size', '12px')
          .attr('fill', '#000');
      });

      // Add title
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', 16)
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .text(group.title);
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
