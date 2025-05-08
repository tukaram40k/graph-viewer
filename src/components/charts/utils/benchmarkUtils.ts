function generateGraph(nodes: number): Map<string, string[]> {
    const graph = new Map<string, string[]>();
    for (let i = 0; i < nodes; i++) graph.set(`${i}`, []);
    for (let i = 0; i < nodes - 1; i++) {
      graph.get(`${i}`)?.push(`${i + 1}`);
      graph.get(`${i + 1}`)?.push(`${i}`);
    }
    return graph;
  }
  
  function dfs(graph: Map<string, string[]>, start: string, visited = new Set<string>()) {
    visited.add(start);
    for (const neighbor of graph.get(start) || []) {
      if (!visited.has(neighbor)) dfs(graph, neighbor, visited);
    }
  }
  
  function bfs(graph: Map<string, string[]>, start: string) {
    const visited = new Set<string>();
    const queue: string[] = [start];
    while (queue.length) {
      const node = queue.shift()!;
      if (!visited.has(node)) {
        visited.add(node);
        queue.push(...(graph.get(node) || []).filter(n => !visited.has(n)));
      }
    }
  }
  
  function prim(graph: Map<string, string[]>) {
    const visited = new Set<string>();
    const nodes = Array.from(graph.keys());
    if (nodes.length === 0) return;
    visited.add(nodes[0]);
    while (visited.size < graph.size) {
      for (const [node, neighbors] of graph.entries()) {
        if (visited.has(node)) {
          for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
              visited.add(neighbor);
              break;
            }
          }
        }
      }
    }
  }
  
  function kruskal(nodes: string[], edges: [string, string][]) {
    const parent = new Map<string, string>();
    const find = (n: string): string => {
      if (parent.get(n) !== n) parent.set(n, find(parent.get(n)!));
      return parent.get(n)!;
    };
    const union = (a: string, b: string) => {
      parent.set(find(a), find(b));
    };
  
    nodes.forEach(n => parent.set(n, n));
    for (const [u, v] of edges) {
      if (find(u) !== find(v)) union(u, v);
    }
  }
  
  function dijkstra(graph: Map<string, string[]>, start: string) {
    const dist: Record<string, number> = {};
    const visited = new Set<string>();
    for (const key of graph.keys()) dist[key] = Infinity;
    dist[start] = 0;
    while (visited.size < graph.size) {
      let minNode: string | null = null;
      let minDist = Infinity;
      for (const node of graph.keys()) {
        if (!visited.has(node) && dist[node] < minDist) {
          minDist = dist[node];
          minNode = node;
        }
      }
      if (minNode === null) break;
      visited.add(minNode);
      for (const neighbor of graph.get(minNode) || []) {
        const newDist = dist[minNode] + 1;
        if (newDist < dist[neighbor]) dist[neighbor] = newDist;
      }
    }
  }
  
  function floydWarshall(graph: Map<string, string[]>) {
    const nodes = Array.from(graph.keys());
    const dist: Record<string, Record<string, number>> = {};
    nodes.forEach(i => {
      dist[i] = {};
      nodes.forEach(j => {
        dist[i][j] = i === j ? 0 : (graph.get(i)?.includes(j) ? 1 : Infinity);
      });
    });
  
    for (const k of nodes)
      for (const i of nodes)
        for (const j of nodes)
          dist[i][j] = Math.min(dist[i][j], dist[i][k] + dist[k][j]);
  }
  
  export function runAlgorithmsOnGraph(graphType: string) {
    const nodeCounts = [10, 50, 100, 200];
    const results: any[] = [];
  
    for (const n of nodeCounts) {
      const graph = generateGraph(n);
      const nodes = Array.from(graph.keys());
      const edges: [string, string][] = nodes.slice(1).map((v, i) => [nodes[i], v]);
  
      const time = (fn: () => void) => {
        const start = performance.now();
        fn();
        return performance.now() - start;
      };
  
      results.push({ algorithm: 'DFS+BFS', nodes: n, time: time(() => { dfs(graph, '0'); bfs(graph, '0'); }) });
      results.push({ algorithm: 'Prim+Kruskal', nodes: n, time: time(() => { prim(graph); kruskal(nodes, edges); }) });
      results.push({ algorithm: 'Dijkstra+FW', nodes: n, time: time(() => { dijkstra(graph, '0'); floydWarshall(graph); }) });
    }
  
    return results;
  }