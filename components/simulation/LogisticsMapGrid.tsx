import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  Play,
  Pause,
  Square,
  Truck,
  AlertTriangle,
  MapPin,
  Clock,
  TrendingUp,
  Zap,
  Shield,
  Target,
  Route,
  Bell,
  Wrench,
} from "lucide-react";

// Types for raw order data from database
interface RawOrderData {
  id: string;
  idpedido: string;
  fecha: string;
  cliente_id: string;
  cantidad: number;
  direccion?: string;
  latitud?: number;
  longitud?: number;
  [key: string]: unknown;
}

// Configuración del mapa mejorada
const MAP_CONFIG = {
  width: 70,
  height: 50,
  cellSize: 15,
};

// Almacenes con mejores configuraciones
const WAREHOUSES = {
  central: {
    x: 12,
    y: 8,
    name: "Hub Central",
    type: "central",
    capacity: Infinity,
    currentLevel: Infinity,
  },
  norte: {
    x: 42,
    y: 42,
    name: "Centro Norte",
    type: "distribution",
    capacity: 2000,
    currentLevel: 1200,
  },
  este: {
    x: 63,
    y: 3,
    name: "Centro Este",
    type: "distribution",
    capacity: 1500,
    currentLevel: 800,
  },
} as const;

// Tipos de vehículos mejorados
const VEHICLE_TYPES = {
  MINI: {
    color: "#e67e22",
    size: 0.7,
    speed: 0.8,
    capacity: 8,
    count: 6,
    fuelCapacity: 60,
    fuelEfficiency: 0.03,
    maintenanceCost: 50,
  },
  STANDARD: {
    color: "#3498db",
    size: 1.0,
    speed: 0.6,
    capacity: 20,
    count: 8,
    fuelCapacity: 100,
    fuelEfficiency: 0.05,
    maintenanceCost: 80,
  },
  LARGE: {
    color: "#2ecc71",
    size: 1.3,
    speed: 0.4,
    capacity: 35,
    count: 4,
    fuelCapacity: 150,
    fuelEfficiency: 0.08,
    maintenanceCost: 120,
  },
  MEGA: {
    color: "#9b59b6",
    size: 1.6,
    speed: 0.3,
    capacity: 50,
    count: 2,
    fuelCapacity: 200,
    fuelEfficiency: 0.12,
    maintenanceCost: 200,
  },
} as const;

// Types mejorados
interface Position {
  x: number;
  y: number;
}

interface Vehicle {
  id: string;
  type: string;
  position: Position;
  target: Position;
  status: string;
  currentLoad: number;
  fuelLevel: number;
  fuelCapacity: number;
  maintenanceLevel: number;
  totalDeliveries: number;
  assignedOrders: string[];
  lastMaintenance: number;
  path: Position[];
  currentPathIndex: number;
  color: string;
  size: number;
  speed: number;
  capacity: number;
  fuelEfficiency: number;
  maintenanceCost: number;
  totalDistance: number;
  totalRevenue: number;
  averageDeliveryTime: number;
  currentRoute: string[];
  routeProgress: number;
}

interface Order {
  id: string;
  origin: Position & { name: string };
  destination: Position & { name: string };
  quantity: number;
  priority: "low" | "medium" | "high" | "urgent";
  status: string;
  createdAt: number;
  assignedVehicle: string | null;
  completedAt?: number;
  pickupTime?: number;
  deliveryTime?: number;
  revenue: number;
  timeWindow: { start: number; end: number };
}

interface Alert {
  id: string;
  type: "warning" | "error" | "info";
  message: string;
  timestamp: number;
  vehicleId?: string;
}

interface Blockage {
  id: string;
  start: Position;
  end: Position;
  type: "horizontal" | "vertical";
  severity: "low" | "medium" | "high";
  reason: string;
  duration: number;
  trafficLevel: number;
}

// Algoritmo A* mejorado para pathfinding
class AStarPathfinder {
  private map: { width: number; height: number };
  private blockages: Blockage[];
  private trafficMatrix: number[][];

  constructor(map: { width: number; height: number }, blockages: Blockage[]) {
    this.map = map;
    this.blockages = blockages;
    this.trafficMatrix = this.generateTrafficMatrix();
  }

  private generateTrafficMatrix(): number[][] {
    const matrix: number[][] = [];
    for (let x = 0; x < this.map.width; x++) {
      matrix[x] = [];
      for (let y = 0; y < this.map.height; y++) {
        // Tráfico base aleatorio + tráfico cerca de almacenes
        let traffic = Math.random() * 0.3;

        // Más tráfico cerca de almacenes
        Object.values(WAREHOUSES).forEach((warehouse) => {
          const distance = Math.sqrt(
            Math.pow(x - warehouse.x, 2) + Math.pow(y - warehouse.y, 2)
          );
          if (distance < 8) {
            traffic += (8 - distance) * 0.1;
          }
        });

        matrix[x][y] = Math.min(traffic, 1.0);
      }
    }
    return matrix;
  }

  private isBlocked(x: number, y: number): boolean {
    if (x < 0 || x >= this.map.width || y < 0 || y >= this.map.height) {
      return true;
    }

    return this.blockages.some((blockage) => {
      if (blockage.type === "horizontal") {
        return (
          y === blockage.start.y && x >= blockage.start.x && x <= blockage.end.x
        );
      } else {
        return (
          x === blockage.start.x && y >= blockage.start.y && y <= blockage.end.y
        );
      }
    });
  }

  private getCost(x: number, y: number): number {
    if (this.isBlocked(x, y)) return Infinity;

    // Costo base + tráfico
    const trafficCost = this.trafficMatrix[x]?.[y] || 0;
    return 1 + trafficCost;
  }

  private heuristic(a: Position, b: Position): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  findPath(start: Position, end: Position): Position[] {
    const startNode = { x: Math.round(start.x), y: Math.round(start.y) };
    const endNode = { x: Math.round(end.x), y: Math.round(end.y) };

    if (startNode.x === endNode.x && startNode.y === endNode.y) {
      return [];
    }

    const openSet = [
      { ...startNode, g: 0, h: this.heuristic(startNode, endNode), f: 0 },
    ];
    const closedSet = new Set<string>();
    const cameFrom = new Map<string, Position>();

    openSet[0].f = openSet[0].g + openSet[0].h;

    while (openSet.length > 0) {
      // Encontrar el nodo con menor f
      let currentIndex = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[currentIndex].f) {
          currentIndex = i;
        }
      }

      const current = openSet.splice(currentIndex, 1)[0];
      const currentKey = `${current.x},${current.y}`;

      if (current.x === endNode.x && current.y === endNode.y) {
        // Reconstruir path
        const path: Position[] = [];
        let temp: Position | undefined = { x: current.x, y: current.y };

        while (temp) {
          path.unshift(temp);
          temp = cameFrom.get(`${temp.x},${temp.y}`);
        }

        return path.slice(1); // Excluir posición inicial
      }

      closedSet.add(currentKey);

      // Explorar vecinos - SOLO movimiento horizontal y vertical (sin diagonales)
      const neighbors = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 },
      ];

      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;

        if (closedSet.has(neighborKey)) continue;

        const cost = this.getCost(neighbor.x, neighbor.y);
        if (cost === Infinity) continue;

        // Solo movimiento perpendicular (sin diagonales)
        const tentativeG = current.g + cost;

        let existingNode = openSet.find(
          (n) => n.x === neighbor.x && n.y === neighbor.y
        );

        if (!existingNode) {
          const h = this.heuristic(neighbor, endNode);
          existingNode = {
            ...neighbor,
            g: tentativeG,
            h: h,
            f: tentativeG + h,
          };
          openSet.push(existingNode);
          cameFrom.set(neighborKey, { x: current.x, y: current.y });
        } else if (tentativeG < existingNode.g) {
          existingNode.g = tentativeG;
          existingNode.f = existingNode.g + existingNode.h;
          cameFrom.set(neighborKey, { x: current.x, y: current.y });
        }
      }
    }

    return []; // No se encontró path
  }
}

