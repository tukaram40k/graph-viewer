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
      { title: 'DFS and BFS', algorithms: ['DFS', 'BFS'] },
      { title: 'Prim and Kruskal', algorithms: ['Prim', 'Kruskal'] },
      { title: 'Dijkstra and FloydWarshall', algorithms: ['Dijkstra', 'Floyd-Warshall'] },
    ];

    const container = d3.select('#chart');
    const width = 900;
    const height = 450;
    const margin = { top: 50, right: 50, bottom: 80, left: 80 }; // Increased bottom and left margins for larger labels

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    groups.forEach((group, index) => {
      const chartId = `chart-${index}`;
      container.append('div').attr('id', chartId).attr('class', 'svg-holder');

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

      // X-axis with larger label
      g.append('g')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .style('font-size', '14px') // Increased tick label size
        .append('text')
        .attr('x', chartWidth / 2)
        .attr('y', 45) // Increased from 35
        .attr('fill', '#000')
        .attr('text-anchor', 'middle')
        .style('font-size', '16px') // Increased axis label size
        .style('font-weight', 'bold')
        .text('Number of Nodes');

      // Y-axis with larger label
      g.append('g')
        .call(d3.axisLeft(y).tickSizeOuter(0))
        .style('font-size', '14px') // Increased tick label size
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -50) // Increased from -40
        .attr('x', -chartHeight / 2)
        .attr('fill', '#000')
        .attr('text-anchor', 'middle')
        .style('font-size', '16px') // Increased axis label size
        .style('font-weight', 'bold')
        .text('Time (ms)');

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
          .attr('r', 4.5)
          .attr('fill', color(algo));
      });

      // Add legend
      const legend = svg.append('g')
        .attr('transform', `translate(${width - 150}, 30)`);

      group.algorithms.forEach((algo, i) => {
        const legendRow = legend.append('g').attr('transform', `translate(0, ${i * 24})`);
        legendRow.append('rect').attr('width', 15).attr('height', 15).attr('fill', color(algo));
        legendRow.append('text')
          .attr('x', 20)
          .attr('y', 12)
          .text(algo)
          .attr('font-size', '14px')
          .attr('fill', '#000');
      });

      // Add title
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', 24)
        .attr('text-anchor', 'middle')
        .attr('font-size', '20px')
        .text(group.title);
    });
  }, [data]);

  return (
    <div>
      <h2>{graphType} Graph</h2>
      <div id="chart-wrapper">
        <div id="chart"></div>
      </div>
    </div>
  );
};

export default GraphTab;