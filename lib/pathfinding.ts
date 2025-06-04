// A* Pathfinding Algorithm implementation for the logistics grid system
// Define a Point interface for simplicity
interface Point {
  x: number;
  y: number;
}

// Node used in A* search
interface PathNode {
  x: number;
  y: number;
  gCost: number; // Cost from start node
  hCost: number; // Heuristic cost (estimated) to end node
  parent: PathNode | null;
}

// Calculate the fCost (total cost) of a node
const getFCost = (node: PathNode): number => {
  return node.gCost + node.hCost;
};

// Calculate manhattan distance between two points (heuristic)
const getManhattanDistance = (a: Point, b: Point): number => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};


// Get the node with the lowest fCost from a list
const getLowestFCostNode = (list: PathNode[]): PathNode => {
  return list.reduce((lowest, current) => {
    const currentFCost = getFCost(current);
    const lowestFCost = getFCost(lowest);
    
    if (currentFCost < lowestFCost || (currentFCost === lowestFCost && current.hCost < lowest.hCost)) {
      return current;
    }
    return lowest;
  }, list[0]);
};

// Get the node from the list with the same position as the given position
const getNodeFromList = (list: PathNode[], position: Point): PathNode | undefined => {
  return list.find((n) => n.x === position.x && n.y === position.y);
};

// Check if a position is walkable (not blocked and within bounds)
const isWalkable = (
  position: Point,
  blockedCells: Set<string>,
  gridSize: { width: number; height: number }
): boolean => {
  const isWithinBounds = position.x >= 0 && position.x < gridSize.width && position.y >= 0 && position.y < gridSize.height;
  const isNotBlocked = !blockedCells.has(`${position.x}-${position.y}`);
  return isWithinBounds && isNotBlocked;
};

// Trace the path from end node to start node
const tracePath = (endNode: PathNode): Point[] => {
  const path: Point[] = [];
  let currentNode: PathNode | null = endNode;
  
  while (currentNode) {
    path.push({ x: currentNode.x, y: currentNode.y });
    currentNode = currentNode.parent;
  }
  
  return path.reverse();
};

// Find a path from start to end using A* algorithm
export const findPath = (
  start: Point,
  end: Point,
  blockedCells: Set<string>,
  gridSize: { width: number; height: number }
): Point[] | null => {
  // If the destination is a blocked cell
  if (blockedCells.has(`${end.x}-${end.y}`)) {
    return null;
  }

  const openSet: PathNode[] = [];
  const closedSet: PathNode[] = [];
  
  // Add start node to the open set
  const startNode: PathNode = {
    x: start.x,
    y: start.y,
    gCost: 0,
    hCost: getManhattanDistance(start, end),
    parent: null
  };
  openSet.push(startNode);
  
  // Directions: up, right, down, left
  const directions = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 }
  ];
  
  while (openSet.length > 0) {
    const currentNode = getLowestFCostNode(openSet);
    
    // Remove current node from open set
    openSet.splice(openSet.indexOf(currentNode), 1);
    
    // Add current node to closed set
    closedSet.push(currentNode);
    
    // Check if reached the end
    if (currentNode.x === end.x && currentNode.y === end.y) {
      return tracePath(currentNode);
    }
    
    // Check all neighbors
    for (const dir of directions) {
      const neighborPos = { x: currentNode.x + dir.x, y: currentNode.y + dir.y };
      
      // Skip if not walkable or in closed set
      if (!isWalkable(neighborPos, blockedCells, gridSize) || 
          closedSet.some(n => n.x === neighborPos.x && n.y === neighborPos.y)) {
        continue;
      }
      
      const newGCost = currentNode.gCost + 1; // Cost to move to neighbor is 1
      const neighborInOpenSet = getNodeFromList(openSet, neighborPos);
      
      if (!neighborInOpenSet) {
        // Create new neighbor node and add to open set
        const newNeighbor: PathNode = {
          x: neighborPos.x,
          y: neighborPos.y,
          gCost: newGCost,
          hCost: getManhattanDistance(neighborPos, end),
          parent: currentNode
        };
        openSet.push(newNeighbor);
      } else if (newGCost < neighborInOpenSet.gCost) {
        // Update existing node with better path
        neighborInOpenSet.gCost = newGCost;
        neighborInOpenSet.parent = currentNode;
      }
    }
  }
  
  // No path found
  return null;
};

// Find the nearest point to a target that is walkable
export const findNearestWalkable = (
  target: Point,
  blockedCells: Set<string>,
  gridSize: { width: number; height: number },
  maxDistance: number = 5
): Point | null => {
  if (isWalkable(target, blockedCells, gridSize)) {
    return target;
  }
  
  for (let distance = 1; distance <= maxDistance; distance++) {
    for (let dx = -distance; dx <= distance; dx++) {
      for (let dy = -distance; dy <= distance; dy++) {
        // Only check points at exact distance
        if (Math.abs(dx) + Math.abs(dy) === distance) {
          const point = { x: target.x + dx, y: target.y + dy };
          if (isWalkable(point, blockedCells, gridSize)) {
            return point;
          }
        }
      }
    }
  }
  
  return null;
};