// Generador de bloqueos dinámicos mejorado
const generateAdvancedBlockages = (): Blockage[] => {
  const blockages: Blockage[] = [];

  // Bloqueos permanentes (construcción)
  for (let i = 0; i < 6; i++) {
    const x = Math.floor(Math.random() * (MAP_CONFIG.width - 15)) + 5;
    const y = Math.floor(Math.random() * (MAP_CONFIG.height - 15)) + 5;
    const length = Math.floor(Math.random() * 4) + 3;
    const isHorizontal = Math.random() > 0.5;

    blockages.push({
      id: `permanent-${i}`,
      start: { x, y },
      end: {
        x: isHorizontal ? x + length : x,
        y: isHorizontal ? y : y + length,
      },
      type: isHorizontal ? "horizontal" : "vertical",
      severity: "high", // Solo severidad alta
      reason: "Construcción permanente",
      duration: Infinity,
      trafficLevel: 0.9,
    });
  }

  // Bloqueos temporales (accidentes, eventos)
  for (let i = 0; i < 4; i++) {
    const x = Math.floor(Math.random() * (MAP_CONFIG.width - 10)) + 5;
    const y = Math.floor(Math.random() * (MAP_CONFIG.height - 10)) + 5;
    const length = Math.floor(Math.random() * 3) + 2;
    const isHorizontal = Math.random() > 0.5;

    blockages.push({
      id: `temporary-${i}`,
      start: { x, y },
      end: {
        x: isHorizontal ? x + length : x,
        y: isHorizontal ? y : y + length,
      },
      type: isHorizontal ? "horizontal" : "vertical",
      severity: "high", // Solo severidad alta
      reason: "Accidente",
      duration: 300000 + Math.random() * 600000, // 5-15 minutos
      trafficLevel: Math.random() * 0.7 + 0.3,
    });
  }

  return blockages;
};

