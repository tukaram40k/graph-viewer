// utils/benchmarkUtils.ts

// Type for weighted graph representation
type WeightedGraph = Map<string, Array<{node: string, weight: number}>>;
// Type for unweighted graph representation
type UnweightedGraph = Map<string, string[]>;

/**
 * Generates a complete graph where every vertex is connected to every other vertex
 * @param n Number of nodes
 * @param weighted Whether to create a weighted graph
 * @param minWeight Minimum weight for edges (if weighted)
 * @param maxWeight Maximum weight for edges (if weighted)
 */
function generateCompleteGraph(
  n: number, 
  weighted: boolean = true,
  minWeight: number = 1,
  maxWeight: number = 10
): WeightedGraph | UnweightedGraph {
  if (weighted) {
    const graph: WeightedGraph = new Map();
    for (let i = 0; i < n; i++) {
      graph.set(`${i}`, []);
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          const weight = Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight;
          graph.get(`${i}`)!.push({ node: `${j}`, weight });
        }
      }
    }
    return graph;
  } else {
    const graph: UnweightedGraph = new Map();
    for (let i = 0; i < n; i++) {
      graph.set(`${i}`, []);
      for (let j = 0; j < n; j++) {
        if (i !== j) graph.get(`${i}`)!.push(`${j}`);
      }
    }
    return graph;
  }
}

/**
 * Generates a simple graph (no self-loops or multiple edges)
 * @param n Number of nodes
 * @param edgeProbability Probability of an edge between any two vertices (0-1)
 * @param weighted Whether to create a weighted graph
 */
function generateSimpleGraph(
  n: number, 
  edgeProbability: number = 0.5,
  weighted: boolean = true,
  minWeight: number = 1,
  maxWeight: number = 10
): WeightedGraph | UnweightedGraph {
  if (weighted) {
    const graph: WeightedGraph = new Map();
    for (let i = 0; i < n; i++) {
      graph.set(`${i}`, []);
    }
    
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (Math.random() < edgeProbability) {
          const weight = Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight;
          graph.get(`${i}`)!.push({ node: `${j}`, weight });
          graph.get(`${j}`)!.push({ node: `${i}`, weight });
        }
      }
    }
    return graph;
  } else {
    const graph: UnweightedGraph = new Map();
    for (let i = 0; i < n; i++) {
      graph.set(`${i}`, []);
    }
    
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (Math.random() < edgeProbability) {
          graph.get(`${i}`)!.push(`${j}`);
          graph.get(`${j}`)!.push(`${i}`);
        }
      }
    }
    return graph;
  }
}

/**
 * Generates a multigraph (allows multiple edges between vertices)
 * @param n Number of nodes
 * @param maxEdgesBetweenNodes Maximum number of edges between any two nodes
 * @param edgeProbability Probability of creating an edge
 * @param weighted Whether to create a weighted graph
 */
function generateMultigraph(
  n: number, 
  maxEdgesBetweenNodes: number = 3,
  edgeProbability: number = 0.7,
  weighted: boolean = true,
  minWeight: number = 1,
  maxWeight: number = 10
): WeightedGraph | UnweightedGraph {
  if (weighted) {
    const graph: WeightedGraph = new Map();
    for (let i = 0; i < n; i++) {
      graph.set(`${i}`, []);
    }
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          // Determine number of edges between these nodes
          const numEdges = Math.floor(Math.random() * maxEdgesBetweenNodes) + 1;
          for (let k = 0; k < numEdges; k++) {
            if (Math.random() < edgeProbability) {
              const weight = Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight;
              graph.get(`${i}`)!.push({ node: `${j}`, weight });
            }
          }
        }
      }
    }
    return graph;
  } else {
    const graph: UnweightedGraph = new Map();
    for (let i = 0; i < n; i++) {
      graph.set(`${i}`, []);
    }
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          const numEdges = Math.floor(Math.random() * maxEdgesBetweenNodes) + 1;
          for (let k = 0; k < numEdges; k++) {
            if (Math.random() < edgeProbability) {
              graph.get(`${i}`)!.push(`${j}`);
            }
          }
        }
      }
    }
    return graph;
  }
}

