/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/mapUtils.ts

import { 
  GridPosition, 
  Vehicle, 
  Route, 
  Blockage, 
  MapConfig,
  ViewportState,
  MapState 
} from '@/types/map';

export const DEFAULT_MAP_CONFIG: MapConfig = {
  width: 70, // Ancho del mapa según especificación
  height: 50, // Alto del mapa según especificación
  cellSize: 14, // Tamaño de celda ajustado para mejor visualización
};

export const DEFAULT_VIEWPORT: ViewportState = {
  zoom: 1,
  panX: 0,
  panY: 0,
};

// Grid utilities
export function gridToPixel(
  position: GridPosition, 
  cellSize: number
): { x: number; y: number } {
  return {
    x: position.x * cellSize + cellSize / 2,
    y: position.y * cellSize + cellSize / 2,
  };
}

export function pixelToGrid(
  x: number, 
  y: number, 
  cellSize: number
): GridPosition {
  return {
    x: Math.floor(x / cellSize),
    y: Math.floor(y / cellSize),
  };
}

export function isValidGridPosition(
  position: GridPosition, 
  config: MapConfig
): boolean {
  return (
    position.x >= 0 &&
    position.x < config.width &&
    position.y >= 0 &&
    position.y < config.height
  );
}

// Distance calculations
export function calculateDistance(
  from: GridPosition, 
  to: GridPosition
): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function calculateManhattanDistance(
  from: GridPosition, 
  to: GridPosition
): number {
  return Math.abs(to.x - from.x) + Math.abs(to.y - from.y);
}

// Vehicle utilities - ORTHOGONAL MOVEMENT ONLY
export function interpolateVehiclePosition(
  vehicle: Vehicle,
  progress: number
): GridPosition {
  if (!vehicle.route || vehicle.route.path.length === 0) {
    return vehicle.position;
  }

  const path = vehicle.route.path;
  const totalDistance = path.length - 1;
  const currentSegment = Math.min(Math.floor(progress * totalDistance), totalDistance - 1);
  const segmentProgress = (progress * totalDistance) - currentSegment;

  if (currentSegment >= path.length - 1) {
    return path[path.length - 1];
  }

  const from = path[currentSegment];
  const to = path[currentSegment + 1];

  // Ensure orthogonal movement: move completely in one direction, then the other
  if (from.x !== to.x && from.y !== to.y) {
    // This shouldn't happen with proper orthogonal pathfinding, but handle it
    console.warn('Non-orthogonal path segment detected:', from, to);
    return segmentProgress < 0.5 ? from : to;
  }

  return {
    x: from.x + (to.x - from.x) * segmentProgress,
    y: from.y + (to.y - from.y) * segmentProgress,
  };
}

export function getVehicleDirection(vehicle: Vehicle): string {
  if (!vehicle.destination) return '●';
  
  const dx = vehicle.destination.x - vehicle.position.x;
  const dy = vehicle.destination.y - vehicle.position.y;
  
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? '→' : '←';
  } else {
    return dy > 0 ? '↓' : '↑';
  }
}

export function getVehicleColor(vehicle: Vehicle): string {
  const colors = {
    idle: '#6B7280',
    delivering: '#1E40AF',
    returning: '#7E22CE',
    maintenance: '#DC2626',
    refueling: '#F59E0B',
    broken: '#EF4444',
  };
  return colors[vehicle.status] || colors.idle;
}

