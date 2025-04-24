// @ts-nocheck

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import '../styles/animations/prim.scss'
import '../styles/animations/prim.css'

type Props = {
  onBack: () => void;
};

const Prim: React.FC<Props> = ({ onBack }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('Ready to start');
  const [running, setRunning] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const [nodeCount, setNodeCount] = useState(20);

  const title = "Prim's Algorithm";

  // Store references to simulation and animation state
  const simulationRef = useRef(null);
  const animationTimeoutRef = useRef(null);
  const svgRef = useRef(null);
  const primStateRef = useRef({
    mst: [], // Edges in the MST
    inTree: new Set(), // Nodes already in the MST
    notInTree: new Set(), // Nodes not yet in the MST
    current: null, // Current node being processed
    source: null, // Starting node
    finished: false,
    totalWeight: 0 // Total weight of the MST
  });
  
  const nodesRef = useRef([]);
  const linksRef = useRef([]);
  const nodeElementsRef = useRef(null);
  const linkElementsRef = useRef(null);
  const textElementsRef = useRef(null);
  const weightElementsRef = useRef(null);

  // Constants
  const COLORS = {
    notInTreeNode: "#48A6A7",
    currentNode: "#313bc1",
    inTreeNode: "#6972e9",
    mstEdge: "#AE445A",
    edge: "#48A6A7",
    candidateEdge: "#6972e9",
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
      .attr("fill", d => d.color || COLORS.notInTreeNode)
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
        color: COLORS.notInTreeNode
      });
    }
    
    // Create edges ensuring the graph is connected
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
        // Skip if already connected
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

  // Initialize Prim's algorithm
  const initializePrim = () => {
    const state = {
      mst: [],
      inTree: new Set(),
      notInTree: new Set(),
      current: null,
      source: 0, // Start from node 0
      finished: false,
      totalWeight: 0
    };
    
    // Initialize all nodes as not in tree
    nodesRef.current.forEach(node => {
      state.notInTree.add(node.id);
      node.color = COLORS.notInTreeNode;
    });
    
    // Reset all link colors
    linksRef.current.forEach(link => {
      link.color = COLORS.edge;
    });
    
    primStateRef.current = state;
    
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
    initializePrim();
  };

  // Update the visualization based on current state
  const updateVisualization = () => {
    // Update node colors
    nodeElementsRef.current.attr("fill", d => d.color);
    
    // Update link colors
    linkElementsRef.current.attr("stroke", d => d.color);
    
    // Highlight current node with a stroke
    nodeElementsRef.current.attr("stroke-width", d => d.id === primStateRef.current.current ? 3 : 1.5);
  };

  // Get all edges connecting nodes in the tree to nodes not in the tree
  const getCandidateEdges = () => {
    const state = primStateRef.current;
    const candidateEdges = [];
    
    // Look through all edges
    linksRef.current.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      
      // If one node is in the tree and the other is not, this is a candidate edge
      if ((state.inTree.has(sourceId) && state.notInTree.has(targetId)) || 
          (state.inTree.has(targetId) && state.notInTree.has(sourceId))) {
        candidateEdges.push({
          link,
          weight: link.weight,
          inTreeNode: state.inTree.has(sourceId) ? sourceId : targetId,
          notInTreeNode: state.notInTree.has(sourceId) ? sourceId : targetId
        });
      }
    });
    
    // Sort by weight ascending
    return candidateEdges.sort((a, b) => a.weight - b.weight);
  };

  // Perform one step of Prim's algorithm
  const primStep = () => {
    const state = primStateRef.current;
    
    if (state.finished) {
      setRunning(false);
      return;
    }
    
    // If this is the first step, add the source node to the tree
    if (state.inTree.size === 0) {
      const sourceNode = nodesRef.current.find(n => n.id === state.source);
      sourceNode.color = COLORS.inTreeNode;
      state.inTree.add(state.source);
      state.notInTree.delete(state.source);
      state.current = state.source;
      
      setStatus(`Starting with node ${state.source}`);
      updateVisualization();
      
      // Schedule the next step
      animationTimeoutRef.current = setTimeout(primStep, animationSpeed);
      return;
    }
    
    // Get all candidate edges
    const candidateEdges = getCandidateEdges();
    
    // If no candidate edges, we're done
    if (candidateEdges.length === 0) {
      state.finished = true;
      setStatus(`MST found. Weight: ${state.totalWeight}`);
      setRunning(false);
      return;
    }
    
    // Get the minimum weight edge
    const minEdge = candidateEdges[0];
    const newNode = minEdge.notInTreeNode;
    
    // Highlight the edge and nodes
    minEdge.link.color = COLORS.mstEdge;
    const newNodeObj = nodesRef.current.find(n => n.id === newNode);
    newNodeObj.color = COLORS.currentNode;
    state.current = newNode;
    
    // Add to MST
    state.mst.push(minEdge.link);
    state.totalWeight += minEdge.weight;
    
    setStatus(`Adding edge (${minEdge.inTreeNode}-${newNode}). Weight: ${state.totalWeight}`);
    
    updateVisualization();
    
    // Schedule next part
    animationTimeoutRef.current = setTimeout(() => {
      // Mark the new node as in the tree
      state.inTree.add(newNode);
      state.notInTree.delete(newNode);
      newNodeObj.color = COLORS.inTreeNode;
      
      updateVisualization();
      
      // Check if MST is complete
      if (state.inTree.size === nodesRef.current.length) {
        state.finished = true;
        setStatus(`MST found. Weight: ${state.totalWeight}`);
        setRunning(false);
        return;
      }
      
      // Schedule the next step
      animationTimeoutRef.current = setTimeout(primStep, animationSpeed / 2);
    }, animationSpeed / 2);
  };

  // Toggle algorithm running
  const toggleAlgorithm = () => {
    if (running) {
      clearTimeout(animationTimeoutRef.current);
      setRunning(false);
    } else {
      if (primStateRef.current.finished) {
        resetAlgorithm();
      }
      setRunning(true);
      primStep();
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
    <div className="prim-container">
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
              <span>Not in MST</span>
            </div>
            <div className="legend-item">
              <div className="color-box current"></div>
              <span>Current Node</span>
            </div>
            <div className="legend-item">
              <div className="color-box visited"></div>
              <span>In MST</span>
            </div>
            <div className="legend-item">
              <div className="color-box path"></div>
              <span>MST Edge</span>
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

export default Prim;