/**
 * Generates a sparse graph (|E| ≈ |V| or |E| ≈ |V|log|V|)
 * @param n Number of nodes
 * @param weighted Whether to create a weighted graph
 */
function generateSparseGraph(
  n: number, 
  weighted: boolean = true,
  minWeight: number = 1,
  maxWeight: number = 10
): WeightedGraph | UnweightedGraph {
  // Creating a graph with approximately |E| ≈ 2|V| edges
  if (weighted) {
    const graph: WeightedGraph = new Map();
    for (let i = 0; i < n; i++) {
      graph.set(`${i}`, []);
    }
    
    // First, ensure the graph is connected by creating a path
    for (let i = 0; i < n - 1; i++) {
      const weight = Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight;
      graph.get(`${i}`)!.push({ node: `${i+1}`, weight });
      graph.get(`${i+1}`)!.push({ node: `${i}`, weight });
    }
    
    // Add some additional random edges to reach around 2|V| edges total
    const additionalEdges = n; // Adding |V| more edges for a total of ~2|V|
    let edgesAdded = 0;
    
    while (edgesAdded < additionalEdges) {
      const i = Math.floor(Math.random() * n);
      const j = Math.floor(Math.random() * n);
      
      if (i !== j && !graph.get(`${i}`)!.some(edge => edge.node === `${j}`)) {
        const weight = Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight;
        graph.get(`${i}`)!.push({ node: `${j}`, weight });
        graph.get(`${j}`)!.push({ node: `${i}`, weight });
        edgesAdded++;
      }
    }
    
    return graph;
  } else {
    const graph: UnweightedGraph = new Map();
    for (let i = 0; i < n; i++) {
      graph.set(`${i}`, []);
    }
    
    // First, ensure the graph is connected
    for (let i = 0; i < n - 1; i++) {
      graph.get(`${i}`)!.push(`${i+1}`);
      graph.get(`${i+1}`)!.push(`${i}`);
    }
    
    // Add additional random edges
    const additionalEdges = n;
    let edgesAdded = 0;
    
    while (edgesAdded < additionalEdges) {
      const i = Math.floor(Math.random() * n);
      const j = Math.floor(Math.random() * n);
      
      if (i !== j && !graph.get(`${i}`)!.includes(`${j}`)) {
        graph.get(`${i}`)!.push(`${j}`);
        graph.get(`${j}`)!.push(`${i}`);
        edgesAdded++;
      }
    }
    
    return graph;
  }
}

/**
 * Generates a dense graph (many edges, approaching complete)
 * @param n Number of nodes
 * @param edgeProbability Probability of an edge between any two vertices (high)
 * @param weighted Whether to create a weighted graph
 */
function generateDenseGraph(
  n: number, 
  edgeProbability: number = 0.8,
  weighted: boolean = true,
  minWeight: number = 1,
  maxWeight: number = 10
): WeightedGraph | UnweightedGraph {
  // Uses the simple graph generator but with a high edge probability
  return generateSimpleGraph(n, edgeProbability, weighted, minWeight, maxWeight);
}

/**
 * Generates an unweighted graph
 * @param n Number of nodes
 * @param edgeProbability Probability of an edge between any two vertices
 */
function generateUnweightedGraph(
  n: number, 
  edgeProbability: number = 0.5
): UnweightedGraph {
  return generateSimpleGraph(n, edgeProbability, false) as UnweightedGraph;
}

/**
 * Generates a regular graph (all vertices have the same degree)
 * @param n Number of nodes
 * @param degree The degree for each vertex
 * @param weighted Whether to create a weighted graph
 */
