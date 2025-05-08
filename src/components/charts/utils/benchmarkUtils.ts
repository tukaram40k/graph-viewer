export function runAlgorithmsOnGraph(graphType: string) {
    // Simulate performance data for 3 algorithm groups
    const nodeCounts = [10, 50, 100, 200, 500];
    const results: any[] = [];
    const algGroups = ['DFS+BFS', 'Prim+Kruskal', 'Dijkstra+FW'];
  
    nodeCounts.forEach(nodes => {
      algGroups.forEach(algo => {
        const start = performance.now();
        // Simulate some computation time
        for (let i = 0; i < nodes * 1000; i++) {
          Math.sqrt(i);
        }
        const end = performance.now();
        results.push({ algorithm: algo, nodes, time: end - start });
      });
    });
  
    return results;
  }