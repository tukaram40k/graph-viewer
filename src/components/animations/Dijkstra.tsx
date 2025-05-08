// @ts-nocheck

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import '../../styles/animations/dijkstra.scss'
import '../../styles/animations/d3.css'

type Props = {
  onBack: () => void;
};

const Dijkstra: React.FC<Props> = ({ onBack }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('Ready to start');
  const [running, setRunning] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const [nodeCount, setNodeCount] = useState(20);

  const title = "Dijkstra's Algorithm";

  // Store references to simulation and animation state
  const simulationRef = useRef(null);
  const animationTimeoutRef = useRef(null);
  const svgRef = useRef(null);
  const dijkstraStateRef = useRef({
    distances: {},
    previous: {},
    visited: new Set(),
    unvisited: new Set(),
    current: null,
    source: null,
    target: null,
    finished: false,
    pathFound: false
  });
  
  const nodesRef = useRef([]);
  const linksRef = useRef([]);
  const nodeElementsRef = useRef(null);
  const linkElementsRef = useRef(null);
  const textElementsRef = useRef(null);
  const weightElementsRef = useRef(null);

  // Constants
  const COLORS = {
    unvisitedNode: "#48A6A7",
    currentNode: "#313bc1",
    visitedNode: "#6972e9",
    shortestPath: "#AE445A",
    edge: "#48A6A7",
    activeEdge: "#6972e9",
    text: "white"
  };

  useEffect(() => {
    if (containerRef.current) {
      createRandomGraph(nodeCount);
    }
    
    // Cleanup function
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // Initialize visualization
  const initVisualization = () => {
    if (!containerRef.current) return;
    
    const WIDTH = containerRef.current.clientWidth;
    const HEIGHT = 600;
    
    // Clear previous SVG if it exists
    d3.select(containerRef.current).select("svg").remove();
    
    // Create SVG
    const svg = d3.select(containerRef.current)
      .append("svg")
      .attr("width", WIDTH)
      .attr("height", HEIGHT);
    
    svgRef.current = svg;
    
    // Add arrow marker definition for directed edges
    svg.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#999");
    
    // Create links first (so they appear below nodes)
    const linkElements = svg.append("g")
      .selectAll("line")
      .data(linksRef.current)
      .enter().append("line")
      .attr("class", "link")
      .attr("stroke", d => d.color || COLORS.edge)
      .attr("stroke-width", 2);
    
    linkElementsRef.current = linkElements;
    
    // Create weight labels
    const weightElements = svg.append("g")
      .selectAll("text")
      .data(linksRef.current)
      .enter().append("text")
      .attr("class", "weight-label")
      .text(d => d.weight);
    
    weightElementsRef.current = weightElements;
    
    // Create nodes
    const nodeElements = svg.append("g")
      .selectAll("circle")
      .data(nodesRef.current)
      .enter().append("circle")
      .attr("class", "node")
      .attr("r", d => d.radius || 15)
      .attr("fill", d => d.color || COLORS.unvisitedNode)
      .attr("stroke", "#2c3e50")
      .attr("stroke-width", 1.5)
      .call(d3.drag()
        .on("start", dragStarted)
        .on("drag", dragging)
        .on("end", dragEnded));
    
    nodeElementsRef.current = nodeElements;
    
    // Create text labels for nodes
    const textElements = svg.append("g")
      .selectAll("text")
      .data(nodesRef.current)
      .enter().append("text")
      .attr("class", "node-label")
      .text(d => d.id)
      .attr("fill", COLORS.text)
      .attr("font-size", "12px")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central");
    
    textElementsRef.current = textElements;
    
    // Create force simulation
    const simulation = d3.forceSimulation(nodesRef.current)
      .force("link", d3.forceLink(linksRef.current).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(WIDTH / 2, HEIGHT / 2))
      .force("collision", d3.forceCollide().radius(d => d.radius * 1.5 || 25))
      .on("tick", ticked);
    
    simulationRef.current = simulation;
  };

  // Update positions on each tick of the simulation
  const ticked = () => {
    // Update link positions
    linkElementsRef.current
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);
    
    // Update weight label positions
    weightElementsRef.current
      .attr("x", d => (d.source.x + d.target.x) / 2)
      .attr("y", d => (d.source.y + d.target.y) / 2)
      .attr("dy", -5);
    
    // Keep nodes within bounds
    const WIDTH = containerRef.current.clientWidth;
    const HEIGHT = 600;
    
    nodeElementsRef.current
      .attr("cx", d => d.x = Math.max(20, Math.min(WIDTH - 20, d.x)))
      .attr("cy", d => d.y = Math.max(20, Math.min(HEIGHT - 20, d.y)));
    
    // Update text positions
    textElementsRef.current
      .attr("x", d => d.x)
      .attr("y", d => d.y);
  };

  // Drag event handlers
  const dragStarted = (event, d) => {
    if (!event.active) simulationRef.current.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  };
  
  const dragging = (event, d) => {
    d.fx = event.x;
    d.fy = event.y;
  };
  
  const dragEnded = (event, d) => {
    if (!event.active) simulationRef.current.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  };

  // Create a random graph
  const createRandomGraph = (nodeCount = 20, edgeDensity = 0.2) => {
    // Stop any running simulation
    if (simulationRef.current) simulationRef.current.stop();
    
    // Reset nodes and links
    nodesRef.current = [];
    linksRef.current = [];
    
    // Adjust node radius based on node count
    const nodeRadius = nodeCount <= 20 ? 15 : (nodeCount <= 30 ? 12 : 10);
    
    // Create nodes
    for (let i = 0; i < nodeCount; i++) {
      nodesRef.current.push({
        id: i,
        radius: nodeRadius,
        color: COLORS.unvisitedNode
      });
    }
    
    // Create a minimum spanning tree to ensure connectivity
    for (let i = 1; i < nodeCount; i++) {
      const parent = Math.floor(Math.random() * i);
      const weight = Math.floor(Math.random() * 9) + 1; // Random weight between 1-9
      
      linksRef.current.push({
        source: parent,
        target: i,
        weight: weight,
        color: COLORS.edge
      });
    }
    
    // Add more random edges for density
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        // Skip if already connected in the MST
        if (linksRef.current.some(e => (e.source === i && e.target === j) || (e.source === j && e.target === i))) {
          continue;
        }
        
        // Add with probability based on edge density
        if (Math.random() < edgeDensity) {
          const weight = Math.floor(Math.random() * 9) + 1; // Random weight between 1-9
          linksRef.current.push({
            source: i,
            target: j,
            weight: weight,
            color: COLORS.edge
          });
        }
      }
    }
    
    // Initialize visualization with new data
    initVisualization();
    resetAlgorithm();
  };

  // Initialize Dijkstra's algorithm
  const initializeDijkstra = () => {
    const state = {
      distances: {},
      previous: {},
      visited: new Set(),
      unvisited: new Set(),
      current: null,
      source: 0, // Start from node 0
      target: nodesRef.current.length - 1, // End at the last node
      finished: false,
      pathFound: false
    };
    
    // Initialize all nodes
    nodesRef.current.forEach(node => {
      state.distances[node.id] = Infinity;
      state.previous[node.id] = null;
      state.unvisited.add(node.id);
      node.color = COLORS.unvisitedNode;
    });
    
    // Set distance to source as 0
    state.distances[state.source] = 0;
    
    // Reset all link colors
    linksRef.current.forEach(link => {
      link.color = COLORS.edge;
    });
    
    dijkstraStateRef.current = state;
    
    // Update visualization
    updateVisualization();
    
    setStatus("Ready");
  };

  // Reset the algorithm
  const resetAlgorithm = () => {
    if (running) {
      clearTimeout(animationTimeoutRef.current);
      setRunning(false);
    }
    initializeDijkstra();
  };

  // Update the visualization based on current state
  const updateVisualization = () => {
    // Update node colors
    nodeElementsRef.current.attr("fill", d => d.color);
    
    // Update link colors
    linkElementsRef.current.attr("stroke", d => d.color);
    
    // Highlight current node with a stroke
    nodeElementsRef.current.attr("stroke-width", d => d.id === dijkstraStateRef.current.current ? 3 : 1.5);
  };

  // Get the next node with the minimum distance
  const getMinDistanceNode = () => {
    const state = dijkstraStateRef.current;
    let minDistance = Infinity;
    let minNode = null;
    
    state.unvisited.forEach(nodeId => {
      if (state.distances[nodeId] < minDistance) {
        minDistance = state.distances[nodeId];
        minNode = nodeId;
      }
    });
    
    return minNode;
  };

  // Get neighbors of a node
  const getNeighbors = (nodeId) => {
    return linksRef.current
      .filter(link => link.source.id === nodeId || (typeof link.source === 'object' && link.source.id === nodeId))
      .map(link => ({
        id: typeof link.target === 'object' ? link.target.id : link.target,
        weight: link.weight,
        link: link
      }));
  };

  // Reconstruct path from source to target
  const getPath = () => {
    const state = dijkstraStateRef.current;
    const path = [];
    let current = state.target;
    
    if (state.previous[current] === null && current !== state.source) {
      return null; // No path exists
    }
    
    while (current !== null) {
      path.unshift(current);
      current = state.previous[current];
    }
    
    return path;
  };

  // Highlight the shortest path
  const highlightPath = () => {
    const state = dijkstraStateRef.current;
    const path = getPath();
    
    if (!path) {
      setStatus("No path exists from source to target");
      return;
    }
    
    // Highlight nodes in the path
    nodesRef.current.forEach(node => {
      if (path.includes(node.id)) {
        node.color = COLORS.shortestPath;
      }
    });
    
    // Highlight links in the path
    for (let i = 0; i < path.length - 1; i++) {
      const currentId = path[i];
      const nextId = path[i + 1];
      
      linksRef.current.forEach(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        
        if ((sourceId === currentId && targetId === nextId) || 
          (sourceId === nextId && targetId === currentId)) {
          link.color = COLORS.shortestPath;
        }
      });
    }
    
    const distance = state.distances[state.target];
    setStatus(`Shortest path found. Distance: ${distance}`);
    
    updateVisualization();
  };

  // Perform one step of Dijkstra's algorithm
  const dijkstraStep = () => {
    const state = dijkstraStateRef.current;
    
    if (state.finished) {
      setRunning(false);
      return;
    }
    
    // Get the node with minimum distance
    const current = getMinDistanceNode();
    
    // If we can't find a node or the minimum distance is infinity, then we're done
    if (current === null || state.distances[current] === Infinity) {
      state.finished = true;
      state.pathFound = false;
      setStatus("No path exists to target");
      setRunning(false);
      return;
    }
    
    // Update current node
    state.current = current;
    const currentNode = nodesRef.current.find(n => n.id === current);
    currentNode.color = COLORS.currentNode;
    
    // Update status message
    setStatus(`Visiting node ${current}. Distance: ${state.distances[current]}`);
    
    // If we reached the target, we're done
    if (current === state.target) {
      state.finished = true;
      state.pathFound = true;
      highlightPath();
      setRunning(false);
      return;
    }
    
    // Remove from unvisited and add to visited
    state.unvisited.delete(current);
    state.visited.add(current);
    
    // Get all neighbors
    const neighbors = getNeighbors(current);
    
    // For each neighboring node, calculate tentative distance
    neighbors.forEach(neighbor => {
      if (state.visited.has(neighbor.id)) return;
      
      const tentativeDistance = state.distances[current] + neighbor.weight;
      
      // If the tentative distance is less than the current distance, update it
      if (tentativeDistance < state.distances[neighbor.id]) {
        state.distances[neighbor.id] = tentativeDistance;
        state.previous[neighbor.id] = current;
        
        // Highlight the edge being considered
        neighbor.link.color = COLORS.activeEdge;
      }
    });
    
    updateVisualization();
    
    // Schedule the next step
    animationTimeoutRef.current = setTimeout(() => {
      // Mark the current node as visited after delay
      currentNode.color = COLORS.visitedNode;
      updateVisualization();
      
      // Schedule the next step with a small delay to see the color change
      animationTimeoutRef.current = setTimeout(dijkstraStep, animationSpeed / 2);
    }, animationSpeed / 2);
  };

  // Toggle algorithm running
  const toggleAlgorithm = () => {
    if (running) {
      clearTimeout(animationTimeoutRef.current);
      setRunning(false);
    } else {
      if (dijkstraStateRef.current.finished) {
        resetAlgorithm();
      }
      setRunning(true);
      dijkstraStep();
    }
  };

  // Handle speed change
  const handleSpeedChange = (e) => {
    setAnimationSpeed(parseInt(e.target.value));
  };

  // Handle node count change
  const handleNodeCountChange = (e) => {
    const count = parseInt(e.target.value);
    setNodeCount(count);
    createRandomGraph(count);
  };

  return (
    <div className="dijkstra-container">
      <button className="back-button" onClick={onBack}>Back</button>
      <h2>{title} Animation</h2>
      <div className="animation-ui">
        <div className="graph-control-options">
          <div className="controls">
            <button onClick={toggleAlgorithm}>
              {running ? "Pause Algorithm" : "Start Algorithm"}
            </button>
            <button onClick={resetAlgorithm}>Reset</button>
            <button onClick={() => createRandomGraph(nodeCount)}>New Random Graph</button>
            
            <select value={animationSpeed} onChange={handleSpeedChange}>
              <option value="1000">Slow</option>
              <option value="500">Medium</option>
              <option value="200">Fast</option>
              <option value="50">Very Fast</option>
            </select>
            
            <select value={nodeCount} onChange={handleNodeCountChange}>
              <option value="20">20 Nodes</option>
              <option value="40">40 Nodes</option>
              <option value="60">60 Nodes</option>
              <option value="100">100 Nodes</option>
            </select>
          </div>
          
          <div className="legend">
            <div className="legend-item">
              <div className="color-box unvisited"></div>
              <span>Unvisited Node</span>
            </div>
            <div className="legend-item">
              <div className="color-box current"></div>
              <span>Current Node</span>
            </div>
            <div className="legend-item">
              <div className="color-box visited"></div>
              <span>Visited Node</span>
            </div>
            <div className="legend-item">
              <div className="color-box path"></div>
              <span>Shortest Path</span>
            </div>
          </div>
        </div>
        <div ref={containerRef} className="graph-container">
          <div className="status">{status}</div>
        </div>
      </div>
    </div>
  );
};

export default Dijkstra;