// Route utilities
export function createRoute(
  from: GridPosition,
  to: GridPosition,
  avoidPositions: GridPosition[] = []
): GridPosition[] {
  // Simple A* pathfinding implementation - ORTHOGONAL ONLY (no diagonals)
  const openSet: GridPosition[] = [from];
  const cameFrom = new Map<string, GridPosition>();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  
  const positionKey = (pos: GridPosition) => `${pos.x},${pos.y}`;
  
  gScore.set(positionKey(from), 0);
  fScore.set(positionKey(from), calculateManhattanDistance(from, to));
  
  // Only orthogonal neighbors (no diagonals)
  const neighbors = [
    { x: 0, y: 1 },   // down
    { x: 1, y: 0 },   // right
    { x: 0, y: -1 },  // up
    { x: -1, y: 0 },  // left
  ];
  
  while (openSet.length > 0) {
    // Get position with lowest fScore
    let current = openSet[0];
    let currentIndex = 0;
    
    for (let i = 1; i < openSet.length; i++) {
      if ((fScore.get(positionKey(openSet[i])) || Infinity) < 
          (fScore.get(positionKey(current)) || Infinity)) {
        current = openSet[i];
        currentIndex = i;
      }
    }
    
    if (current.x === to.x && current.y === to.y) {
      // Reconstruct path
      const path: GridPosition[] = [current];
      while (cameFrom.has(positionKey(current))) {
        current = cameFrom.get(positionKey(current))!;
        path.unshift(current);
      }
      return path;
    }
    
    openSet.splice(currentIndex, 1);
    
    for (const neighbor of neighbors) {
      const newPos: GridPosition = {
        x: current.x + neighbor.x,
        y: current.y + neighbor.y,
      };
      
      // Check bounds and avoid obstacles
      if (!isValidGridPosition(newPos, DEFAULT_MAP_CONFIG) ||
          avoidPositions.some(avoid => avoid.x === newPos.x && avoid.y === newPos.y)) {
        continue;
      }
      
      const tentativeGScore = (gScore.get(positionKey(current)) || Infinity) + 1;
      
      if (tentativeGScore < (gScore.get(positionKey(newPos)) || Infinity)) {
        cameFrom.set(positionKey(newPos), current);
        gScore.set(positionKey(newPos), tentativeGScore);
        fScore.set(positionKey(newPos), tentativeGScore + calculateManhattanDistance(newPos, to));
        
        if (!openSet.some(pos => pos.x === newPos.x && pos.y === newPos.y)) {
          openSet.push(newPos);
        }
      }
    }
  }
  
  // No path found, return direct orthogonal path
  const directPath: GridPosition[] = [from];
  const current = { ...from };
  
  // Move horizontally first, then vertically (no diagonals)
  while (current.x !== to.x) {
    current.x += current.x < to.x ? 1 : -1;
    directPath.push({ ...current });
  }
  while (current.y !== to.y) {
    current.y += current.y < to.y ? 1 : -1;
    directPath.push({ ...current });
  }
  
  return directPath;
}

// Blockage utilities
export function isRouteBlocked(
  route: Route,
  blockages: Blockage[]
): boolean {
  return blockages.some(blockage => {
    if (blockage.status !== 'active') return false;
    
    return route.path.some((point, index) => {
      if (index === 0) return false;
      const prevPoint = route.path[index - 1];
      return isSegmentBlocked(prevPoint, point, blockage);
    });
  });
}

export function isSegmentBlocked(
  from: GridPosition,
  to: GridPosition,
  blockage: Blockage
): boolean {
  // Check if the segment intersects with the blockage
  const minX = Math.min(blockage.from.x, blockage.to.x);
  const maxX = Math.max(blockage.from.x, blockage.to.x);
  const minY = Math.min(blockage.from.y, blockage.to.y);
  const maxY = Math.max(blockage.from.y, blockage.to.y);
  
  const segMinX = Math.min(from.x, to.x);
  const segMaxX = Math.max(from.x, to.x);
  const segMinY = Math.min(from.y, to.y);
  const segMaxY = Math.max(from.y, to.y);
  
  return !(segMaxX < minX || segMinX > maxX || segMaxY < minY || segMinY > maxY);
}

// Viewport utilities
export function worldToScreen(
  worldPos: GridPosition,
  viewport: ViewportState,
  cellSize: number
): { x: number; y: number } {
  const pixel = gridToPixel(worldPos, cellSize);
  return {
    x: (pixel.x + viewport.panX) * viewport.zoom,
    y: (pixel.y + viewport.panY) * viewport.zoom,
  };
}

export function screenToWorld(
  screenX: number,
  screenY: number,
  viewport: ViewportState,
  cellSize: number
): GridPosition {
  const worldX = (screenX / viewport.zoom) - viewport.panX;
  const worldY = (screenY / viewport.zoom) - viewport.panY;
  return pixelToGrid(worldX, worldY, cellSize);
}

export function fitToViewport(
  positions: GridPosition[],
  canvasWidth: number,
  canvasHeight: number,
  cellSize: number,
  padding: number = 50
): ViewportState {
  if (positions.length === 0) {
    return DEFAULT_VIEWPORT;
  }
  
  const minX = Math.min(...positions.map(p => p.x));
  const maxX = Math.max(...positions.map(p => p.x));
  const minY = Math.min(...positions.map(p => p.y));
  const maxY = Math.max(...positions.map(p => p.y));
  
  const width = (maxX - minX) * cellSize;
  const height = (maxY - minY) * cellSize;
  
  const zoomX = (canvasWidth - padding * 2) / width;
  const zoomY = (canvasHeight - padding * 2) / height;
  const zoom = Math.min(zoomX, zoomY, 3); // Max zoom of 3x
  
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  
  return {
    zoom,
    panX: (canvasWidth / zoom / 2) - (centerX * cellSize),
    panY: (canvasHeight / zoom / 2) - (centerY * cellSize),
    centerPosition: { x: centerX, y: centerY },
  };
}