function generateRegularGraph(
  n: number, 
  degree: number = 3,
  weighted: boolean = true,
  minWeight: number = 1,
  maxWeight: number = 10
): WeightedGraph | UnweightedGraph {
  if (degree >= n || degree < 0 || (degree % 2 !== 0 && n % 2 !== 0)) {
    throw new Error("Cannot create regular graph with these parameters");
  }
  
  if (weighted) {
    const graph: WeightedGraph = new Map();
    for (let i = 0; i < n; i++) {
      graph.set(`${i}`, []);
    }
    
    // If degree is even, we can use a simple algorithm
    if (degree % 2 === 0) {
      for (let i = 0; i < n; i++) {
        for (let j = 1; j <= degree / 2; j++) {
          const neighbor = (i + j) % n;
          const weight = Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight;
          graph.get(`${i}`)!.push({ node: `${neighbor}`, weight });
          graph.get(`${neighbor}`)!.push({ node: `${i}`, weight });
        }
      }
    } else {
      // For odd degree, we use a different approach
      // First, create a circle
      for (let i = 0; i < n; i++) {
        const nextNode = (i + 1) % n;
        const weight = Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight;
        graph.get(`${i}`)!.push({ node: `${nextNode}`, weight });
        graph.get(`${nextNode}`)!.push({ node: `${i}`, weight });
      }
      
      // Then add diagonals
      for (let i = 0; i < n; i++) {
        for (let j = 2; j <= (degree - 1) / 2 + 1; j++) {
          const neighbor = (i + j) % n;
          const weight = Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight;
          graph.get(`${i}`)!.push({ node: `${neighbor}`, weight });
          graph.get(`${neighbor}`)!.push({ node: `${i}`, weight });
        }
      }
    }
    
    return graph;
  } else {
    const graph: UnweightedGraph = new Map();
    for (let i = 0; i < n; i++) {
      graph.set(`${i}`, []);
    }
    
    if (degree % 2 === 0) {
      for (let i = 0; i < n; i++) {
        for (let j = 1; j <= degree / 2; j++) {
          const neighbor = (i + j) % n;
          graph.get(`${i}`)!.push(`${neighbor}`);
          graph.get(`${neighbor}`)!.push(`${i}`);
        }
      }
    } else {
      for (let i = 0; i < n; i++) {
        const nextNode = (i + 1) % n;
        graph.get(`${i}`)!.push(`${nextNode}`);
        graph.get(`${nextNode}`)!.push(`${i}`);
      }
      
      for (let i = 0; i < n; i++) {
        for (let j = 2; j <= (degree - 1) / 2 + 1; j++) {
          const neighbor = (i + j) % n;
          graph.get(`${i}`)!.push(`${neighbor}`);
          graph.get(`${neighbor}`)!.push(`${i}`);
        }
      }
    }
    
    return graph;
  }
}

/**
 * Generates a tree (connected acyclic graph)
 * @param n Number of nodes
 * @param weighted Whether to create a weighted graph
 */
function generateTree(
  n: number, 
  weighted: boolean = true,
  minWeight: number = 1,
  maxWeight: number = 10
): WeightedGraph | UnweightedGraph {
  if (weighted) {
    const graph: WeightedGraph = new Map();
    for (let i = 0; i < n; i++) {
      graph.set(`${i}`, []);
    }
    
    // Connect each node (except node 0) to a random node with a lower index
    for (let i = 1; i < n; i++) {
      const parent = Math.floor(Math.random() * i);
      const weight = Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight;
      
      graph.get(`${parent}`)!.push({ node: `${i}`, weight });
      graph.get(`${i}`)!.push({ node: `${parent}`, weight });
    }
    
    return graph;
  } else {
    const graph: UnweightedGraph = new Map();
    for (let i = 0; i < n; i++) {
      graph.set(`${i}`, []);
    }
    
    for (let i = 1; i < n; i++) {
      const parent = Math.floor(Math.random() * i);
      graph.get(`${parent}`)!.push(`${i}`);
      graph.get(`${i}`)!.push(`${parent}`);
    }
    
    return graph;
  }
}

/**
 * Generates a disconnected graph (multiple components)
 * @param n Number of nodes
 * @param components Number of disconnected components
 * @param weighted Whether to create a weighted graph
 */
