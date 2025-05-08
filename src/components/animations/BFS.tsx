// @ts-nocheck

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import '../../styles/animations/bfs.scss'
import '../../styles/animations/d3.css'

type Props = {
  onBack: () => void;
};

const BFS: React.FC<Props> = ({ onBack }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('Ready to start');
  const [running, setRunning] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const [nodeCount, setNodeCount] = useState(20);

  const title = "Breadth-First Search";

  // Store references to simulation and animation state
  const simulationRef = useRef(null);
  const animationTimeoutRef = useRef(null);
  const svgRef = useRef(null);
  const bfsStateRef = useRef({
    queue: [],
    visited: new Set(),
    current: null,
    source: null,
    levelMap: {}, // Maps nodes to their BFS level (distance from source)
    edges: [], // Edges in BFS tree
    finished: false
  });
  
  const nodesRef = useRef([]);
  const linksRef = useRef([]);
  const nodeElementsRef = useRef(null);
  const linkElementsRef = useRef(null);
  const textElementsRef = useRef(null);
  const levelTextsRef = useRef(null);

  // Constants
  const COLORS = {
    unvisitedNode: "#48A6A7",
    currentNode: "#313bc1",
    visitedNode: "#6972e9",
    queuedNode: "#6de5a1",
    bfsEdge: "#AE445A",
    edge: "#48A6A7",
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
    
    // Create links first (so they appear below nodes)
    const linkElements = svg.append("g")
      .selectAll("line")
      .data(linksRef.current)
      .enter().append("line")
      .attr("class", "link")
      .attr("stroke", d => d.color || COLORS.edge)
      .attr("stroke-width", 2);
    
    linkElementsRef.current = linkElements;
    
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
    
    // Create level display texts (will be updated during BFS)
    const levelTexts = svg.append("g")
      .selectAll("text.level-label")
      .data(nodesRef.current)
      .enter().append("text")
      .attr("class", "level-label")
      .attr("fill", "#2c3e50")
      .attr("font-size", "10px")
      .attr("text-anchor", "middle")
      .attr("dy", 25);
    
    levelTextsRef.current = levelTexts;
    
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
    
    // Update level text positions
    levelTextsRef.current
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
    
    // Create a connected graph (using a tree structure)
    for (let i = 1; i < nodeCount; i++) {
      const parent = Math.floor(Math.random() * i);
      
      linksRef.current.push({
        source: parent,
        target: i,
        color: COLORS.edge
      });
    }
    
    // Add more random edges for density
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        // Skip if already connected
        if (linksRef.current.some(e => (e.source === i && e.target === j) || (e.source === j && e.target === i))) {
          continue;
        }
        
        // Add with probability based on edge density
        if (Math.random() < edgeDensity) {
          linksRef.current.push({
            source: i,
            target: j,
            color: COLORS.edge
          });
        }
      }
    }
    
    // Initialize visualization with new data
    initVisualization();
    resetAlgorithm();
  };

  // Initialize BFS algorithm
  const initializeBFS = () => {
    const state = {
      queue: [],
      visited: new Set(),
      current: null,
      source: 0, // Start from node 0
      levelMap: {}, // Maps nodes to their BFS level
      edges: [],
      finished: false
    };
    
    // Reset all node colors
    nodesRef.current.forEach(node => {
      node.color = COLORS.unvisitedNode;
    });
    
    // Reset all link colors
    linksRef.current.forEach(link => {
      link.color = COLORS.edge;
    });
    
    // Reset level labels
    if (levelTextsRef.current) {
      levelTextsRef.current.text("");
    }
    
    bfsStateRef.current = state;
    
    // Update visualization
    updateVisualization();
    
    setStatus("Ready to start BFS");
  };

  // Reset the algorithm
  const resetAlgorithm = () => {
    if (running) {
      clearTimeout(animationTimeoutRef.current);
      setRunning(false);
    }
    initializeBFS();
  };

  // Update the visualization based on current state
  const updateVisualization = () => {
    // Update node colors
    nodeElementsRef.current.attr("fill", d => d.color);
    
    // Update link colors
    linkElementsRef.current.attr("stroke", d => d.color);
    
    // Highlight current node with a stroke
    nodeElementsRef.current.attr("stroke-width", d => d.id === bfsStateRef.current.current ? 3 : 1.5);
    
    // Update level labels
    levelTextsRef.current.text(d => {
      const level = bfsStateRef.current.levelMap[d.id];
      return level !== undefined ? `L${level}` : "";
    });
  };

  // Get neighbors of a node
  const getNeighbors = (nodeId) => {
    const neighbors = [];
    
    linksRef.current.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      
      if (sourceId === nodeId) {
        neighbors.push({ id: targetId, link });
      } else if (targetId === nodeId) {
        neighbors.push({ id: sourceId, link });
      }
    });
    
    return neighbors;
  };

  // Perform one step of BFS algorithm
  const bfsStep = () => {
    const state = bfsStateRef.current;
    
    if (state.finished) {
      setRunning(false);
      return;
    }
    
    // If this is the first step, add the source node to the queue
    if (state.queue.length === 0 && state.visited.size === 0) {
      state.queue.push(state.source);
      state.visited.add(state.source);
      state.levelMap[state.source] = 0;
      
      const sourceNode = nodesRef.current.find(n => n.id === state.source);
      sourceNode.color = COLORS.currentNode;
      state.current = state.source;
      
      setStatus(`Starting BFS from node ${state.source}`);
      updateVisualization();
      
      // Schedule the next step
      animationTimeoutRef.current = setTimeout(() => {
        sourceNode.color = COLORS.visitedNode;
        updateVisualization();
        
        // Schedule the next step
        animationTimeoutRef.current = setTimeout(bfsStep, animationSpeed / 2);
      }, animationSpeed / 2);
      
      return;
    }
    
    // If queue is empty, BFS is done
    if (state.queue.length === 0) {
      state.finished = true;
      setStatus("BFS traversal complete");
      setRunning(false);
      return;
    }
    
    // Dequeue the next node
    const current = state.queue.shift();
    state.current = current;
    
    const currentNode = nodesRef.current.find(n => n.id === current);
    currentNode.color = COLORS.currentNode;
    
    const currentLevel = state.levelMap[current];
    setStatus(`Processing node ${current} (Level ${currentLevel})`);
    
    // Get neighbors of the current node
    const neighbors = getNeighbors(current);
    
    // Process neighbors - add unvisited neighbors to queue
    const unvisitedNeighbors = neighbors.filter(n => !state.visited.has(n.id));
    
    updateVisualization();
    
    // Schedule the next step - process the neighbors
    animationTimeoutRef.current = setTimeout(() => {
      // For each unvisited neighbor
      unvisitedNeighbors.forEach(neighbor => {
        // Add to queue and mark as visited
        state.queue.push(neighbor.id);
        state.visited.add(neighbor.id);
        state.levelMap[neighbor.id] = currentLevel + 1;
        
        // Update neighbor node color to queued
        const neighborNode = nodesRef.current.find(n => n.id === neighbor.id);
        neighborNode.color = COLORS.queuedNode;
        
        // Add edge to BFS tree
        state.edges.push(neighbor.link);
        neighbor.link.color = COLORS.bfsEdge;
      });
      
      // Update current node color to visited
      currentNode.color = COLORS.visitedNode;
      
      updateVisualization();
      
      // Schedule the next step
      animationTimeoutRef.current = setTimeout(bfsStep, animationSpeed);
    }, animationSpeed);
  };

  // Toggle algorithm running
  const toggleAlgorithm = () => {
    if (running) {
      clearTimeout(animationTimeoutRef.current);
      setRunning(false);
    } else {
      if (bfsStateRef.current.finished) {
        resetAlgorithm();
      }
      setRunning(true);
      bfsStep();
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
    <div className="bfs-container">
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
              <div className="color-box queued"></div>
              <span>Queued Node</span>
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
              <div className="color-box bfs-edge"></div>
              <span>BFS Tree Edge</span>
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

export default BFS;