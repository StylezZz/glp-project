// types/map.ts

export interface GridPosition {
  x: number;
  y: number;
}

export interface MapConfig {
  width: number;
  height: number;
  cellSize: number;
}

export interface BaseEntity {
  id: string;
  position: GridPosition;
  name?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle extends BaseEntity {
  type: 'TA' | 'TB' | 'TC' | 'TD'; // 4 tipos de camiones según especificación
  capacity: number;
  currentLoad: number;
  fuelLevel: number;
  driver?: string;
  route?: Route;
  destination?: GridPosition;
  speed: number; // cells per second
  maintenanceSchedule?: {
    lastMaintenance: string;
    nextMaintenance: string;
    hoursUntilMaintenance: number;
  };
  status: 'idle' | 'delivering' | 'returning' | 'maintenance' | 'refueling' | 'broken';
  // Propiedades para visualización
  color?: string; // Color personalizado del camión
  size?: number;  // Tamaño relativo (0.5 - 1.5)
  // Propiedades específicas para los tipos de camiones
  grossWeight?: number; // Peso bruto (Tara)
  glpCapacity?: number; // Capacidad de GLP en m3
  glpWeight?: number; // Peso de carga GLP
  combinedWeight?: number; // Peso combinado
}

export interface Plant extends BaseEntity {
  capacity: number;
  currentLevel: number;
  productionRate: number; // per hour
  status: 'operational' | 'maintenance' | 'offline';
}

export interface Tank extends BaseEntity {
  capacity: number;
  currentLevel: number;
  refillRate: number; // per hour
  lastRefill: string;
  nextScheduledRefill?: string;
  status: 'operational' | 'low' | 'critical' | 'maintenance';
}

export interface Client extends BaseEntity {
  demand: number; // m³
  priority: 'low' | 'medium' | 'high' | 'critical';
  lastDelivery?: string;
  nextDelivery?: string;
  contractType: 'residential' | 'commercial' | 'industrial';
  status: 'active' | 'pending' | 'served' | 'overdue';
}

export interface RefuelStation extends BaseEntity {
  fuelCapacity: number;
  currentFuelLevel: number;
  serviceTime: number; // minutes
  status: 'operational' | 'busy' | 'maintenance';
}

export interface Route {
  id: string;
  path: GridPosition[];
  distance: number; // km
  estimatedTime: number; // minutes
  type: 'supply' | 'delivery' | 'return' | 'maintenance';
  priority: number;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
}

export interface Blockage {
  id: string;
  from: GridPosition;
  to: GridPosition;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration: number; // minutes
  startTime: string;
  endTime?: string;
  affectedRoutes: string[];
  status: 'active' | 'resolved' | 'scheduled';
}

export interface Breakdown {
  id: string;
  vehicleId: string;
  position: GridPosition;
  type: 'mechanical' | 'electrical' | 'tire' | 'fuel' | 'other';
  severity: 'minor' | 'major' | 'critical';
  description: string;
  reportedAt: string;
  estimatedRepairTime: number; // minutes
  technicianAssigned?: string;
  status: 'reported' | 'diagnosed' | 'repairing' | 'resolved';
}

export interface Maintenance {
  id: string;
  vehicleId: string;
  type: 'preventive' | 'corrective' | 'emergency';
  scheduledDate: string;
  estimatedDuration: number; // hours
  description: string;
  location?: GridPosition;
  technicianAssigned?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface Order {
  id: string;
  clientId: string;
  vehicleId?: string;
  quantity: number; // m³
  priority: 'low' | 'medium' | 'high' | 'emergency';
  requestedDate: string;
  deliveryWindow: {
    start: string;
    end: string;
  };
  actualDeliveryTime?: string;
  route?: Route;
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'failed' | 'cancelled';
}

export interface MapState {
  vehicles: Vehicle[];
  plants: Plant[];
  tanks: Tank[];
  clients: Client[];
  refuelStations: RefuelStation[];
  routes: Route[];
  blockages: Blockage[];
  breakdowns: Breakdown[];
  maintenances: Maintenance[];
  orders: Order[];
  lastUpdated: string;
}

export interface MapFilters {
  showVehicles: boolean;
  showPlants: boolean;
  showTanks: boolean;
  showClients: boolean;
  showRefuelStations: boolean;
  showRoutes: boolean;
  showBlockages: boolean;
  showBreakdowns: boolean;
  showMaintenances: boolean;
  vehicleTypes: Vehicle['type'][];
  vehicleStatuses: Vehicle['status'][];
  routeTypes: Route['type'][];
  blockageSeverities: Blockage['severity'][];
}

export interface MapEventHandlers {
  onVehicleClick?: (vehicle: Vehicle) => void;
  onClientClick?: (client: Client) => void;
  onTankClick?: (tank: Tank) => void;
  onPlantClick?: (plant: Plant) => void;
  onRouteClick?: (route: Route) => void;
  onBlockageClick?: (blockage: Blockage) => void;
  onBreakdownClick?: (breakdown: Breakdown) => void;
  onCellClick?: (position: GridPosition) => void;
  onCellHover?: (position: GridPosition) => void;
}

export interface ViewportState {
  zoom: number;
  panX: number;
  panY: number;
  centerPosition?: GridPosition;
}

export interface MapTheme {
  backgroundColor: string;
  gridColor: string;
  gridOpacity: number;
  entityColors: {
    vehicle: {
      idle: string;
      delivering: string;
      returning: string;
      maintenance: string;
      refueling: string;
      broken: string;
    };
    plant: string;
    tank: {
      operational: string;
      low: string;
      critical: string;
      maintenance: string;
    };
    client: {
      active: string;
      pending: string;
      served: string;
      overdue: string;
    };
    refuelStation: string;
    route: {
      supply: string;
      delivery: string;
      return: string;
      maintenance: string;
    };
    blockage: {
      low: string;
      medium: string;
      high: string;
      critical: string;
    };
    breakdown: {
      minor: string;
      major: string;
      critical: string;
    };
  };
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface MapDataResponse {
  vehicles: Vehicle[];
  plants: Plant[];
  tanks: Tank[];
  clients: Client[];
  refuelStations: RefuelStation[];
  routes: Route[];
  blockages: Blockage[];
  breakdowns: Breakdown[];
  maintenances: Maintenance[];
  orders: Order[];
}

export interface SimulationStatus {
  isRunning: boolean;
  currentTime: string;
  simulationSpeed: number;
  totalOrders: number;
  completedOrders: number;
  activeVehicles: number;
  activeBlockages: number;
  activeBreakdowns: number;
}