function generateDisconnectedGraph(
  n: number, 
  components: number = 3,
  weighted: boolean = true,
  minWeight: number = 1,
  maxWeight: number = 10
): WeightedGraph | UnweightedGraph {
  components = Math.min(components, n);
  const nodesPerComponent = Math.floor(n / components);
  
  if (weighted) {
    const graph: WeightedGraph = new Map();
    for (let i = 0; i < n; i++) {
      graph.set(`${i}`, []);
    }
    
    // Create each component as a separate connected subgraph
    for (let c = 0; c < components; c++) {
      const start = c * nodesPerComponent;
      const end = (c === components - 1) ? n : (c + 1) * nodesPerComponent;
      
      // Create a random connected subgraph for this component
      for (let i = start + 1; i < end; i++) {
        const parent = start + Math.floor(Math.random() * (i - start));
        const weight = Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight;
        
        graph.get(`${parent}`)!.push({ node: `${i}`, weight });
        graph.get(`${i}`)!.push({ node: `${parent}`, weight });
      }
      
      // Add some additional random edges within the component
      const edgesToAdd = Math.min(5, Math.floor((end - start) / 2));
      for (let e = 0; e < edgesToAdd; e++) {
        const u = start + Math.floor(Math.random() * (end - start));
        let v = start + Math.floor(Math.random() * (end - start));
        
        // Make sure we don't add edges to itself or duplicate edges
        if (u !== v && !graph.get(`${u}`)!.some(edge => edge.node === `${v}`)) {
          const weight = Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight;
          graph.get(`${u}`)!.push({ node: `${v}`, weight });
          graph.get(`${v}`)!.push({ node: `${u}`, weight });
        }
      }
    }
    
    return graph;
  } else {
    const graph: UnweightedGraph = new Map();
    for (let i = 0; i < n; i++) {
      graph.set(`${i}`, []);
    }
    
    for (let c = 0; c < components; c++) {
      const start = c * nodesPerComponent;
      const end = (c === components - 1) ? n : (c + 1) * nodesPerComponent;
      
      for (let i = start + 1; i < end; i++) {
        const parent = start + Math.floor(Math.random() * (i - start));
        graph.get(`${parent}`)!.push(`${i}`);
        graph.get(`${i}`)!.push(`${parent}`);
      }
      
      const edgesToAdd = Math.min(5, Math.floor((end - start) / 2));
      for (let e = 0; e < edgesToAdd; e++) {
        const u = start + Math.floor(Math.random() * (end - start));
        let v = start + Math.floor(Math.random() * (end - start));
        
        if (u !== v && !graph.get(`${u}`)!.includes(`${v}`)) {
          graph.get(`${u}`)!.push(`${v}`);
          graph.get(`${v}`)!.push(`${u}`);
        }
      }
    }
    
    return graph;
  }
}

/**
 * Generates an acyclic graph (no cycles)
 * @param n Number of nodes
 * @param edgeProbability Probability of adding allowable edges
 * @param weighted Whether to create a weighted graph
 */
function generateAcyclicGraph(
  n: number, 
  edgeProbability: number = 0.3,
  weighted: boolean = true,
  minWeight: number = 1,
  maxWeight: number = 10
): WeightedGraph | UnweightedGraph {
  // Create a directed acyclic graph (DAG) by ensuring edges only go from lower to higher indices
  if (weighted) {
    const graph: WeightedGraph = new Map();
    for (let i = 0; i < n; i++) {
      graph.set(`${i}`, []);
    }
    
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (Math.random() < edgeProbability) {
          const weight = Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight;
          graph.get(`${i}`)!.push({ node: `${j}`, weight });
        }
      }
    }
    
    return graph;
  } else {
    const graph: UnweightedGraph = new Map();
    for (let i = 0; i < n; i++) {
      graph.set(`${i}`, []);
    }
    
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (Math.random() < edgeProbability) {
          graph.get(`${i}`)!.push(`${j}`);
        }
      }
    }
    
    return graph;
  }
}

/**
 * Generates a cyclic graph (contains at least one cycle)
 * @param n Number of nodes
 * @param edgeProbability Probability of additional edges
 * @param weighted Whether to create a weighted graph
 */