// Hook principal mejorado
const useAdvancedSimulation = (simulationData?: {
  type: string;
  date?: string;
  orders?: Order[];
  originalOrders?: RawOrderData[];
  dataSource?: string;
  totalOrders?: number;
} | null) => {
  const [isRunning, setIsRunning] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [warehouses] = useState(WAREHOUSES);
  const [blockages, setBlockages] = useState<Blockage[]>(
    generateAdvancedBlockages()
  );
  const [trails, setTrails] = useState(
    new Map<string, (Position & { timestamp: number })[]>()
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [pathfinder, setPathfinder] = useState<AStarPathfinder | null>(null);
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    completedOrders: 0,
    failedOrders: 0,
    totalDeliveries: 0,
    averageDeliveryTime: 0,
    vehicleUtilization: 0,
    totalRevenue: 0,
    fuelCosts: 0,
    maintenanceCosts: 0,
    onTimeDeliveries: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const timeRef = useRef(0);

  // Inicializar pathfinder
  useEffect(() => {
    setPathfinder(new AStarPathfinder(MAP_CONFIG, blockages));
  }, [blockages]);

  // Función para agregar alertas
  const addAlert = useCallback(
    (
      type: "warning" | "error" | "info",
      message: string,
      vehicleId?: string
    ) => {
      const alert: Alert = {
        id: `alert-${Date.now()}-${Math.random()}`,
        type,
        message,
        timestamp: Date.now(),
        vehicleId,
      };

      setAlerts((prev) => [alert, ...prev.slice(0, 9)]); // Mantener solo las últimas 10 alertas
    },
    []
  );

  // Asignación inteligente de vehículos mejorada
  const intelligentVehicleAssignment = useCallback(() => {
    if (!pathfinder) return;

    setOrders((prevOrders) => {
      const updatedOrders = [...prevOrders];

      setVehicles((prevVehicles) => {
        const updatedVehicles = [...prevVehicles];

        const availableVehicles = updatedVehicles.filter(
          (v) =>
            v.status === "idle" && v.maintenanceLevel > 30 && v.fuelLevel > 20
        );

        const pendingOrders = updatedOrders
          .filter((o) => o.status === "pending")
          .sort((a, b) => {
            // Priorizar por urgencia, luego por tiempo de ventana
            const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
            if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
              return priorityWeight[b.priority] - priorityWeight[a.priority];
            }
            return a.timeWindow.end - b.timeWindow.end;
          });

        pendingOrders.forEach((order) => {
          // Validar que la orden no esté asignada o completada
          if (order.status !== "pending") return;

          // Encontrar el mejor vehículo considerando múltiples factores
          const suitableVehicles = availableVehicles.filter(
            (v) => v.capacity >= order.quantity && v.assignedOrders.length === 0
          );

          if (suitableVehicles.length === 0) return;

          // Calcular score para cada vehículo
          const vehicleScores = suitableVehicles.map((vehicle) => {
            const distanceToPickup = Math.sqrt(
              Math.pow(order.origin.x - vehicle.position.x, 2) +
                Math.pow(order.origin.y - vehicle.position.y, 2)
            );

            const capacityUtilization = order.quantity / vehicle.capacity;
            const fuelLevel = vehicle.fuelLevel / 100;
            const maintenanceLevel = vehicle.maintenanceLevel / 100;

            // Score basado en distancia, eficiencia y estado del vehículo
            const score =
              (1 / (distanceToPickup + 1)) * 0.4 +
              capacityUtilization * 0.3 +
              fuelLevel * 0.15 +
              maintenanceLevel * 0.15;

            return { vehicle, score, distanceToPickup };
          });

          // Seleccionar el vehículo con mejor score
          vehicleScores.sort((a, b) => b.score - a.score);
          const bestMatch = vehicleScores[0];

          if (bestMatch) {
            const vehicleIndex = updatedVehicles.findIndex(
              (v) => v.id === bestMatch.vehicle.id
            );
            const orderIndex = updatedOrders.findIndex(
              (o) => o.id === order.id
            );

            if (vehicleIndex !== -1 && orderIndex !== -1) {
              const path = pathfinder.findPath(
                bestMatch.vehicle.position,
                order.origin
              );

              updatedVehicles[vehicleIndex] = {
                ...bestMatch.vehicle,
                status: "picking_up",
                assignedOrders: [order.id],
                target: order.origin,
                path: path,
                currentPathIndex: 0,
                routeProgress: 0,
              };

              updatedOrders[orderIndex] = {
                ...order,
                status: "assigned",
                assignedVehicle: bestMatch.vehicle.id,
              };

              // Remover de disponibles
              const availableIndex = availableVehicles.findIndex(
                (v) => v.id === bestMatch.vehicle.id
              );
              if (availableIndex !== -1) {
                availableVehicles.splice(availableIndex, 1);
              }

              addAlert(
                "info",
                `Vehículo ${bestMatch.vehicle.id} asignado a orden ${order.id}`,
                bestMatch.vehicle.id
              );
            }
          }
        });

        return updatedVehicles;
      });

      return updatedOrders;
    });
  }, [pathfinder, addAlert]);

  // Generar vehículos con mejores configuraciones
  const generateAdvancedVehicles = useCallback((): Vehicle[] => {
    const vehicleList: Vehicle[] = [];
    let globalId = 1;

    Object.entries(VEHICLE_TYPES).forEach(([type, config]) => {
      for (let i = 0; i < config.count; i++) {
        vehicleList.push({
          id: `${type}-${String(globalId).padStart(3, "0")}`,
          type,
          position: {
            x: WAREHOUSES.central.x,
            y: WAREHOUSES.central.y,
          },
          target: { x: WAREHOUSES.central.x, y: WAREHOUSES.central.y },
          status: "idle",
          currentLoad: 0,
          fuelLevel: config.fuelCapacity,
          maintenanceLevel: 100,
          totalDeliveries: 0,
          assignedOrders: [],
          lastMaintenance: Date.now(),
          path: [],
          currentPathIndex: 0,
          totalDistance: 0,
          totalRevenue: 0,
          averageDeliveryTime: 0,
          currentRoute: [],
          routeProgress: 0,
          ...config,
        });
        globalId++;
      }
    });

    return vehicleList;
  }, []);

  // Generar órdenes más realistas - SIMPLIFICADO SIN TIPOS DE CLIENTE
  const generateAdvancedOrders = useCallback(() => {
    // Si tenemos datos de simulación reales, usarlos en lugar de generar aleatorios
    if (simulationData?.orders && simulationData.orders.length > 0) {
      // Solo procesar pedidos reales si no los hemos procesado antes
      if (orders.length === 0 && simulationData.dataSource === 'database') {
        console.log('Loading real orders from database:', simulationData.orders.length);
        setOrders(simulationData.orders);
        return;
      }
      // Si ya tenemos pedidos reales cargados, NO generar más automáticamente
      // La simulación se limita únicamente a los pedidos reales
      return;
    }

    // Generación aleatoria original (fallback) - SOLO si no hay datos reales
    if (!simulationData || simulationData.dataSource !== 'database') {
      if (Math.random() < 0.6) {
      // Generar origen y destino evitando almacenes
      let originX: number = 0;
      let originY: number = 0;
      let destinationX: number = 0;
      let destinationY: number = 0;

      do {
        originX = Math.floor(Math.random() * (MAP_CONFIG.width - 10)) + 5;
        originY = Math.floor(Math.random() * (MAP_CONFIG.height - 10)) + 5;
      } while (
        Object.values(WAREHOUSES).some(
          (w) => Math.abs(originX - w.x) < 4 && Math.abs(originY - w.y) < 4
        )
      );

      do {
        destinationX = Math.floor(Math.random() * (MAP_CONFIG.width - 10)) + 5;
        destinationY = Math.floor(Math.random() * (MAP_CONFIG.height - 10)) + 5;
      } while (
        Object.values(WAREHOUSES).some(
          (w) =>
            Math.abs(destinationX - w.x) < 4 && Math.abs(destinationY - w.y) < 4
        ) ||
        (Math.abs(destinationX - originX) < 8 &&
          Math.abs(destinationY - originY) < 8)
      );

      const distance = Math.sqrt(
        Math.pow(destinationX - originX, 2) +
          Math.pow(destinationY - originY, 2)
      );
      const quantity = Math.floor(Math.random() * 25) + 5;

      // Prioridad aleatoria simplificada
      const priorities = ["low", "medium", "high", "urgent"] as const;
      const priority = priorities[Math.floor(Math.random() * priorities.length)];

      // Calcular revenue basado en distancia y cantidad (tarifa fija)
      const baseRate = 10; // Tarifa única para todos los clientes
      const revenue = Math.round((distance * 0.5 + quantity * 2) * baseRate) / 10;

      // Ventana de tiempo para la entrega
      const now = Date.now();
      const windowStart =
        now +
        (priority === "urgent" ? 60000 : priority === "high" ? 300000 : 600000);
      const windowDuration =
        priority === "urgent"
          ? 900000
          : priority === "high"
          ? 1800000
          : 3600000;

      const newOrder: Order = {
        id: `ORD-${String(Date.now()).slice(-6)}`,
        origin: {
          x: originX,
          y: originY,
          name: `Origen ${originX},${originY}`,
        },
        destination: {
          x: destinationX,
          y: destinationY,
          name: `Destino ${destinationX},${destinationY}`,
        },
        quantity,
        priority,
        status: "pending",
        createdAt: now,
        assignedVehicle: null,
        revenue,
        timeWindow: { start: windowStart, end: windowStart + windowDuration },
      };

      setOrders((prev) => [...prev, newOrder]);
      }
    }
  }, [simulationData, orders.length]);

  // Actualización de vehículos mejorada
  const updateAdvancedVehicles = useCallback(() => {
    if (!pathfinder) return;

    setVehicles((prevVehicles) => {
      return prevVehicles.map((vehicle) => {
        const newVehicle = { ...vehicle };

        // Consumo de combustible basado en carga y eficiencia
        const loadFactor = 1 + (vehicle.currentLoad / vehicle.capacity) * 0.5;
        const fuelConsumption = vehicle.fuelEfficiency * loadFactor;
        newVehicle.fuelLevel = Math.max(0, vehicle.fuelLevel - fuelConsumption);

        // Desgaste de mantenimiento
        const maintenanceDecay = vehicle.status === "idle" ? 0.01 : 0.03;
        newVehicle.maintenanceLevel = Math.max(
          0,
          vehicle.maintenanceLevel - maintenanceDecay
        );

        // Verificar necesidad de combustible
        if (
          newVehicle.fuelLevel < 20 &&
          newVehicle.status !== "refueling" &&
          newVehicle.status !== "maintenance"
        ) {
          // Encuentra el almacén más cercano
          const warehouses = Object.values(WAREHOUSES);
          let nearestWarehouse = warehouses[0];
          let minDistance = Math.sqrt(
            Math.pow(warehouses[0].x - newVehicle.position.x, 2) +
              Math.pow(warehouses[0].y - newVehicle.position.y, 2)
          );

          for (const warehouse of warehouses) {
            const distance = Math.sqrt(
              Math.pow(warehouse.x - newVehicle.position.x, 2) +
                Math.pow(warehouse.y - newVehicle.position.y, 2)
            );
            if (distance < minDistance) {
              minDistance = distance;
              nearestWarehouse = warehouse;
            }
          }

          if (nearestWarehouse) {
            newVehicle.status = "refueling";
            newVehicle.target = { x: nearestWarehouse.x, y: nearestWarehouse.y };
            newVehicle.path = pathfinder.findPath(
              newVehicle.position,
              newVehicle.target
            );
            newVehicle.currentPathIndex = 0;
            addAlert(
              "warning",
              `Vehículo ${vehicle.id} necesita combustible`,
              vehicle.id
            );
          }
        }

        // Si el vehículo está en un almacén, recargar combustible
        if (newVehicle.status === "refueling") {
          const warehouse = Object.values(WAREHOUSES).find(
            (w) =>
              Math.abs(w.x - newVehicle.position.x) < 2 &&
              Math.abs(w.y - newVehicle.position.y) < 2
          );
          if (warehouse) {
            newVehicle.fuelLevel = newVehicle.fuelCapacity;
            newVehicle.status = "idle";
          }
        }

        // Verificar necesidad de mantenimiento
        if (
          newVehicle.maintenanceLevel < 20 &&
          newVehicle.status !== "maintenance"
        ) {
          newVehicle.status = "maintenance";
          newVehicle.target = WAREHOUSES.central;
          newVehicle.path = pathfinder.findPath(
            newVehicle.position,
            WAREHOUSES.central
          );
          newVehicle.currentPathIndex = 0;
          newVehicle.assignedOrders = [];
          addAlert(
            "warning",
            `Vehículo ${vehicle.id} requiere mantenimiento`,
            vehicle.id
          );
        }

        // Averías aleatorias pero más raras
        if (
          Math.random() < 0.00005 &&
          newVehicle.status !== "maintenance" &&
          newVehicle.status !== "breakdown"
        ) {
          newVehicle.status = "breakdown";
          newVehicle.target = WAREHOUSES.central;
          newVehicle.path = pathfinder.findPath(
            newVehicle.position,
            WAREHOUSES.central
          );
          newVehicle.currentPathIndex = 0;
          addAlert(
            "error",
            `¡Vehículo ${vehicle.id} se ha averiado!`,
            vehicle.id
          );
        }

        // Lógica de movimiento mejorada
        if (
          [
            "picking_up",
            "delivering",
            "returning",
            "maintenance",
            "breakdown",
            "refueling",
          ].includes(newVehicle.status)
        ) {
          const distanceToTarget = Math.sqrt(
            Math.pow(newVehicle.target.x - newVehicle.position.x, 2) +
              Math.pow(newVehicle.target.y - newVehicle.position.y, 2)
          );

          if (distanceToTarget < 1.2) {
            // Llegó al destino - manejar según el estado
            if (newVehicle.status === "picking_up") {
              const currentOrder = orders.find(
                (o) => o.id === newVehicle.assignedOrders[0]
              );
              if (currentOrder) {
                newVehicle.status = "delivering";
                newVehicle.target = currentOrder.destination;
                newVehicle.currentLoad = currentOrder.quantity;
                newVehicle.path = pathfinder.findPath(
                  newVehicle.position,
                  currentOrder.destination
                );
                newVehicle.currentPathIndex = 0;

                setOrders((prev) =>
                  prev.map((order) =>
                    order.id === newVehicle.assignedOrders[0]
                      ? {
                          ...order,
                          status: "in_transit",
                          pickupTime: Date.now(),
                        }
                      : order
                  )
                );
              }
            } else if (newVehicle.status === "delivering") {
              const currentOrder = orders.find(
                (o) => o.id === newVehicle.assignedOrders[0]
              );
              newVehicle.status = "returning";
              newVehicle.target = WAREHOUSES.central;
              newVehicle.currentLoad = 0;
              newVehicle.totalDeliveries++;
              newVehicle.path = pathfinder.findPath(
                newVehicle.position,
                WAREHOUSES.central
              );
              newVehicle.currentPathIndex = 0;

              if (currentOrder) {
                newVehicle.totalRevenue += currentOrder.revenue;
                const deliveryTime = Date.now() - currentOrder.createdAt;
                newVehicle.averageDeliveryTime =
                  (newVehicle.averageDeliveryTime *
                    (newVehicle.totalDeliveries - 1) +
                    deliveryTime) /
                  newVehicle.totalDeliveries;

                setOrders((prev) =>
                  prev.map((order) =>
                    order.id === newVehicle.assignedOrders[0]
                      ? {
                          ...order,
                          status: "completed",
                          completedAt: Date.now(),
                          deliveryTime: Date.now(),
                        }
                      : order
                  )
                );

                addAlert(
                  "info",
                  `Orden ${currentOrder.id} completada por vehículo ${vehicle.id}`,
                  vehicle.id
                );
              }
            } else if (newVehicle.status === "refueling") {
              const warehouse = Object.values(WAREHOUSES).find(
                (w) =>
                  Math.abs(w.x - newVehicle.position.x) < 2 &&
                  Math.abs(w.y - newVehicle.position.y) < 2
              );
              if (warehouse) {
                newVehicle.fuelLevel = newVehicle.fuelCapacity;
                const refuelCost = (newVehicle.fuelCapacity - vehicle.fuelLevel) * 1.5;
                setStatistics((prev) => ({
                  ...prev,
                  fuelCosts: prev.fuelCosts + refuelCost,
                }));
              }
              newVehicle.status = "returning";
              newVehicle.target = WAREHOUSES.central;
              newVehicle.path = pathfinder.findPath(
                newVehicle.position,
                WAREHOUSES.central
              );
              newVehicle.currentPathIndex = 0;
            } else if (
              ["returning", "maintenance", "breakdown"].includes(
                newVehicle.status
              )
            ) {
              newVehicle.status = "idle";
              newVehicle.position = {
                x: WAREHOUSES.central.x,
                y: WAREHOUSES.central.y,
              };
              newVehicle.assignedOrders = [];
              newVehicle.path = [];
              newVehicle.currentPathIndex = 0;

              if (vehicle.status === "maintenance") {
                newVehicle.maintenanceLevel = 100;
                newVehicle.lastMaintenance = Date.now();
                setStatistics((prev) => ({
                  ...prev,
                  maintenanceCosts:
                    prev.maintenanceCosts + vehicle.maintenanceCost,
                }));
              }

              if (vehicle.status === "breakdown") {
                newVehicle.fuelLevel = newVehicle.fuelCapacity;
                newVehicle.maintenanceLevel = 100;
                setStatistics((prev) => ({
                  ...prev,
                  maintenanceCosts:
                    prev.maintenanceCosts + vehicle.maintenanceCost * 2,
                }));
              }
            }
          } else {
            // Mover hacia el objetivo usando el path
            if (
              newVehicle.path.length > 0 &&
              newVehicle.currentPathIndex < newVehicle.path.length
            ) {
              const nextPoint = newVehicle.path[newVehicle.currentPathIndex];
              const distanceToNextPoint = Math.sqrt(
                Math.pow(nextPoint.x - newVehicle.position.x, 2) +
                  Math.pow(nextPoint.y - newVehicle.position.y, 2)
              );

              if (distanceToNextPoint < 0.3) {
                newVehicle.position = { x: nextPoint.x, y: nextPoint.y };
                newVehicle.currentPathIndex++;
                newVehicle.totalDistance += 1;
              } else {
                const dx = nextPoint.x - newVehicle.position.x;
                const dy = nextPoint.y - newVehicle.position.y;

                if (Math.abs(dx) > Math.abs(dy)) {
                  const moveDirection = dx > 0 ? 1 : -1;
                  newVehicle.position.x +=
                    moveDirection * Math.min(newVehicle.speed, Math.abs(dx));
                } else if (Math.abs(dy) > 0.1) {
                  const moveDirection = dy > 0 ? 1 : -1;
                  newVehicle.position.y +=
                    moveDirection * Math.min(newVehicle.speed, Math.abs(dy));
                }

                newVehicle.totalDistance += newVehicle.speed;
              }
            } else {
              newVehicle.path = pathfinder.findPath(
                newVehicle.position,
                newVehicle.target
              );
              newVehicle.currentPathIndex = 0;
            }

            // Actualizar rastro
            if (newVehicle.status !== "idle") {
              const lastTrail = trails.get(newVehicle.id);
              const lastPoint =
                lastTrail && lastTrail.length > 0
                  ? lastTrail[lastTrail.length - 1]
                  : null;

              if (
                !lastPoint ||
                Math.abs(lastPoint.x - newVehicle.position.x) > 0.8 ||
                Math.abs(lastPoint.y - newVehicle.position.y) > 0.8
              ) {
                setTrails((prevTrails) => {
                  const vehicleTrail = prevTrails.get(newVehicle.id) || [];
                  const newTrail = [
                    ...vehicleTrail,
                    { ...newVehicle.position, timestamp: Date.now() },
                  ];
                  const filteredTrail = newTrail.slice(-25);

                  const updatedTrails = new Map(prevTrails);
                  updatedTrails.set(newVehicle.id, filteredTrail);
                  return updatedTrails;
                });
              }
            } else {
              setTrails((prevTrails) => {
                const updatedTrails = new Map(prevTrails);
                updatedTrails.delete(newVehicle.id);
                return updatedTrails;
              });
            }
          }
        }

        return newVehicle;
      });
    });
  }, [pathfinder, orders, trails, addAlert]);

  // Función para crear órdenes manualmente
  const createManualOrder = useCallback(() => {
    const originX = Math.floor(Math.random() * (MAP_CONFIG.width - 10)) + 5;
    const originY = Math.floor(Math.random() * (MAP_CONFIG.height - 10)) + 5;
    let destinationX, destinationY;
    
    do {
      destinationX = Math.floor(Math.random() * (MAP_CONFIG.width - 10)) + 5;
      destinationY = Math.floor(Math.random() * (MAP_CONFIG.height - 10)) + 5;
    } while (Math.abs(destinationX - originX) < 8 && Math.abs(destinationY - originY) < 8);

    const quantity = Math.floor(Math.random() * 25) + 5;
    const priorities = ["low", "medium", "high", "urgent"] as const;
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const distance = Math.sqrt(Math.pow(destinationX - originX, 2) + Math.pow(destinationY - originY, 2));
    const revenue = Math.round((distance * 0.5 + quantity * 2) * 10) / 10;
    
    const now = Date.now();
    const windowStart = now + (priority === "urgent" ? 60000 : priority === "high" ? 300000 : 600000);
    const windowDuration = priority === "urgent" ? 900000 : priority === "high" ? 1800000 : 3600000;

    const newOrder: Order = {
      id: `ORD-${String(Date.now()).slice(-6)}`,
      origin: { x: originX, y: originY, name: `Origen ${originX},${originY}` },
      destination: { x: destinationX, y: destinationY, name: `Destino ${destinationX},${destinationY}` },
      quantity,
      priority,
      status: "pending",
      createdAt: now,
      assignedVehicle: null,
      revenue,
      timeWindow: { start: windowStart, end: windowStart + windowDuration },
    };

    setOrders((prev) => [...prev, newOrder]);
    addAlert("info", `Nueva orden creada: ${newOrder.id}`);
  }, [addAlert]);

  // Función para crear bloqueos manualmente
  const createManualBlockage = useCallback(() => {
    const x = Math.floor(Math.random() * (MAP_CONFIG.width - 10)) + 5;
    const y = Math.floor(Math.random() * (MAP_CONFIG.height - 10)) + 5;
    const length = Math.floor(Math.random() * 4) + 3;
    const isHorizontal = Math.random() > 0.5;

    const newBlockage: Blockage = {
      id: `manual-${Date.now()}`,
      start: { x, y },
      end: {
        x: isHorizontal ? x + length : x,
        y: isHorizontal ? y : y + length,
      },
      type: isHorizontal ? "horizontal" : "vertical",
      severity: "high",
      reason: "Bloqueo manual",
      duration: 180000, // 3 minutos
      trafficLevel: 0.8,
    };

    setBlockages((prev) => [...prev, newBlockage]);
    addAlert("warning", `Nuevo bloqueo creado en (${x}, ${y})`);

    // Remover el bloqueo después de su duración
    setTimeout(() => {
      setBlockages((prev) => prev.filter(b => b.id !== newBlockage.id));
      addAlert("info", `Bloqueo en (${x}, ${y}) removido`);
    }, newBlockage.duration);
  }, [addAlert]);

  // Actualizar estadísticas mejoradas
  const updateAdvancedStatistics = useCallback(() => {
    const completedOrders = orders.filter((o) => o.status === "completed");
    const failedOrders = orders.filter((o) => o.status === "failed");
    const activeVehicles = vehicles.filter((v) => v.status !== "idle").length;

    const totalRevenue = vehicles.reduce((sum, v) => sum + v.totalRevenue, 0);

    const onTimeDeliveries = completedOrders.filter((order) => {
      return order.deliveryTime && order.deliveryTime <= order.timeWindow.end;
    }).length;

    setStatistics((prev) => ({
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      failedOrders: failedOrders.length,
      totalDeliveries: vehicles.reduce((sum, v) => sum + v.totalDeliveries, 0),
      averageDeliveryTime:
        completedOrders.length > 0
          ? completedOrders.reduce(
              (sum, o) => sum + ((o.completedAt || 0) - o.createdAt),
              0
            ) /
            completedOrders.length /
            1000
          : 0,
      vehicleUtilization:
        vehicles.length > 0
          ? Math.round((activeVehicles / vehicles.length) * 100)
          : 0,
      totalRevenue: totalRevenue,
      fuelCosts: prev.fuelCosts,
      maintenanceCosts: prev.maintenanceCosts,
      onTimeDeliveries: onTimeDeliveries,
    }));
  }, [orders, vehicles]);

  // Inicializar
  useEffect(() => {
    setVehicles(generateAdvancedVehicles());
  }, [generateAdvancedVehicles]);

  // Efecto para cargar datos de simulación al inicio
  useEffect(() => {
    if (simulationData?.orders && simulationData.orders.length > 0 && orders.length === 0) {
      console.log('Initial load of real simulation data:', simulationData.orders.length, 'orders');
      setOrders(simulationData.orders);
    }
  }, [simulationData, orders.length]);

  // Función para provocar averías manualmente en camiones específicos
  const createVehicleBreakdown = useCallback((vehicleId: string) => {
    if (!pathfinder) return;

    setVehicles((prevVehicles) => {
      return prevVehicles.map((vehicle) => {
        if (vehicle.id === vehicleId && vehicle.status !== "breakdown") {
          addAlert(
            "error",
            `¡Avería manual provocada en el vehículo ${vehicle.id}!`,
            vehicle.id
          );

          return {
            ...vehicle,
            status: "breakdown",
            target: WAREHOUSES.central,
            path: pathfinder.findPath(vehicle.position, WAREHOUSES.central),
            currentPathIndex: 0,
            assignedOrders: [], // Cancelar órdenes asignadas
          };
        }
        return vehicle;
      });
    });
  }, [pathfinder, addAlert]);

  // Función para verificar si la simulación debe detenerse automáticamente
  const checkSimulationCompletion = useCallback(() => {
    // Solo verificar si estamos usando datos reales de la base de datos
    if (simulationData?.dataSource === 'database' && orders.length > 0) {
      const now = Date.now();
      
      // Marcar pedidos expirados como fallidos
      setOrders(prevOrders => {
        return prevOrders.map(order => {
          if (order.status === 'pending' && now > order.timeWindow.end) {
            addAlert("warning", `Pedido ${order.id} expirado y marcado como fallido`);
            return { ...order, status: 'failed' };
          }
          return order;
        });
      });
      
      const completedOrders = orders.filter(order => order.status === 'completed').length;
      const failedOrders = orders.filter(order => order.status === 'failed' || (order.status === 'pending' && now > order.timeWindow.end)).length;
      const totalProcessedOrders = completedOrders + failedOrders;
      
      // Si todos los pedidos han sido procesados (completados o fallidos)
      if (totalProcessedOrders === orders.length) {
        console.log(`Simulación completada: ${completedOrders} pedidos completados, ${failedOrders} pedidos fallidos de ${orders.length} totales`);
        setIsRunning(false);
        addAlert("info", `Simulación completada. Procesados ${totalProcessedOrders}/${orders.length} pedidos reales.`);
      }
    }
  }, [simulationData, orders, addAlert]);

  // Ciclo principal mejorado
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        timeRef.current += 1;
        updateAdvancedVehicles();

        if (timeRef.current % 30 === 0) generateAdvancedOrders();
        if (timeRef.current % 15 === 0) intelligentVehicleAssignment();
        if (timeRef.current % 20 === 0) updateAdvancedStatistics();
        if (timeRef.current % 10 === 0) checkSimulationCompletion();

        if (timeRef.current % 100 === 0) {
          setAlerts((prev) =>
            prev.filter((alert) => Date.now() - alert.timestamp < 300000)
          );
        }
      }, 150);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    isRunning,
    updateAdvancedVehicles,
    generateAdvancedOrders,
    intelligentVehicleAssignment,
    updateAdvancedStatistics,
    checkSimulationCompletion,
  ]);

  const startSimulation = () => setIsRunning(true);
  const pauseSimulation = () => setIsRunning(false);
  const stopSimulation = () => {
    setIsRunning(false);
    setVehicles(generateAdvancedVehicles());
    setTrails(new Map());
    setOrders([]);
    setAlerts([]);
    setStatistics({
      totalOrders: 0,
      completedOrders: 0,
      failedOrders: 0,
      totalDeliveries: 0,
      averageDeliveryTime: 0,
      vehicleUtilization: 0,
      totalRevenue: 0,
      fuelCosts: 0,
      maintenanceCosts: 0,
      onTimeDeliveries: 0,
    });
    timeRef.current = 0;
  };

  return {
    isRunning,
    vehicles,
    warehouses,
    blockages,
    trails,
    orders,
    alerts,
    statistics,
    startSimulation,
    pauseSimulation,
    stopSimulation,
    createVehicleBreakdown,
    createManualOrder,
    createManualBlockage,
  };
};