// Data filtering utilities
export function filterMapData(
  data: MapState,
  filters: any,
  viewport?: ViewportState
): Partial<MapState> {
  // Función para verificar si una entidad está dentro del viewport visible
  const isInViewport = (position: GridPosition): boolean => {
    if (!viewport) return true; // Si no hay viewport, mostrar todo
    
    // Calcular los límites del viewport
    const margin = 5; // Margen adicional para evitar apariciones/desapariciones bruscas
    const minX = Math.floor(viewport.panX / DEFAULT_MAP_CONFIG.cellSize) - margin;
    const maxX = Math.ceil((viewport.panX + window.innerWidth) / DEFAULT_MAP_CONFIG.cellSize) + margin;
    const minY = Math.floor(viewport.panY / DEFAULT_MAP_CONFIG.cellSize) - margin;
    const maxY = Math.ceil((viewport.panY + window.innerHeight) / DEFAULT_MAP_CONFIG.cellSize) + margin;
    
    // Verificar si la posición está dentro de los límites
    return position.x >= minX && position.x <= maxX && position.y >= minY && position.y <= maxY;
  };
  
  // Filtrar vehículos por tipo, estado y visibilidad en el viewport
  const filteredVehicles = filters.showVehicles ? 
    data.vehicles.filter(v => 
      filters.vehicleTypes.includes(v.type) &&
      filters.vehicleStatuses.includes(v.status) &&
      isInViewport(v.position)
    ) : [];
  
  // Filtrar otras entidades
  return {
    vehicles: filteredVehicles,
    plants: filters.showPlants ? data.plants.filter(p => isInViewport(p.position)) : [],
    tanks: filters.showTanks ? data.tanks.filter(t => isInViewport(t.position)) : [],
    clients: filters.showClients ? data.clients.filter(c => isInViewport(c.position)) : [],
    refuelStations: filters.showRefuelStations ? data.refuelStations.filter(r => isInViewport(r.position)) : [],
    
    // Filtrar rutas que tienen al menos un punto dentro del viewport
    routes: filters.showRoutes ? 
      data.routes.filter(r => 
        filters.routeTypes.includes(r.type) &&
        r.path.some(p => isInViewport(p))
      ) : [],
    
    // Filtrar bloqueos visibles y por severidad
    blockages: filters.showBlockages ? 
      data.blockages.filter(b => 
        filters.blockageSeverities.includes(b.severity) &&
        isInViewport(b.from) && isInViewport(b.to)
      ) : [],
    
    breakdowns: filters.showBreakdowns ? data.breakdowns.filter(b => isInViewport(b.position)) : [],
    maintenances: filters.showMaintenances ? data.maintenances.filter(m => m.location && isInViewport(m.location)) : [],
    
    // Mantener órdenes y timestamp
    orders: data.orders,
    lastUpdated: data.lastUpdated,
  };
}

// Animation utilities
export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

export function lerpPosition(
  start: GridPosition,
  end: GridPosition,
  factor: number
): GridPosition {
  return {
    x: lerp(start.x, end.x, factor),
    y: lerp(start.y, end.y, factor),
  };
}

// Validation utilities
export function validateMapData(data: any): data is MapState {
  return (
    Array.isArray(data.vehicles) &&
    Array.isArray(data.plants) &&
    Array.isArray(data.tanks) &&
    Array.isArray(data.clients) &&
    Array.isArray(data.refuelStations) &&
    Array.isArray(data.routes) &&
    Array.isArray(data.blockages) &&
    Array.isArray(data.breakdowns) &&
    Array.isArray(data.maintenances) &&
    Array.isArray(data.orders)
  );
}

// Statistics utilities
export function calculateMapStatistics(data: MapState) {
  return {
    totalVehicles: data.vehicles.length,
    activeVehicles: data.vehicles.filter(v => v.status !== 'idle').length,
    averageFuelLevel: data.vehicles.reduce((sum, v) => sum + v.fuelLevel, 0) / data.vehicles.length,
    totalOrders: data.orders.length,
    completedOrders: data.orders.filter(o => o.status === 'delivered').length,
    pendingOrders: data.orders.filter(o => o.status === 'pending').length,
    activeBlockages: data.blockages.filter(b => b.status === 'active').length,
    activeBreakdowns: data.breakdowns.filter(b => b.status !== 'resolved').length,
    scheduledMaintenances: data.maintenances.filter(m => m.status === 'scheduled').length,
    totalTankCapacity: data.tanks.reduce((sum, t) => sum + t.capacity, 0),
    currentTankLevel: data.tanks.reduce((sum, t) => sum + t.currentLevel, 0),
  };
}