function generateCyclicGraph(
  n: number, 
  edgeProbability: number = 0.3,
  weighted: boolean = true,
  minWeight: number = 1,
  maxWeight: number = 10
): WeightedGraph | UnweightedGraph {
  if (n < 3) throw new Error("Cyclic graph requires at least 3 nodes");
  
  if (weighted) {
    const graph: WeightedGraph = new Map();
    for (let i = 0; i < n; i++) {
      graph.set(`${i}`, []);
    }
    
    // Create at least one cycle
    for (let i = 0; i < n; i++) {
      const nextNode = (i + 1) % n;
      const weight = Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight;
      graph.get(`${i}`)!.push({ node: `${nextNode}`, weight });
      graph.get(`${nextNode}`)!.push({ node: `${i}`, weight });
    }
    
    // Add some additional random edges
    for (let i = 0; i < n; i++) {
      for (let j = i + 2; j < i + n - 1; j++) {
        const actualJ = j % n;
        if (i !== actualJ && Math.random() < edgeProbability && 
            !graph.get(`${i}`)!.some(edge => edge.node === `${actualJ}`)) {
          const weight = Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight;
          graph.get(`${i}`)!.push({ node: `${actualJ}`, weight });
          graph.get(`${actualJ}`)!.push({ node: `${i}`, weight });
        }
      }
    }
    
    return graph;
  } else {
    const graph: UnweightedGraph = new Map();
    for (let i = 0; i < n; i++) {
      graph.set(`${i}`, []);
    }
    
    // Create at least one cycle
    for (let i = 0; i < n; i++) {
      const nextNode = (i + 1) % n;
      graph.get(`${i}`)!.push(`${nextNode}`);
      graph.get(`${nextNode}`)!.push(`${i}`);
    }
    
    // Add some additional random edges
    for (let i = 0; i < n; i++) {
      for (let j = i + 2; j < i + n - 1; j++) {
        const actualJ = j % n;
        if (i !== actualJ && Math.random() < edgeProbability && 
            !graph.get(`${i}`)!.includes(`${actualJ}`)) {
          graph.get(`${i}`)!.push(`${actualJ}`);
          graph.get(`${actualJ}`)!.push(`${i}`);
        }
      }
    }
    
    return graph;
  }
}

/**
 * Generates a planar graph (can be drawn without edge crossings)
 * @param n Number of nodes
 * @param weighted Whether to create a weighted graph
 */
function generatePlanarGraph(
  n: number, 
  weighted: boolean = true,
  minWeight: number = 1,
  maxWeight: number = 10
): WeightedGraph | UnweightedGraph {
  // We'll generate a simple triangulation which guarantees planarity
  if (weighted) {
    const graph: WeightedGraph = new Map();
    for (let i = 0; i < n; i++) {
      graph.set(`${i}`, []);
    }
    
    // Create an outer cycle
    for (let i = 0; i < n; i++) {
      const nextNode = (i + 1) % n;
      const weight = Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight;
      graph.get(`${i}`)!.push({ node: `${nextNode}`, weight });
      graph.get(`${nextNode}`)!.push({ node: `${i}`, weight });
    }
    
    // For n > 3, add a star-like structure for planarity
    if (n > 3) {
      const center = Math.floor(n / 2);
      for (let i = 0; i < n; i++) {
        if (i !== center && !graph.get(`${center}`)!.some(edge => edge.node === `${i}`)) {
          const weight = Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight;
          graph.get(`${center}`)!.push({ node: `${i}`, weight });
          graph.get(`${i}`)!.push({ node: `${center}`, weight });
        }
      }
    }
    
    return graph;
  } else {
    const graph: UnweightedGraph = new Map();
    for (let i = 0; i < n; i++) {
      graph.set(`${i}`, []);
    }
    
    // Create an outer cycle
    for (let i = 0; i < n; i++) {
      const nextNode = (i + 1) % n;
      graph.get(`${i}`)!.push(`${nextNode}`);
      graph.get(`${nextNode}`)!.push(`${i}`);
    }
    
    // For n > 3, add a star-like structure for planarity
    if (n > 3) {
      const center = Math.floor(n / 2);
      for (let i = 0; i < n; i++) {
        if (i !== center && !graph.get(`${center}`)!.includes(`${i}`)) {
          graph.get(`${center}`)!.push(`${i}`);
          graph.get(`${i}`)!.push(`${center}`);
        }
      }
    }
    
    return graph;
  }
}