// Props interface for simulation data
interface SimulationDataProps {
  simulationData?: {
    type: string;
    date?: string;
    orders?: Order[];
    originalOrders?: RawOrderData[];
    dataSource?: string;
    totalOrders?: number;
  } | null;
}

// Componente principal modificado para aceptar datos de simulación
const AdvancedLogisticsSimulator = ({ simulationData }: SimulationDataProps) => {
  const {
    isRunning,
    vehicles,
    warehouses,
    blockages,
    trails,
    orders,
    alerts,
    statistics,
    startSimulation,
    pauseSimulation,
    stopSimulation,
    createVehicleBreakdown,
    createManualOrder,
    createManualBlockage,
  } = useAdvancedSimulation(simulationData);

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedVehicleForBreakdown, setSelectedVehicleForBreakdown] = useState<string>("");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(()=>{
    const ws = new WebSocket("ws://localhost:8080/ws/simulation");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connection established");
      const momentoSimulacion = new Date("2025-06-20T00:00:00").toISOString();
      ws.send(JSON.stringify({ tipo: "NEXT_INTERVAL", momentoSimulacion }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Message received from WebSocket:", data);
      if(data.tipo === "NEXT_INTERVAL") {
        console.log("Next interval received:", data.momentoSimulacion);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      ws.close();
    }
  }, []);

  const sendMessage = (message: object) => {
    if(wsRef.current && wsRef.current.readyState === WebSocket.OPEN){
      wsRef.current.send(JSON.stringify(message));
    }
  };

  useEffect(()=>{
    if(isRunning){
      sendMessage({ tipo: "START_SIMULATION", momentoSimulacion: Date.now() });
    }else{
      sendMessage({ tipo: "STOP_SIMULATION", momentoSimulacion: Date.now() });
    }
  }, [isRunning]);
  // Renderizado del grid mejorado
  const renderEnhancedGrid = () => {
    const lines = [];

    // Grid principal
    for (let x = 0; x <= MAP_CONFIG.width; x += 5) {
      lines.push(
        <line
          key={`v-major-${x}`}
          x1={x * MAP_CONFIG.cellSize}
          y1={0}
          x2={x * MAP_CONFIG.cellSize}
          y2={MAP_CONFIG.height * MAP_CONFIG.cellSize}
          stroke="#7fb3d3"
          strokeWidth="1.5"
          opacity="0.8"
        />
      );
    }

    for (let y = 0; y <= MAP_CONFIG.height; y += 5) {
      lines.push(
        <line
          key={`h-major-${y}`}
          x1={0}
          y1={y * MAP_CONFIG.cellSize}
          x2={MAP_CONFIG.width * MAP_CONFIG.cellSize}
          y2={y * MAP_CONFIG.cellSize}
          stroke="#7fb3d3"
          strokeWidth="1.5"
          opacity="0.8"
        />
      );
    }

    // Grid menor
    for (let x = 0; x <= MAP_CONFIG.width; x++) {
      if (x % 5 !== 0) {
        lines.push(
          <line
            key={`v-minor-${x}`}
            x1={x * MAP_CONFIG.cellSize}
            y1={0}
            x2={x * MAP_CONFIG.cellSize}
            y2={MAP_CONFIG.height * MAP_CONFIG.cellSize}
            stroke="#b8d4e3"
            strokeWidth="0.8"
            opacity="0.6"
          />
        );
      }
    }

    for (let y = 0; y <= MAP_CONFIG.height; y++) {
      if (y % 5 !== 0) {
        lines.push(
          <line
            key={`h-minor-${y}`}
            x1={0}
            y1={y * MAP_CONFIG.cellSize}
            x2={MAP_CONFIG.width * MAP_CONFIG.cellSize}
            y2={y * MAP_CONFIG.cellSize}
            stroke="#b8d4e3"
            strokeWidth="0.8"
            opacity="0.6"
          />
        );
      }
    }

    return lines;
  };

  const renderBlockages = () => {
    return blockages.map((blockage) => {
      const x1 = blockage.start.x * MAP_CONFIG.cellSize;
      const y1 = blockage.start.y * MAP_CONFIG.cellSize;
      const x2 = blockage.end.x * MAP_CONFIG.cellSize;
      const y2 = blockage.end.y * MAP_CONFIG.cellSize;

      return (
        <g key={blockage.id}>
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#ff0000"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.8"
          />
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="4,4"
          />
        </g>
      );
    });
  };

  const renderWarehouses = () => {
    return Object.entries(warehouses).map(([key, warehouse]) => {
      const x = warehouse.x * MAP_CONFIG.cellSize;
      const y = warehouse.y * MAP_CONFIG.cellSize;
      const size = warehouse.type === "central" ? 16 : 12;

      return (
        <g key={key}>
          <rect
            x={x - size / 2}
            y={y - size / 2}
            width={size}
            height={size}
            fill={warehouse.type === "central" ? "#2c3e50" : "#34495e"}
            stroke="#fff"
            strokeWidth="2"
            rx="3"
          />
          <text
            x={x}
            y={y + 2}
            textAnchor="middle"
            fontSize="8"
            fill="#fff"
            fontWeight="bold"
          >
            🏭
          </text>
          <text
            x={x}
            y={y - size / 2 - 5}
            textAnchor="middle"
            fontSize="7"
            fill="#2c3e50"
            fontWeight="bold"
          >
            {warehouse.name}
          </text>
        </g>
      );
    });
  };

  const renderTrails = () => {
    const trailElements: React.ReactElement[] = [];

    trails.forEach((trail, vehicleId) => {
      if (trail.length < 2) return;

      const vehicle = vehicles.find((v) => v.id === vehicleId);
      if (!vehicle || vehicle.status === "idle") return;

      for (let i = 1; i < trail.length; i++) {
        const prevPoint = trail[i - 1];
        const currentPoint = trail[i];
        const age = (Date.now() - currentPoint.timestamp) / 10000;
        const opacity = Math.max(0.1, 0.6 - age);

        const x1 = prevPoint.x * MAP_CONFIG.cellSize;
        const y1 = prevPoint.y * MAP_CONFIG.cellSize;
        const x2 = currentPoint.x * MAP_CONFIG.cellSize;
        const y2 = currentPoint.y * MAP_CONFIG.cellSize;

        trailElements.push(
          <line
            key={`trail-${vehicleId}-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={vehicle.color}
            strokeWidth="2"
            strokeOpacity={opacity}
            strokeLinecap="round"
          />
        );
      }
    });

    return trailElements;
  };

  const renderOrderPoints = () => {
    const elements: React.ReactElement[] = [];

    orders
      .filter((order) =>
        ["assigned", "in_transit", "pending"].includes(order.status)
      )
      .forEach((order) => {
        const now = Date.now();
        const isUrgent = order.timeWindow.end - now < 300000;

        // Origen
        const originX = order.origin.x * MAP_CONFIG.cellSize;
        const originY = order.origin.y * MAP_CONFIG.cellSize;

        let originColor = "#3498db";
        if (order.status === "assigned") originColor = "#e67e22";
        if (order.status === "in_transit") originColor = "#95a5a6";
        if (isUrgent) originColor = "#e74c3c";

        elements.push(
          <g key={`origin-${order.id}`}>
            <circle
              cx={originX}
              cy={originY}
              r="8"
              fill={originColor}
              stroke="#fff"
              strokeWidth="2"
            />
            <text
              x={originX}
              y={originY + 2}
              textAnchor="middle"
              fontSize="8"
              fill="#fff"
              fontWeight="bold"
            >
              📦
            </text>
            {order.priority === "urgent" && (
              <circle
                cx={originX}
                cy={originY}
                r="12"
                fill="none"
                stroke="#e74c3c"
                strokeWidth="2"
                strokeDasharray="4,2"
              />
            )}
          </g>
        );

        // Destino
        const destX = order.destination.x * MAP_CONFIG.cellSize;
        const destY = order.destination.y * MAP_CONFIG.cellSize;

        let destColor = "#9b59b6";
        if (order.status === "assigned") destColor = "#e67e22";
        if (order.status === "in_transit") destColor = "#27ae60";
        if (isUrgent) destColor = "#e74c3c";

        elements.push(
          <g key={`dest-${order.id}`}>
            <circle
              cx={destX}
              cy={destY}
              r="8"
              fill={destColor}
              stroke="#fff"
              strokeWidth="2"
            />
            <text
              x={destX}
              y={destY + 2}
              textAnchor="middle"
              fontSize="8"
              fill="#fff"
              fontWeight="bold"
            >
              🏠
            </text>
          </g>
        );

        // Línea conectora
        if (order.status !== "in_transit") {
          elements.push(
            <line
              key={`connection-${order.id}`}
              x1={originX}
              y1={originY}
              x2={destX}
              y2={destY}
              stroke={isUrgent ? "#e74c3c" : "#bdc3c7"}
              strokeWidth="1"
              strokeOpacity="0.4"
              strokeDasharray="3,3"
            />
          );
        }
      });

    return elements;
  };

  const renderVehicles = () => {
    return vehicles
      .filter((vehicle) => vehicle.status !== "idle")
      .map((vehicle) => {
        const x = vehicle.position.x * MAP_CONFIG.cellSize;
        const y = vehicle.position.y * MAP_CONFIG.cellSize;
        const size = 5 * vehicle.size;

        let statusColor = vehicle.color;
        if (vehicle.status === "breakdown") statusColor = "#c0392b";
        if (vehicle.status === "maintenance") statusColor = "#8e44ad";
        if (vehicle.status === "refueling") statusColor = "#f39c12";

        return (
          <g key={vehicle.id}>
            <circle cx={x + 1} cy={y + 1} r={size} fill="#000" opacity="0.2" />

            <circle
              cx={x}
              cy={y}
              r={size}
              fill={statusColor}
              stroke="#fff"
              strokeWidth="2"
              style={{ cursor: "pointer" }}
              onClick={() => setSelectedVehicle(vehicle)}
            />

            {vehicle.currentLoad > 0 && (
              <circle
                cx={x}
                cy={y}
                r={size + 3}
                fill="none"
                stroke="#f39c12"
                strokeWidth="2"
                strokeOpacity="0.7"
              />
            )}

            <text
              x={x}
              y={y + 1}
              textAnchor="middle"
              fontSize="6"
              fill="#fff"
              fontWeight="bold"
            >
              🚛
            </text>

            {vehicle.status === "breakdown" && (
              <text x={x + 8} y={y - 8} fontSize="12">
                ⚠️
              </text>
            )}
            {vehicle.status === "maintenance" && (
              <text x={x + 8} y={y - 8} fontSize="12">
                🔧
              </text>
            )}
            {vehicle.status === "refueling" && (
              <text x={x + 8} y={y - 8} fontSize="12">
                ⛽
              </text>
            )}

            {vehicle.fuelLevel < 30 && (
              <rect
                x={x - size}
                y={y + size + 3}
                width={size * 2}
                height="2"
                fill="#e74c3c"
                opacity="0.8"
              />
            )}

            {vehicle.target && vehicle.status !== "idle" && (
              <g>
                {(() => {
                  const currentX = vehicle.position.x * MAP_CONFIG.cellSize;
                  const currentY = vehicle.position.y * MAP_CONFIG.cellSize;
                  const targetX = vehicle.target.x * MAP_CONFIG.cellSize;
                  const targetY = vehicle.target.y * MAP_CONFIG.cellSize;

                  return (
                    <>
                      <line
                        x1={currentX}
                        y1={currentY}
                        x2={targetX}
                        y2={currentY}
                        stroke={vehicle.color}
                        strokeWidth="1"
                        strokeOpacity="0.6"
                        strokeDasharray="8,4"
                      />
                      <line
                        x1={targetX}
                        y1={currentY}
                        x2={targetX}
                        y2={targetY}
                        stroke={vehicle.color}
                        strokeWidth="1"
                        strokeOpacity="0.6"
                        strokeDasharray="8,4"
                      />
                    </>
                  );
                })()}
              </g>
            )}

            {selectedVehicle?.id === vehicle.id && vehicle.path.length > 0 && (
              <g>
                {vehicle.path.map((point, index) => (
                  <circle
                    key={`path-${index}`}
                    cx={point.x * MAP_CONFIG.cellSize}
                    cy={point.y * MAP_CONFIG.cellSize}
                    r="2"
                    fill={vehicle.color}
                    opacity="0.5"
                  />
                ))}
              </g>
            )}
          </g>
        );
      });
  };

  const getStatusCounts = () => {
    const counts: Record<string, number> = {};
    vehicles.forEach((vehicle) => {
      if (vehicle.status !== "idle") {
        counts[vehicle.status] = (counts[vehicle.status] || 0) + 1;
      }
    });

    const idleCount = vehicles.filter((v) => v.status === "idle").length;
    if (idleCount > 0) {
      counts["disponibles"] = idleCount;
    }

    return counts;
  };

  const statusCounts = getStatusCounts();

  // Función para manejar la provocación de averías
  const handleBreakdownVehicle = () => {
    if (selectedVehicleForBreakdown) {
      createVehicleBreakdown(selectedVehicleForBreakdown);
      setSelectedVehicleForBreakdown("");
    }
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Área Principal del Mapa */}
      <div className="flex-1 flex flex-col">
        {/* Header con controles */}
        <div className="h-16 bg-white border-b shadow-sm p-3">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-800">
                Sistema de Logística GLP
              </h1>
              <Badge
                variant={isRunning ? "default" : "outline"}
                className="flex items-center gap-1"
              >
                {isRunning ? (
                  <Zap className="h-3 w-3" />
                ) : (
                  <Square className="h-3 w-3" />
                )}
                {isRunning ? "En Ejecución" : "Detenido"}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={startSimulation}
                disabled={isRunning}
              >
                <Play className="h-4 w-4 mr-1" />
                Iniciar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={pauseSimulation}
                disabled={!isRunning}
              >
                <Pause className="h-4 w-4 mr-1" />
                Pausar
              </Button>
              <Button size="sm" variant="outline" onClick={stopSimulation}>
                <Square className="h-4 w-4 mr-1" />
                Detener
              </Button>
            </div>
          </div>
        </div>

        {/* Área del mapa */}
        <div className="flex-1 p-2">
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              <div className="w-full h-full overflow-auto bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border flex items-center justify-center">
                <div className="min-w-max min-h-max">
                  <svg
                    width={MAP_CONFIG.width * MAP_CONFIG.cellSize}
                    height={MAP_CONFIG.height * MAP_CONFIG.cellSize}
                    className="block"
                  >
                    {renderEnhancedGrid()}
                    {renderBlockages()}
                    {renderTrails()}
                    {renderWarehouses()}
                    {renderOrderPoints()}
                    {renderVehicles()}
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Panel lateral derecho mejorado */}
      <div className="w-96 bg-white border-l shadow-lg flex flex-col">
        {/* Alertas */}
        {alerts.length > 0 && (
          <div className="p-3 border-b bg-yellow-50">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                Alertas Recientes
              </span>
            </div>
            <div className="max-h-20 overflow-y-auto space-y-1">
              {alerts.slice(0, 3).map((alert) => (
                <Alert key={alert.id} className="py-1">
                  <AlertDescription className="text-xs">
                    {alert.message}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Dashboard de estadísticas */}
        <div className="p-4 border-b">
          <Tabs defaultValue="metrics" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="metrics">Métricas</TabsTrigger>
              <TabsTrigger value="fleet">Flota</TabsTrigger>
              <TabsTrigger value="orders">Órdenes</TabsTrigger>
              <TabsTrigger value="control">Control</TabsTrigger>
            </TabsList>

            <TabsContent value="metrics" className="mt-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <Card className="p-3">
                  <div className="flex items-center justify-between">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-lg font-bold text-green-600">
                      ${statistics.totalRevenue.toFixed(0)}
                    </span>
                  </div>
                  <div className="text-gray-600 mt-1">Ingresos Totales</div>
                </Card>

                <Card className="p-3">
                  <div className="flex items-center justify-between">
                    <Clock className="h-4 w-4 text-purple-600" />
                    <span className="text-lg font-bold text-purple-600">
                      {statistics.averageDeliveryTime.toFixed(0)}s
                    </span>
                  </div>
                  <div className="text-gray-600 mt-1">T. Promedio</div>
                </Card>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2">
                <div className="flex justify-between text-xs">
                  <span>Entregas a tiempo:</span>
                  <Badge variant="outline">
                    {statistics.onTimeDeliveries}/{statistics.completedOrders}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Costos combustible:</span>
                  <span className="text-red-600">
                    ${statistics.fuelCosts.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Costos mantenimiento:</span>
                  <span className="text-red-600">
                    ${statistics.maintenanceCosts.toFixed(0)}
                  </span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="fleet" className="mt-3">
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <div
                      key={status}
                      className="p-2 bg-gray-50 rounded text-center"
                    >
                      <div className="capitalize font-medium text-gray-700">
                        {status}
                      </div>
                      <Badge variant="outline" className="mt-1">
                        {count}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="mt-3 p-3 bg-blue-50 rounded">
                  <div className="text-sm font-medium mb-2">
                    Tipos de Vehículo
                  </div>
                  {Object.entries(VEHICLE_TYPES).map(([type, config]) => (
                    <div
                      key={type}
                      className="flex justify-between items-center text-xs mb-1"
                    >
                      <span className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: config.color }}
                        ></div>
                        {type}
                      </span>
                      <span>{config.count} unidades</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-green-50 rounded">
                  <div className="text-sm font-medium mb-2">
                    Utilización de Flota
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full flex items-center justify-center"
                      style={{ width: `${statistics.vehicleUtilization}%` }}
                    >
                      <span className="text-xs text-white font-bold">
                        {statistics.vehicleUtilization}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="orders" className="mt-3">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-blue-50 rounded text-center">
                    <div className="text-xl font-bold text-blue-600">
                      {statistics.totalOrders}
                    </div>
                    <div className="text-gray-600">Total</div>
                  </div>
                  <div className="p-2 bg-green-50 rounded text-center">
                    <div className="text-xl font-bold text-green-600">
                      {statistics.completedOrders}
                    </div>
                    <div className="text-gray-600">Completadas</div>
                  </div>
                </div>

                <div className="space-y-2">
                  {["pending", "assigned", "in_transit"].map((status) => {
                    const count = orders.filter(
                      (o) => o.status === status
                    ).length;
                    const colors = {
                      pending: "bg-yellow-100 text-yellow-800",
                      assigned: "bg-blue-100 text-blue-800",
                      in_transit: "bg-green-100 text-green-800",
                    };

                    return (
                      <div
                        key={status}
                        className={`p-2 rounded ${
                          colors[status as keyof typeof colors]
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="capitalize text-sm font-medium">
                            {status.replace("_", " ")}
                          </span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>            {/* NUEVA PESTAÑA DE CONTROL */}
            <TabsContent value="control" className="mt-3">
              <div className="space-y-4">
                {/* Sección de Creación Manual de Órdenes */}
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Generar Orden
                    </span>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="default"
                    onClick={createManualOrder}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Target className="h-3 w-3 mr-1" />
                    Crear Orden Aleatoria
                  </Button>
                  
                  <div className="text-xs text-gray-500 mt-2">
                    Genera una nueva orden con origen y destino aleatorios.
                  </div>
                </Card>

                {/* Sección de Creación Manual de Bloqueos */}
                <Card className="p-4 bg-orange-50 border-orange-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Route className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">
                      Crear Bloqueo
                    </span>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={createManualBlockage}
                    className="w-full border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white"
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    Crear Bloqueo Temporal
                  </Button>
                  
                  <div className="text-xs text-gray-500 mt-2">
                    Crea un bloqueo temporal de 3 minutos en una posición aleatoria.
                  </div>
                </Card>

                {/* Sección de Averías */}
                <Card className="p-4 bg-red-50 border-red-200">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">
                      Provocar Avería
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">
                        Seleccionar Vehículo:
                      </label>
                      <select 
                        value={selectedVehicleForBreakdown} 
                        onChange={(e) => setSelectedVehicleForBreakdown(e.target.value)}
                        className="w-full h-8 text-xs border border-gray-300 rounded px-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Elegir vehículo...</option>
                        {vehicles
                          .filter(v => v.status !== "breakdown")
                          .map((vehicle) => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.id} - {vehicle.status}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleBreakdownVehicle}
                      disabled={!selectedVehicleForBreakdown}
                      className="w-full"
                    >
                      <Wrench className="h-3 w-3 mr-1" />
                      Provocar Avería
                    </Button>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-2">
                    El vehículo seleccionado será enviado al centro de 
                    mantenimiento para reparación.
                  </div>
                </Card>

                <Card className="p-4 bg-blue-50 border-blue-200">
                  <div className="text-sm font-medium text-blue-800 mb-2">
                    Vehículos Activos
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {vehicles
                      .filter(v => v.status !== "idle")
                      .map((vehicle) => (
                      <div key={vehicle.id} className="text-xs flex justify-between">
                        <span>{vehicle.id}</span>
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          {vehicle.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Panel de vehículo seleccionado */}
        {selectedVehicle ? (
          <div className="flex-1 p-4 overflow-y-auto">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Vehículo {selectedVehicle.id}
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedVehicle(null)}
                  >
                    ×
                  </Button>
                               </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Estado:</span>
                      <Badge variant="outline" className="ml-2">
                        {selectedVehicle.status}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-600">Tipo:</span>
                      <span className="ml-2 font-medium">
                        {selectedVehicle.type}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Combustible</span>
                        <span>{Math.round(selectedVehicle.fuelLevel)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            selectedVehicle.fuelLevel > 50
                              ? "bg-green-500"
                              : selectedVehicle.fuelLevel > 20
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${selectedVehicle.fuelLevel}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Mantenimiento</span>
                        <span>
                          {Math.round(selectedVehicle.maintenanceLevel)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                         
                          className={`h-2 rounded-full ${
                            selectedVehicle.maintenanceLevel > 50
                              ? "bg-green-500"
                              : selectedVehicle.maintenanceLevel > 20
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width: `${selectedVehicle.maintenanceLevel}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Carga</span>
                        <span>
                          {selectedVehicle.currentLoad}/
                          {selectedVehicle.capacity}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{
                            width: `${
                              (selectedVehicle.currentLoad /
                                selectedVehicle.capacity) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-2 bg-blue-50 rounded">
                      <div className="text-xs text-gray-600">Entregas</div>
                      <div className="font-bold text-blue-600">
                        {selectedVehicle.totalDeliveries}
                      </div>
                    </div>
                    <div className="p-2 bg-green-50 rounded">
                      <div className="text-xs text-gray-600">Ingresos</div>
                      <div className="font-bold text-green-600">
                        ${selectedVehicle.totalRevenue.toFixed(0)}
                      </div>
                    </div>
                    <div className="p-2 bg-purple-50 rounded">
                      <div className="text-xs text-gray-600">Distancia</div>
                      <div className="font-bold text-purple-600">
                        {selectedVehicle.totalDistance.toFixed(0)}km
                      </div>
                    </div>
                    <div className="p-2 bg-orange-50 rounded">
                      <div className="text-xs text-gray-600">T. Entrega</div>
                      <div className="font-bold text-orange-600">
                        {selectedVehicle.averageDeliveryTime.toFixed(0)}s
                      </div>
                    </div>
                  </div>

                  {selectedVehicle.assignedOrders.length > 0 && (
                    <div className="p-3 bg-yellow-50 rounded">
                      <div className="text-sm font-medium mb-2">
                        Órdenes Asignadas
                      </div>
                      {selectedVehicle.assignedOrders.map((orderId) => {
                        const order = orders.find((o) => o.id === orderId);
                        if (!order) return null;

                        return (
                          <div
                            key={orderId}
                            className="text-xs text-gray-700 mb-1"
                          >
                            <div className="font-medium">{orderId}</div>
                            <div>
                              {selectedVehicle.status === "picking_up" &&
                                "📦 Recogiendo"}
                              {selectedVehicle.status === "delivering" &&
                                "🚚 Entregando"}
                              {selectedVehicle.status === "returning" &&
                                "🔄 Regresando"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-sm font-medium mb-1">
                      Posición Actual
                    </div>
                    <div className="text-xs text-gray-600">
                      X: {Math.round(selectedVehicle.position.x)}, Y:{" "}
                      {Math.round(selectedVehicle.position.y)}
                    </div>
                    {selectedVehicle.target &&
                      selectedVehicle.status !== "idle" && (
                        <div className="text-xs text-gray-600 mt-1">
                          Destino: X: {Math.round(selectedVehicle.target.x)}, Y:{" "}
                          {Math.round(selectedVehicle.target.y)}
                        </div>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex-1 p-4 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Truck className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Selecciona un vehículo en el mapa</p>
              <p className="text-xs text-gray-400 mt-1">
                para ver información detallada
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
// comentario para evitar error de importación y conflictos

export default AdvancedLogisticsSimulator;