/**
 * Convert a weighted graph to unweighted format for compatibility with algorithms
 * @param weightedGraph The weighted graph to convert
 */
function weightedToUnweighted(weightedGraph: WeightedGraph): UnweightedGraph {
  const unweightedGraph: UnweightedGraph = new Map();
  
  for (const [node, edges] of weightedGraph.entries()) {
    unweightedGraph.set(node, edges.map(edge => edge.node));
  }
  
  return unweightedGraph;
}

/**
 * Helper function to extract unique edge pairs for Kruskal's algorithm
 * @param graph The graph to extract edges from
 */
function extractEdgePairs(graph: WeightedGraph | UnweightedGraph): [string, string][] {
  const edges: [string, string][] = [];
  const visited = new Set<string>();
  
  for (const [node, neighbors] of graph.entries()) {
    for (const neighbor of neighbors) {
      const nextNode = typeof neighbor === 'string' ? neighbor : neighbor.node;
      
      // Create a unique key for this edge to avoid duplicates
      const edgeKey = [node, nextNode].sort().join('-');
      if (!visited.has(edgeKey)) {
        visited.add(edgeKey);
        edges.push([node, nextNode]);
      }
    }
  }
  
  return edges;
}

/**
 * Main function to generate different types of graphs
 */
function generateGraph(
  type: string, 
  nodes: number,
  weighted: boolean = true
): WeightedGraph | UnweightedGraph {
  switch (type) {
    case 'Simple':
      return generateSimpleGraph(nodes, 0.5, weighted);
    case 'Multigraph':
      return generateMultigraph(nodes, 3, 0.7, weighted);
    case 'Sparse':
      return generateSparseGraph(nodes, weighted);
    case 'Dense':
      return generateDenseGraph(nodes, 0.8, weighted);
    case 'Complete':
      return generateCompleteGraph(nodes, weighted);
    case 'Unweighted':
      return generateUnweightedGraph(nodes, 0.5);
    case 'Regular':
      return generateRegularGraph(nodes, Math.min(4, nodes - 1), weighted);
    case 'Tree':
      return generateTree(nodes, weighted);
    case 'Disconnected':
      return generateDisconnectedGraph(nodes, Math.min(3, Math.floor(nodes / 3)), weighted);
    case 'Acyclic':
      return generateAcyclicGraph(nodes, 0.3, weighted);
    case 'Cyclic':
      return generateCyclicGraph(nodes, 0.3, weighted);
    case 'Planar':
      return generatePlanarGraph(nodes, weighted);
    default:
      return generateCompleteGraph(nodes, weighted);
  }
}

// Modified algorithms to work with both weighted and unweighted graphs
function dfs(graph: WeightedGraph | UnweightedGraph, start: string, visited = new Set<string>()) {
  visited.add(start);
  
  const neighbors = graph.get(start) || [];
  for (const neighbor of neighbors) {
    // Handle both weighted and unweighted graph formats
    const nextNode = typeof neighbor === 'string' ? neighbor : neighbor.node;
    if (!visited.has(nextNode)) {
      dfs(graph, nextNode, visited);
    }
  }
  
  return visited;
}

function bfs(graph: WeightedGraph | UnweightedGraph, start: string) {
  const visited = new Set<string>();
  const queue: string[] = [start];
  
  while (queue.length) {
    const node = queue.shift()!;
    if (!visited.has(node)) {
      visited.add(node);
      
      const neighbors = graph.get(node) || [];
      for (const neighbor of neighbors) {
        // Handle both weighted and unweighted graph formats
        const nextNode = typeof neighbor === 'string' ? neighbor : neighbor.node;
        if (!visited.has(nextNode)) {
          queue.push(nextNode);
        }
      }
    }
  }
  
  return visited;
}

function prim(graph: WeightedGraph | UnweightedGraph) {
  const nodes = Array.from(graph.keys());
  if (nodes.length === 0) return new Set<string>();
  
  const visited = new Set<string>();
  visited.add(nodes[0]);
  
  while (visited.size < nodes.length) {
    let bestEdge: { from: string, to: string, weight: number } | null = null;
    
    // For each visited node, find the lowest weight edge to an unvisited node
    for (const visitedNode of visited) {
      const neighbors = graph.get(visitedNode) || [];
      
      for (const neighbor of neighbors) {
        const nextNode = typeof neighbor === 'string' ? neighbor : neighbor.node;
        const weight = typeof neighbor === 'string' ? 1 : neighbor.weight;
        
        if (!visited.has(nextNode) && (bestEdge === null || weight < bestEdge.weight)) {
          bestEdge = { from: visitedNode, to: nextNode, weight };
        }
      }
    }
    
    // If we found a valid edge, add the destination to visited
    if (bestEdge) {
      visited.add(bestEdge.to);
    } else {
      // No more edges to add - we might be dealing with a disconnected graph
      // Find any unvisited node and add it (to handle disconnected components)
      const unvisitedNode = nodes.find(node => !visited.has(node));
      if (unvisitedNode) {
        visited.add(unvisitedNode);
      } else {
        break; // All nodes visited
      }
    }
  }
  
  return visited;
}

function kruskal(nodes: string[], edges: [string, string, number?][]) {
  const parent = new Map<string, string>();
  const rank = new Map<string, number>();
  
  // Initialize disjoint set
  const makeSet = (node: string) => {
    parent.set(node, node);
    rank.set(node, 0);
  };
  
  // Find with path compression
  const find = (node: string): string => {
    if (parent.get(node) !== node) {
      parent.set(node, find(parent.get(node)!));
    }
    return parent.get(node)!;
  };
  
  // Union by rank
  const union = (x: string, y: string) => {
    const rootX = find(x);
    const rootY = find(y);
    
    if (rootX === rootY) return;
    
    if (rank.get(rootX)! < rank.get(rootY)!) {
      parent.set(rootX, rootY);
    } else if (rank.get(rootX)! > rank.get(rootY)!) {
      parent.set(rootY, rootX);
    } else {
      parent.set(rootY, rootX);
      rank.set(rootX, rank.get(rootX)! + 1);
    }
  };
  
  // Initialize sets for all nodes
  for (const node of nodes) {
    makeSet(node);
  }
  
  // Sort edges by weight (if weights are provided)
  const sortedEdges = [...edges].sort((a, b) => {
    const weightA = a[2] ?? 1;
    const weightB = b[2] ?? 1;
    return weightA - weightB;
  });
  
  const resultEdges: [string, string][] = [];
  
  // Process edges in order of increasing weight
  for (const [u, v] of sortedEdges) {
    if (find(u) !== find(v)) {
      union(u, v);
      resultEdges.push([u, v]);
    }
  }
  
  return resultEdges;
}

function dijkstra(graph: WeightedGraph | UnweightedGraph, start: string) {
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visited = new Set<string>();
  
  // Initialize distances
  for (const node of graph.keys()) {
    dist[node] = node === start ? 0 : Infinity;
    prev[node] = null;
  }
  
  while (visited.size < graph.size) {
    // Find the unvisited node with the minimum distance
    let minNode: string | null = null;
    let minDist = Infinity;
    
    for (const node of graph.keys()) {
      if (!visited.has(node) && dist[node] < minDist) {
        minDist = dist[node];
        minNode = node;
      }
    }
    
    if (minNode === null || dist[minNode] === Infinity) break; // No path to remaining nodes
    
    visited.add(minNode);
    
    // Update distances to neighbors
    const neighbors = graph.get(minNode) || [];
    for (const neighbor of neighbors) {
      const nextNode = typeof neighbor === 'string' ? neighbor : neighbor.node;
      const edgeWeight = typeof neighbor === 'string' ? 1 : neighbor.weight;
      
      if (!visited.has(nextNode)) {
        const newDist = dist[minNode] + edgeWeight;
        if (newDist < dist[nextNode]) {
          dist[nextNode] = newDist;
          prev[nextNode] = minNode;
        }
      }
    }
  }
  
  return { dist, prev };
}

function floydWarshall(graph: WeightedGraph | UnweightedGraph) {
  const nodes = Array.from(graph.keys());
  const dist: Record<string, Record<string, number>> = {};
  
  // Initialize distances
  for (const i of nodes) {
    dist[i] = {};
    for (const j of nodes) {
      dist[i][j] = i === j ? 0 : Infinity;
    }
    
    const neighbors = graph.get(i) || [];
    for (const neighbor of neighbors) {
      const nextNode = typeof neighbor === 'string' ? neighbor : neighbor.node;
      const weight = typeof neighbor === 'string' ? 1 : neighbor.weight;
      dist[i][nextNode] = weight;
    }
  }
  
  // Floyd-Warshall algorithm
  for (const k of nodes) {
    for (const i of nodes) {
      for (const j of nodes) {
        if (dist[i][k] !== Infinity && dist[k][j] !== Infinity) {
          dist[i][j] = Math.min(dist[i][j], dist[i][k] + dist[k][j]);
        }
      }
    }
  }
  
  return dist;
}

// ==============================================
export function runAlgorithmsOnGraph(
  graphType: string,
  useWeighted: boolean = true
): Array<{ algorithm: string; nodes: number; time: number }> {
  // Different node counts to test performance
  const nodeCounts = [10, 50, 100, 200];
  const results: Array<{ algorithm: string; nodes: number; time: number }> = [];
  
  for (const n of nodeCounts) {
    // Generate the appropriate graph
    const graph = generateGraph(graphType, n, useWeighted);
    const nodes = Array.from(graph.keys());
    
    // Get proper edge pairs for Kruskal's algorithm
    const edgePairsWithWeights = getEdgePairsWithWeights(graph);
    
    // Helper function to measure execution time
    const time = (fn: () => void): number => {
      const start = performance.now();
      fn();
      return performance.now() - start;
    };
    
    // Run DFS algorithm
    results.push({ 
      algorithm: 'DFS', 
      nodes: n, 
      time: time(() => { dfs(graph, '0'); }) 
    });
    
    // Run BFS algorithm
    results.push({ 
      algorithm: 'BFS', 
      nodes: n, 
      time: time(() => { bfs(graph, '0'); }) 
    });
    
    // Run Prim's algorithm
    results.push({ 
      algorithm: 'Prim', 
      nodes: n, 
      time: time(() => { prim(graph); }) 
    });
    
    // Run Kruskal's algorithm
    results.push({ 
      algorithm: 'Kruskal', 
      nodes: n, 
      time: time(() => { kruskal(nodes, edgePairsWithWeights); }) 
    });
    
    // Run Dijkstra's algorithm
    results.push({ 
      algorithm: 'Dijkstra', 
      nodes: n, 
      time: time(() => { dijkstra(graph, '0'); }) 
    });
    
    // Run Floyd-Warshall algorithm
    results.push({ 
      algorithm: 'Floyd-Warshall', 
      nodes: n, 
      time: time(() => { floydWarshall(graph); }) 
    });
  }
  
  return results;
}






/**
 * Helper function to get edge pairs with weights for algorithms
 */
function getEdgePairsWithWeights(graph: WeightedGraph | UnweightedGraph): [string, string, number][] {
  const edges: [string, string, number][] = [];
  const visited = new Set<string>();
  
  for (const [node, neighbors] of graph.entries()) {
    for (const neighbor of neighbors) {
      const nextNode = typeof neighbor === 'string' ? neighbor : neighbor.node;
      const weight = typeof neighbor === 'string' ? 1 : neighbor.weight;
      
      // Avoid duplicates for undirected graphs
      const edgeKey = [node, nextNode].sort().join('-');
      if (!visited.has(edgeKey)) {
        visited.add(edgeKey);
        edges.push([node, nextNode, weight]);
      }
    }
  }
  
  return edges;
}