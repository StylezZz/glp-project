import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Pause,
  Square,
  Truck,
} from "lucide-react";

// Configuración del mapa
const MAP_CONFIG = {
  width: 70,
  height: 50,
  cellSize: 15,
};

// Almacenes principales
const WAREHOUSES = {
  central: {
    x: 12,
    y: 8,
    name: "Almacén Central",
    type: "central",
    capacity: Infinity,
    currentLevel: Infinity,
  },
  norte: {
    x: 42,
    y: 42,
    name: "Almacén Norte",
    type: "intermediate",
    capacity: 1000,
    currentLevel: 750,
  },
  este: {
    x: 63,
    y: 3,
    name: "Almacén Este",
    type: "intermediate",
    capacity: 1000,
    currentLevel: 500,
  },
} as const;

// Tipos de vehículos
const VEHICLE_TYPES = {
  TA: { color: "#e74c3c", size: 1.2, speed: 0.1, capacity: 25, count: 2 },
  TB: { color: "#3498db", size: 1.0, speed: 0.1, capacity: 15, count: 4 },
  TC: { color: "#f39c12", size: 0.9, speed: 0.1, capacity: 10, count: 4 },
  TD: { color: "#2ecc71", size: 0.8, speed: 0.1, capacity: 5, count: 10 },
} as const;

// Types
interface Position {
  x: number;
  y: number;
}

interface Vehicle {
  id: string;
  type: string;
  position: Position;
  target: Position;
  status: string; // idle, picking_up, delivering, returning, maintenance, breakdown
  currentLoad: number;
  fuelLevel: number;
  maintenanceLevel: number;
  totalDeliveries: number;
  orderAssigned: string | null;
  lastMaintenance: number;
  path: Position[];
  currentPathIndex: number;
  color: string;
  size: number;
  speed: number;
  capacity: number;
}

interface Order {
  id: string;
  origin: Position & { name: string }; // NUEVO: Punto de recogida
  destination: Position & { name: string }; // Punto de entrega
  quantity: number;
  priority: string;
  status: string;
  createdAt: number;
  assignedVehicle: string | null;
  completedAt?: number;
}

interface Blockage {
  id: string;
  start: Position;
  end: Position;
  type: "horizontal" | "vertical";
  severity: string;
  reason: string;
}

// Generar bloqueos aleatorios
const generateBlockages = (): Blockage[] => {
  const blockages: Blockage[] = [];
  const blockageCount = 8;

  for (let i = 0; i < blockageCount; i++) {
    const x = Math.floor(Math.random() * (MAP_CONFIG.width - 10)) + 5;
    const y = Math.floor(Math.random() * (MAP_CONFIG.height - 10)) + 5;
    const length = Math.floor(Math.random() * 3) + 2;
    const isHorizontal = Math.random() > 0.5;

    blockages.push({
      id: `blockage-${i}`,
      start: { x, y },
      end: {
        x: isHorizontal ? x + length : x,
        y: isHorizontal ? y : y + length,
      },
      type: isHorizontal ? "horizontal" : "vertical",
      severity: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
      reason: ["Construcción", "Accidente", "Mantenimiento"][
        Math.floor(Math.random() * 3)
      ],
    });
  }

  return blockages;
};

// Hook principal de simulación
const useSimulation = () => {
  const [isRunning, setIsRunning] = useState(false);  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [warehouses] = useState(WAREHOUSES);
  const [blockages] = useState(generateBlockages());
  const [trails, setTrails] = useState(
    new Map<string, (Position & { timestamp: number })[]>()
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    completedOrders: 0,
    failedOrders: 0,
    totalDeliveries: 0,
    averageDeliveryTime: 0,
    vehicleUtilization: 0,
  });
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const timeRef = useRef(0);

  // Verificar si una posición está bloqueada
  const isPositionBlocked = useCallback(
    (pos: Position) => {
      return blockages.some((blockage) => {
        if (blockage.type === "horizontal") {
          return (
            pos.y === blockage.start.y &&
            pos.x >= blockage.start.x &&
            pos.x <= blockage.end.x
          );
        } else {
          return (
            pos.x === blockage.start.x &&
            pos.y >= blockage.start.y &&
            pos.y <= blockage.end.y
          );
        }
      });
    },
    [blockages]
  );

  // Pathfinding mejorado - evita bucles
  const calculatePath = useCallback(
    (start: Position, end: Position): Position[] => {
      const path: Position[] = [];
      const startGrid = { x: Math.round(start.x), y: Math.round(start.y) };
      const endGrid = { x: Math.round(end.x), y: Math.round(end.y) };

      // Si ya está en el destino, no necesita path
      if (startGrid.x === endGrid.x && startGrid.y === endGrid.y) {
        return [];
      }

      let current = { ...startGrid };
      const visited = new Set<string>();
      const maxSteps = 200; // Prevenir bucles infinitos
      let steps = 0;

      while (
        (current.x !== endGrid.x || current.y !== endGrid.y) &&
        steps < maxSteps
      ) {
        const key = `${current.x},${current.y}`;

        // Evitar revisitar posiciones
        if (visited.has(key)) {
          // Si se está repitiendo, hacer movimiento directo
          break;
        }
        visited.add(key);

        // Determinar dirección prioritaria
        const dx = endGrid.x - current.x;
        const dy = endGrid.y - current.y;

        let moved = false;

        // Movimiento horizontal primero si la distancia horizontal es mayor
        if (Math.abs(dx) >= Math.abs(dy) && dx !== 0) {
          const nextX = current.x + (dx > 0 ? 1 : -1);
          const nextPos = { x: nextX, y: current.y };

          if (
            nextX >= 0 &&
            nextX < MAP_CONFIG.width &&
            !isPositionBlocked(nextPos)
          ) {
            current.x = nextX;
            path.push({ ...current });
            moved = true;
          }
        }

        // Si no se movió horizontalmente, intentar vertical
        if (!moved && dy !== 0) {
          const nextY = current.y + (dy > 0 ? 1 : -1);
          const nextPos = { x: current.x, y: nextY };

          if (
            nextY >= 0 &&
            nextY < MAP_CONFIG.height &&
            !isPositionBlocked(nextPos)
          ) {
            current.y = nextY;
            path.push({ ...current });
            moved = true;
          }
        }

        // Si no se pudo mover en las direcciones preferidas, intentar desviación mínima
        if (!moved) {
          // Intentar movimiento alternativo
          const alternatives = [
            { x: current.x + 1, y: current.y },
            { x: current.x - 1, y: current.y },
            { x: current.x, y: current.y + 1 },
            { x: current.x, y: current.y - 1 },
          ];

          for (const alt of alternatives) {
            if (
              alt.x >= 0 &&
              alt.x < MAP_CONFIG.width &&
              alt.y >= 0 &&
              alt.y < MAP_CONFIG.height &&
              !isPositionBlocked(alt) &&
              !visited.has(`${alt.x},${alt.y}`)
            ) {
              current = alt;
              path.push({ ...current });
              moved = true;
              break;
            }
          }
        }

        // Si aún no se puede mover, salir del bucle
        if (!moved) {
          break;
        }

        steps++;
      }

      return path;
    },
    [isPositionBlocked]
  );

  // Generar vehículos iniciales
  const generateInitialVehicles = useCallback((): Vehicle[] => {
    const vehicleList: Vehicle[] = [];
    let globalId = 1;

    Object.entries(VEHICLE_TYPES).forEach(([type, config]) => {
      for (let i = 0; i < config.count; i++) {
        vehicleList.push({
          id: `${type}-${globalId}`,
          type,
          position: {
            x: WAREHOUSES.central.x,
            y: WAREHOUSES.central.y,
          },
          target: { x: WAREHOUSES.central.x, y: WAREHOUSES.central.y },
          status: "idle",
          currentLoad: 0,
          fuelLevel: 100,
          maintenanceLevel: 100,
          totalDeliveries: 0,
          orderAssigned: null,
          lastMaintenance: Date.now(),
          path: [],
          currentPathIndex: 0,
          ...config,
        });
        globalId++;
      }
    });

    return vehicleList;
  }, []);

  // Generar órdenes con origen y destino - MÁS AGRESIVO para usar más camiones
  const generateOrders = useCallback(() => {
    if (Math.random() < 0.8) {
      // Incrementado de 0.3 a 0.8 para más órdenes
      let originX: number, originY: number;
      let destinationX: number, destinationY: number;

      // Generar punto de ORIGEN aleatorio (evitando almacenes)
      do {
        originX = Math.floor(Math.random() * (MAP_CONFIG.width - 6)) + 3;
        originY = Math.floor(Math.random() * (MAP_CONFIG.height - 6)) + 3;
      } while (
        // Evitar TODOS los almacenes (central, norte, este) - radio de 3 celdas
        (Math.abs(originX - WAREHOUSES.central.x) < 3 &&
          Math.abs(originY - WAREHOUSES.central.y) < 3) ||
        (Math.abs(originX - WAREHOUSES.norte.x) < 3 &&
          Math.abs(originY - WAREHOUSES.norte.y) < 3) ||
        (Math.abs(originX - WAREHOUSES.este.x) < 3 &&
          Math.abs(originY - WAREHOUSES.este.y) < 3)
      );

      // Generar punto de DESTINO aleatorio (evitando almacenes Y el origen)
      do {
        destinationX = Math.floor(Math.random() * (MAP_CONFIG.width - 6)) + 3;
        destinationY = Math.floor(Math.random() * (MAP_CONFIG.height - 6)) + 3;
      } while (
        // Evitar almacenes
        (Math.abs(destinationX - WAREHOUSES.central.x) < 3 &&
          Math.abs(destinationY - WAREHOUSES.central.y) < 3) ||
        (Math.abs(destinationX - WAREHOUSES.norte.x) < 3 &&
          Math.abs(destinationY - WAREHOUSES.norte.y) < 3) ||
        (Math.abs(destinationX - WAREHOUSES.este.x) < 3 &&
          Math.abs(destinationY - WAREHOUSES.este.y) < 3) ||
        // Evitar que sea muy cerca del origen (mínimo 5 celdas de distancia)
        (Math.abs(destinationX - originX) < 5 &&
          Math.abs(destinationY - originY) < 5)
      );      const newOrder: Order = {
        id: `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // ID más único
        origin: {
          x: originX,
          y: originY,
          name: `Recogida (${originX},${originY})`,
        },
        destination: {
          x: destinationX,
          y: destinationY,
          name: `Entrega (${destinationX},${destinationY})`,
        },
        quantity: Math.floor(Math.random() * 15) + 3, // Cantidades más pequeñas para más órdenes
        priority: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
        status: "pending",
        createdAt: Date.now(),
        assignedVehicle: null,
      };

      setOrders((prev) => [...prev, newOrder]);
    }
  }, []);  const assignOrders = useCallback(() => {
    // Use a ref to track current state since we need both vehicles and orders
    setVehicles((currentVehicles) => {
      const availableVehicles = currentVehicles.filter(
        (v) =>
          v.status === "idle" &&
          v.maintenanceLevel > 20 &&
          v.fuelLevel > 10 &&
          !v.orderAssigned
      );

      if (availableVehicles.length === 0) return currentVehicles;

      const updatedVehicles = [...currentVehicles];

      // Update orders separately
      setOrders((currentOrders) => {
        const pendingOrders = currentOrders.filter(
          (o) => o.status === "pending" && !o.assignedVehicle
        );

        if (pendingOrders.length === 0) return currentOrders;

        console.log(`🚚 Disponibles: ${availableVehicles.length}, 📦 Pendientes: ${pendingOrders.length}`);

        const updatedOrders = [...currentOrders];
        let assignmentsMade = 0;

        // Process assignments
        for (let i = 0; i < pendingOrders.length && assignmentsMade < availableVehicles.length; i++) {
          const order = pendingOrders[i];
          const suitableVehicle = availableVehicles[assignmentsMade];

          if (suitableVehicle && suitableVehicle.capacity >= order.quantity) {
            console.log(`✅ Asignando ${order.id} → ${suitableVehicle.id}`);

            // Find indices
            const vehicleIndex = updatedVehicles.findIndex(
              (v) => v.id === suitableVehicle.id
            );
            const orderIndex = updatedOrders.findIndex(
              (o) => o.id === order.id
            );

            if (vehicleIndex !== -1 && orderIndex !== -1) {
              // Calculate path from central warehouse to pickup point
              const newPath = calculatePath(
                { x: WAREHOUSES.central.x, y: WAREHOUSES.central.y },
                order.origin
              );

              // Add some visual dispersion
              const exitOffset = {
                x: (Math.random() - 0.5) * 4,
                y: (Math.random() - 0.5) * 4,
              };

              // Update vehicle
              updatedVehicles[vehicleIndex] = {
                ...suitableVehicle,
                status: "picking_up",
                orderAssigned: order.id,
                target: order.origin,
                currentLoad: 0,
                path: newPath,
                currentPathIndex: 0,
                position: {
                  x: WAREHOUSES.central.x + exitOffset.x,
                  y: WAREHOUSES.central.y + exitOffset.y,
                },
              };

              // Update order
              updatedOrders[orderIndex] = {
                ...order,
                status: "assigned",
                assignedVehicle: suitableVehicle.id,
              };

              assignmentsMade++;
            }
          }
        }

        return updatedOrders;
      });

      return updatedVehicles;
    });
  }, [calculatePath]);

  // Actualizar vehículos
  const updateVehicles = useCallback(() => {
    setVehicles((prevVehicles) => {
      return prevVehicles.map((vehicle) => {
        const newVehicle = {
          ...vehicle,
          fuelLevel: Math.max(0, vehicle.fuelLevel - 0.05),
          maintenanceLevel: Math.max(0, vehicle.maintenanceLevel - 0.02),
        };

        // Mantenimiento automático
        if (newVehicle.maintenanceLevel < 20 || newVehicle.fuelLevel < 10) {
          if (newVehicle.status !== "maintenance") {
            newVehicle.status = "maintenance";
            newVehicle.target = WAREHOUSES.central;
            newVehicle.path = calculatePath(
              newVehicle.position,
              WAREHOUSES.central
            );
            newVehicle.currentPathIndex = 0;
            newVehicle.orderAssigned = null;
          }
        }

        // Averías aleatorias (muy raras)
        if (
          Math.random() < 0.0001 &&
          newVehicle.status !== "maintenance" &&
          newVehicle.status !== "breakdown"
        ) {
          newVehicle.status = "breakdown";
          newVehicle.target = WAREHOUSES.central;
          newVehicle.path = calculatePath(
            newVehicle.position,
            WAREHOUSES.central
          );
          newVehicle.currentPathIndex = 0;
        }

        // Movimiento principal
        if (
          [
            "picking_up",
            "delivering",
            "returning",
            "maintenance",
            "breakdown",
          ].includes(newVehicle.status)
        ) {
          // Verificar si llegó al destino
          const distanceToTarget = Math.sqrt(
            Math.pow(newVehicle.target.x - newVehicle.position.x, 2) +
              Math.pow(newVehicle.target.y - newVehicle.position.y, 2)
          );

          if (distanceToTarget < 1.0) {
            // Llegó al destino
            if (newVehicle.status === "picking_up") {
              // LLEGÓ al punto de RECOGIDA - ahora cargar y ir al destino
              const currentOrder = orders.find(
                (o) => o.id === newVehicle.orderAssigned
              );
              if (currentOrder) {
                newVehicle.status = "delivering";
                newVehicle.target = currentOrder.destination; // Ahora va al destino final
                newVehicle.currentLoad = currentOrder.quantity; // Ahora lleva la carga
                newVehicle.path = calculatePath(
                  newVehicle.position,
                  currentOrder.destination
                );
                newVehicle.currentPathIndex = 0;

                // Marcar orden como en tránsito
                setOrders((prev) =>
                  prev.map((order) =>
                    order.id === newVehicle.orderAssigned
                      ? { ...order, status: "in_transit" }
                      : order
                  )
                );
              }
            } else if (newVehicle.status === "delivering") {
              // LLEGÓ al punto de ENTREGA - orden completada, regresar al almacén
              newVehicle.status = "returning";
              newVehicle.target = WAREHOUSES.central;
              newVehicle.currentLoad = 0; // Ya no lleva carga
              newVehicle.totalDeliveries++;
              newVehicle.path = calculatePath(
                newVehicle.position,
                WAREHOUSES.central
              );
              newVehicle.currentPathIndex = 0;

              // Marcar orden como completada (entregada al cliente)
              setOrders((prev) =>
                prev.map((order) =>
                  order.id === newVehicle.orderAssigned
                    ? { ...order, status: "completed", completedAt: Date.now() }
                    : order
                )
              );
            } else if (
              newVehicle.status === "returning" ||
              newVehicle.status === "maintenance" ||
              newVehicle.status === "breakdown"
            ) {
              // Llegó de vuelta al almacén central
              newVehicle.status = "idle";
              newVehicle.position = {
                x: WAREHOUSES.central.x,
                y: WAREHOUSES.central.y,
              };
              newVehicle.orderAssigned = null;
              newVehicle.path = [];
              newVehicle.currentPathIndex = 0;

              // Restaurar combustible y mantenimiento en el almacén central
              if (newVehicle.fuelLevel < 100) {
                newVehicle.fuelLevel = 100;
              }
              if (newVehicle.maintenanceLevel < 100) {
                newVehicle.maintenanceLevel = 100;
                newVehicle.lastMaintenance = Date.now();
              }
            }
          } else {
            // Mover hacia el objetivo
            if (
              newVehicle.path.length > 0 &&
              newVehicle.currentPathIndex < newVehicle.path.length
            ) {
              const nextPoint = newVehicle.path[newVehicle.currentPathIndex];

              // Verificar si llegó al punto actual del path
              const distanceToNextPoint = Math.sqrt(
                Math.pow(nextPoint.x - newVehicle.position.x, 2) +
                  Math.pow(nextPoint.y - newVehicle.position.y, 2)
              );

              if (distanceToNextPoint < 0.5) {
                // Llegó al punto actual, avanzar al siguiente
                newVehicle.position.x = nextPoint.x;
                newVehicle.position.y = nextPoint.y;
                newVehicle.currentPathIndex++;
              } else {
                // Mover hacia el siguiente punto del path
                const dx = nextPoint.x - newVehicle.position.x;
                const dy = nextPoint.y - newVehicle.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > 0) {
                  const moveX = (dx / distance) * newVehicle.speed;
                  const moveY = (dy / distance) * newVehicle.speed;

                  newVehicle.position.x += moveX;
                  newVehicle.position.y += moveY;
                }
              }
            } else {
              // No hay path válido o se acabó, recalcular o mover directamente
              if (distanceToTarget > 2.0) {
                // Recalcular path si está muy lejos
                newVehicle.path = calculatePath(
                  newVehicle.position,
                  newVehicle.target
                );
                newVehicle.currentPathIndex = 0;
              } else {
                // Mover directamente si está cerca
                const dx = newVehicle.target.x - newVehicle.position.x;
                const dy = newVehicle.target.y - newVehicle.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > 0.1) {
                  const moveX = (dx / distance) * newVehicle.speed;
                  const moveY = (dy / distance) * newVehicle.speed;

                  newVehicle.position.x += moveX;
                  newVehicle.position.y += moveY;
                }
              }
            }

            // Actualizar rastro solo si se movió significativamente
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
                const filteredTrail = newTrail.slice(-25); // Rastro más corto para mejor rendimiento

                const updatedTrails = new Map(prevTrails);
                updatedTrails.set(newVehicle.id, filteredTrail);
                return updatedTrails;
              });
            }
          }
        }

        return newVehicle;
      });
    });
  }, [calculatePath, orders, trails]);
  // Actualizar estadísticas
  const updateStatistics = useCallback(() => {
    const completedOrders = orders.filter((o) => o.status === "completed");
    const failedOrders = orders.filter((o) => o.status === "failed");
    const activeVehicles = Array.isArray(vehicles) ? vehicles.filter((v) => v.status !== "idle").length : 0;

    setStatistics({
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      failedOrders: failedOrders.length,
      totalDeliveries: Array.isArray(vehicles) ? vehicles.reduce((sum, v) => sum + v.totalDeliveries, 0) : 0,
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
        Array.isArray(vehicles) && vehicles.length > 0
          ? Math.round((activeVehicles / vehicles.length) * 100)
          : 0,
    });
  }, [orders, vehicles]);

  // Inicializar
  useEffect(() => {
    setVehicles(generateInitialVehicles());
  }, [generateInitialVehicles]);

  // Ciclo principal mejorado
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        timeRef.current += 1;
        updateVehicles();

        if (timeRef.current % 25 === 0) generateOrders(); // Más frecuente: cada 2.5 segundos
        if (timeRef.current % 10 === 0) assignOrders(); // Muy frecuente: cada segundo
        if (timeRef.current % 15 === 0) updateStatistics(); // Regular
      }, 100);
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
    updateVehicles,
    generateOrders,
    assignOrders,
    updateStatistics,
  ]);

  const startSimulation = () => setIsRunning(true);
  const pauseSimulation = () => setIsRunning(false);
  const stopSimulation = () => {
    setIsRunning(false);
    setVehicles(generateInitialVehicles());
    setTrails(new Map());
    setOrders([]);
    timeRef.current = 0;
  };

  return {
    isRunning,
    vehicles,
    warehouses,
    blockages,
    trails,
    orders,
    statistics,
    startSimulation,
    pauseSimulation,
    stopSimulation,
  };
};

// Componente principal
const LogisticsMapGrid = () => {
  const {
    isRunning,
    vehicles,
    warehouses,
    blockages,
    trails,
    orders,
    statistics,
    startSimulation,
    pauseSimulation,
    stopSimulation,
  } = useSimulation();

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [hoveredVehicle, setHoveredVehicle] = useState<Vehicle | null>(null);
  const [showAllRoutes, setShowAllRoutes] = useState(false);
  const [showAllTrails, setShowAllTrails] = useState(true);

  // Renderizado del mapa
  const renderGrid = () => {
    const lines = [];

    for (let x = 0; x <= MAP_CONFIG.width; x++) {
      lines.push(
        <line
          key={`v-${x}`}
          x1={x * MAP_CONFIG.cellSize}
          y1={0}
          x2={x * MAP_CONFIG.cellSize}
          y2={MAP_CONFIG.height * MAP_CONFIG.cellSize}
          stroke="#e0e0e0"
          strokeWidth="0.5"
        />
      );
    }

    for (let y = 0; y <= MAP_CONFIG.height; y++) {
      lines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={y * MAP_CONFIG.cellSize}
          x2={MAP_CONFIG.width * MAP_CONFIG.cellSize}
          y2={y * MAP_CONFIG.cellSize}
          stroke="#e0e0e0"
          strokeWidth="0.5"
        />
      );
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
        <line
          key={blockage.id}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#e74c3c"
          strokeWidth="4"
          strokeLinecap="round"
        />
      );
    });
  };

  const renderWarehouses = () => {
    return Object.entries(warehouses).map(([key, warehouse]) => {
      const x = warehouse.x * MAP_CONFIG.cellSize;
      const y = warehouse.y * MAP_CONFIG.cellSize;
      const size = warehouse.type === "central" ? 12 : 8;

      return (
        <g key={key}>
          <rect
            x={x - size / 2}
            y={y - size / 2}
            width={size}
            height={size}
            fill={warehouse.type === "central" ? "#2c3e50" : "#34495e"}
            stroke="#fff"
            strokeWidth="1"
            rx="2"
          />
          <text
            x={x}
            y={y - size / 2 - 3}
            textAnchor="middle"
            fontSize="8"
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
      if (!vehicle) return;

      for (let i = 1; i < trail.length; i++) {
        const prevPoint = trail[i - 1];
        const currentPoint = trail[i];

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
            strokeOpacity={0.3}
            strokeLinecap="round"
          />
        );
      }
    });

    return trailElements;
  };
  const renderOrderRoutes = () => {
    // Solo mostrar rutas si está habilitado o si hay un vehículo seleccionado
    if (!showAllRoutes && !selectedVehicle && !hoveredVehicle) return null;

    let ordersToShow = orders.filter((order) =>
      ["assigned", "in_transit", "pending"].includes(order.status)
    );

    // Si hay un vehículo seleccionado o hover, solo mostrar su ruta
    if (selectedVehicle || hoveredVehicle) {
      const targetVehicle = selectedVehicle || hoveredVehicle;
      ordersToShow = ordersToShow.filter(
        (order) => order.assignedVehicle === targetVehicle?.id
      );
    }

    return ordersToShow.map((order) => {
      const originX = order.origin.x * MAP_CONFIG.cellSize;
      const originY = order.origin.y * MAP_CONFIG.cellSize;
      const destX = order.destination.x * MAP_CONFIG.cellSize;
      const destY = order.destination.y * MAP_CONFIG.cellSize;

      // Color de la ruta según el estado
      let routeColor = "#95a5a6"; // Gris para pendientes
      if (order.status === "assigned") routeColor = "#3498db"; // Azul para asignadas
      if (order.status === "in_transit") routeColor = "#27ae60"; // Verde para en tránsito

      // Resaltar si es del vehículo seleccionado
      const isHighlighted =
        (selectedVehicle || hoveredVehicle)?.orderAssigned === order.id;

      return (
        <g key={`route-${order.id}`}>
          {/* Línea de ruta A → B */}
          <line
            x1={originX}
            y1={originY}
            x2={destX}
            y2={destY}
            stroke={routeColor}
            strokeWidth={isHighlighted ? "4" : "2"}
            strokeOpacity={isHighlighted ? "0.9" : "0.4"}
            strokeDasharray="8,4"
          />

          {/* Flecha en el destino */}
          <polygon
            points={`${destX - 4},${destY - 8} ${destX + 4},${
              destY - 8
            } ${destX},${destY - 2}`}
            fill={routeColor}
            opacity={isHighlighted ? "1" : "0.6"}
          />
        </g>
      );
    });
  };
  const renderOrderPoints = () => {
    const ordersToShow = orders.filter((order) =>
      ["assigned", "in_transit", "pending"].includes(order.status)
    );

    // Si hay un vehículo seleccionado, resaltar sus puntos
    const highlightedOrderId = (selectedVehicle || hoveredVehicle)
      ?.orderAssigned;

    return ordersToShow.map((order) => {
      const originX = order.origin.x * MAP_CONFIG.cellSize;
      const originY = order.origin.y * MAP_CONFIG.cellSize;
      const destX = order.destination.x * MAP_CONFIG.cellSize;
      const destY = order.destination.y * MAP_CONFIG.cellSize;

      // Colores según estado
      let statusColor = "#e67e22"; // Naranja para pendientes
      if (order.status === "assigned") statusColor = "#3498db"; // Azul para asignadas
      if (order.status === "in_transit") statusColor = "#27ae60"; // Verde para en tránsito

      // Color del borde según prioridad
      const priorityColor =
        order.priority === "high"
          ? "#e74c3c"
          : order.priority === "medium"
          ? "#f39c12"
          : "#95a5a6";

      const isHighlighted = highlightedOrderId === order.id;
      const opacity =
        (!selectedVehicle && !hoveredVehicle) || isHighlighted ? 1 : 0.3;
      const radius = isHighlighted ? 10 : 8;

      return (
        <g key={`points-${order.id}`} opacity={opacity}>
          {/* PUNTO DE ORIGEN (Recogida) */}
          <circle
            cx={originX}
            cy={originY}
            r={radius}
            fill={statusColor}
            stroke="#fff"
            strokeWidth="2"
          />
          <circle
            cx={originX}
            cy={originY}
            r={radius - 2}
            fill="#fff"
            opacity="0.9"
          />
          <text
            x={originX}
            y={originY + 1}
            textAnchor="middle"
            fontSize={isHighlighted ? "10" : "8"}
            fill="#2c3e50"
            fontWeight="bold"
          >
            📦
          </text>
          {/* Etiqueta de origen - solo si está resaltado */}
          {isHighlighted && (
            <text
              x={originX}
              y={originY - 18}
              textAnchor="middle"
              fontSize="8"
              fill="#2c3e50"
              fontWeight="bold"
            >
              ORIGEN
            </text>
          )}
          {/* Borde de prioridad en origen */}
          <circle
            cx={originX}
            cy={originY}
            r={radius + 2}
            fill="none"
            stroke={priorityColor}
            strokeWidth="1.5"
            strokeDasharray={order.priority === "high" ? "2,1" : "none"}
          />

          {/* PUNTO DE DESTINO (Entrega) */}
          <circle
            cx={destX}
            cy={destY}
            r={radius}
            fill={statusColor}
            stroke="#fff"
            strokeWidth="2"
          />
          <circle
            cx={destX}
            cy={destY}
            r={radius - 2}
            fill="#fff"
            opacity="0.9"
          />
          <text
            x={destX}
            y={destY + 1}
            textAnchor="middle"
            fontSize={isHighlighted ? "10" : "8"}
            fill="#2c3e50"
            fontWeight="bold"
          >
            🏠
          </text>
          {/* Etiqueta de destino - solo si está resaltado */}
          {isHighlighted && (
            <text
              x={destX}
              y={destY - 18}
              textAnchor="middle"
              fontSize="8"
              fill="#2c3e50"
              fontWeight="bold"
            >
              DESTINO
            </text>
          )}
          {/* Borde de prioridad en destino */}
          <circle
            cx={destX}
            cy={destY}
            r={radius + 2}
            fill="none"
            stroke={priorityColor}
            strokeWidth="1.5"
            strokeDasharray={order.priority === "high" ? "2,1" : "none"}
          />
        </g>
      );
    });
  };
  const renderVehicles = () => {
    if (!Array.isArray(vehicles)) return null;
    
    return vehicles.map((vehicle) => {
      const x = vehicle.position.x * MAP_CONFIG.cellSize;
      const y = vehicle.position.y * MAP_CONFIG.cellSize;
      const baseSize = 4 * vehicle.size;

      // Tamaño más grande si está seleccionado o en hover
      const isSelected = selectedVehicle?.id === vehicle.id;
      const isHovered = hoveredVehicle?.id === vehicle.id;
      const size = isSelected || isHovered ? baseSize * 1.4 : baseSize;

      let statusColor = vehicle.color;
      if (vehicle.status === "breakdown") statusColor = "#c0392b";
      if (vehicle.status === "maintenance") statusColor = "#8e44ad";

      // Opacidad reducida si hay un vehículo seleccionado y este no es
      const opacity =
        (!selectedVehicle && !hoveredVehicle) || isSelected || isHovered
          ? 1
          : 0.4;

      return (
        <g key={vehicle.id} opacity={opacity}>
          {/* Anillo de selección */}
          {(isSelected || isHovered) && (
            <circle
              cx={x}
              cy={y}
              r={size + 4}
              fill="none"
              stroke="#ffffff"
              strokeWidth="3"
              strokeOpacity="0.9"
            />
          )}

          {/* Vehículo principal */}
          <circle
            cx={x}
            cy={y}
            r={size}
            fill={statusColor}
            stroke="#fff"
            strokeWidth="2"
            style={{ cursor: "pointer" }}
            onClick={() => setSelectedVehicle(isSelected ? null : vehicle)}
            onMouseEnter={() => setHoveredVehicle(vehicle)}
            onMouseLeave={() => setHoveredVehicle(null)}
          />

          {/* Indicador de carga si tiene carga */}
          {vehicle.currentLoad > 0 && (
            <circle
              cx={x}
              cy={y}
              r={size + 2}
              fill="none"
              stroke="#f39c12"
              strokeWidth="2"
              strokeOpacity="0.8"
            />
          )}

          {/* Texto del tipo de vehículo */}
          <text
            x={x}
            y={y + 1}
            textAnchor="middle"
            fontSize={isSelected || isHovered ? "7" : "6"}
            fill="#fff"
            fontWeight="bold"
            style={{ pointerEvents: "none" }}
          >
            {vehicle.type}
          </text>

          {/* ID del vehículo si está seleccionado */}
          {(isSelected || isHovered) && (
            <text
              x={x}
              y={y - size - 8}
              textAnchor="middle"
              fontSize="8"
              fill="#2c3e50"
              fontWeight="bold"
              style={{ pointerEvents: "none" }}
            >
              {vehicle.id}
            </text>
          )}

          {/* Indicadores de estado */}
          {vehicle.status === "breakdown" && (
            <text
              x={x + size + 2}
              y={y - size}
              fontSize="12"
              style={{ pointerEvents: "none" }}
            >
              ⚠️
            </text>
          )}
          {vehicle.status === "maintenance" && (
            <text
              x={x + size + 2}
              y={y - size}
              fontSize="12"
              style={{ pointerEvents: "none" }}
            >
              🔧
            </text>
          )}
          {vehicle.fuelLevel < 30 && vehicle.status !== "maintenance" && (
            <text
              x={x + size + 2}
              y={y + size + 8}
              fontSize="10"
              style={{ pointerEvents: "none" }}
            >
              ⛽
            </text>
          )}

          {/* Indicador de combustible bajo */}
          {vehicle.fuelLevel < 20 && (
            <circle
              cx={x}
              cy={y}
              r={size + 3}
              fill="none"
              stroke="#e74c3c"
              strokeWidth="1"
              strokeDasharray="3,2"
              strokeOpacity="0.8"
            />
          )}

          {/* Línea hacia destino actual - solo si está seleccionado o en hover */}
          {(isSelected || isHovered) &&
            ["picking_up", "delivering"].includes(vehicle.status) &&
            vehicle.target && (
              <line
                x1={x}
                y1={y}
                x2={vehicle.target.x * MAP_CONFIG.cellSize}
                y2={vehicle.target.y * MAP_CONFIG.cellSize}
                stroke={vehicle.color}
                strokeWidth="3"
                strokeOpacity="0.8"
                strokeDasharray="10,5"
                style={{ pointerEvents: "none" }}
              />
            )}
        </g>
      );
    });
  };
  const getStatusCounts = () => {
    const counts: Record<string, number> = {};
    if (Array.isArray(vehicles)) {
      vehicles.forEach((vehicle) => {
        counts[vehicle.status] = (counts[vehicle.status] || 0) + 1;
      });
    }
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="h-full flex">
      {/* Área Principal del Mapa */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-2">
          {/* Mapa Principal */}
          <Card className="h-full">
            <CardContent className="p-2 h-full">
              <div className="w-full h-full overflow-auto bg-gray-50 rounded-lg">
                <svg
                  width={MAP_CONFIG.width * MAP_CONFIG.cellSize}
                  height={MAP_CONFIG.height * MAP_CONFIG.cellSize}
                  className="border border-gray-300"
                  style={{ background: "#fafafa" }}
                >
                  {renderGrid()}
                  {renderBlockages()}
                  {renderOrderRoutes()}
                  {renderTrails()}
                  {renderWarehouses()}
                  {renderOrderPoints()}
                  {renderVehicles()}
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel de Control Inferior */}
        <div className="h-24 border-t bg-white p-2">
          <div className="flex items-center justify-center h-full gap-6">
            {/* Controles de Simulación */}
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={startSimulation}
                disabled={isRunning}
              >
                <Play className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={pauseSimulation}
                disabled={!isRunning}
              >
                <Pause className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={stopSimulation}>
                <Square className="h-4 w-4" />
              </Button>
              <Badge variant={isRunning ? "default" : "outline"}>
                {isRunning ? "Ejecutándose" : "Detenido"}
              </Badge>
            </div>

            {/* Controles de Visualización */}
            <div className="flex items-center gap-3 border-l pl-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showRoutes"
                  checked={showAllRoutes}
                  onChange={(e) => setShowAllRoutes(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="showRoutes" className="text-sm">
                  Mostrar todas las rutas
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showTrails"
                  checked={showAllTrails}
                  onChange={(e) => setShowAllTrails(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="showTrails" className="text-sm">
                  Mostrar todos los rastros
                </label>
              </div>
            </div>

            {/* Información rápida */}
            <div className="flex items-center gap-4 border-l pl-6 text-xs">
              <div className="text-center">
                <div className="font-medium text-gray-600">Activos</div>
                <div className="text-lg font-bold text-green-600">
                  {vehicles.filter((v) => v.status !== "idle").length}
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-600">Órdenes</div>
                <div className="text-lg font-bold text-blue-600">
                  {orders.filter((o) => o.status !== "completed").length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra Lateral Derecha */}
      <div className="w-96 border-l bg-white flex flex-col">
        {/* Panel de Estadísticas */}
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold mb-3">
            Estadísticas de Simulación
          </h3>
          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stats">Stats</TabsTrigger>
              <TabsTrigger value="vehicles">Vehículos</TabsTrigger>
              <TabsTrigger value="orders">Órdenes</TabsTrigger>
            </TabsList>

            <TabsContent value="stats" className="mt-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-blue-50 rounded text-center">
                  <div className="font-medium text-gray-600">Órdenes</div>
                  <div className="text-xl font-bold text-blue-600">
                    {statistics.totalOrders}
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded text-center">
                  <div className="font-medium text-gray-600">Completadas</div>
                  <div className="text-xl font-bold text-green-600">
                    {statistics.completedOrders}
                  </div>
                </div>
                <div className="p-3 bg-orange-50 rounded text-center">
                  <div className="font-medium text-gray-600">Entregas</div>
                  <div className="text-xl font-bold text-orange-600">
                    {statistics.totalDeliveries}
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded text-center">
                  <div className="font-medium text-gray-600">Utilización</div>
                  <div className="text-xl font-bold text-purple-600">
                    {statistics.vehicleUtilization}%
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="vehicles" className="mt-3">
              <div className="max-h-32 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <div
                      key={status}
                      className="p-2 bg-gray-50 rounded text-center"
                    >
                      <div className="capitalize text-xs font-medium text-gray-600">
                        {status}
                      </div>
                      <Badge variant="outline" className="mt-1">
                        {count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="orders" className="mt-3">
              <div className="text-xs text-gray-600 space-y-2">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="font-medium mb-2">Resumen de Órdenes</div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <Badge variant="outline">{orders.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>🟠 Pendientes:</span>
                      <Badge variant="outline">
                        {orders.filter((o) => o.status === "pending").length}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>🟣 Asignadas:</span>
                      <Badge variant="outline">
                        {orders.filter((o) => o.status === "assigned").length}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>🟢 En tránsito:</span>
                      <Badge variant="outline">
                        {orders.filter((o) => o.status === "in_transit").length}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>✅ Completadas:</span>
                      <Badge variant="outline">
                        {orders.filter((o) => o.status === "completed").length}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Leyenda de rutas */}
                <div className="p-2 bg-green-50 rounded">
                  <div className="font-medium mb-1">Rutas A → B:</div>
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <span>📦</span>
                      <span>Punto de recogida (ORIGEN)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🏠</span>
                      <span>Punto de entrega (DESTINO)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-1 border border-gray-400"
                        style={{ borderStyle: "dashed" }}
                      ></div>
                      <span>Ruta de entrega</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full border-2 border-red-500 border-dashed"></div>
                      <span>Alta prioridad</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Panel de Vehículo Seleccionado */}
        {selectedVehicle ? (
          <div className="flex-1 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">
                Vehículo {selectedVehicle.id}
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedVehicle(null)}
              >
                ×
              </Button>
            </div>
            <Card>
              <CardContent className="p-3">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-gray-600">
                          Estado:
                        </span>
                        <Badge variant="outline" className="ml-2">
                          {selectedVehicle.status}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Tipo:</span>
                        <span className="ml-2">{selectedVehicle.type}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">
                          Combustible:
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
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
                          <span className="text-xs">
                            {Math.round(selectedVehicle.fuelLevel)}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">
                          Mantenimiento:
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
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
                          <span className="text-xs">
                            {Math.round(selectedVehicle.maintenanceLevel)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-gray-600">
                          Carga:
                        </span>
                        <span className="ml-2">
                          {selectedVehicle.currentLoad}m³
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">
                          Capacidad:
                        </span>
                        <span className="ml-2">
                          {selectedVehicle.capacity}m³
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">
                          Posición:
                        </span>
                        <span className="ml-2">
                          ({Math.round(selectedVehicle.position.x)},{" "}
                          {Math.round(selectedVehicle.position.y)})
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">
                          Entregas:
                        </span>
                        <span className="ml-2">
                          {selectedVehicle.totalDeliveries}
                        </span>
                      </div>
                    </div>
                  </div>
                  {selectedVehicle.orderAssigned && (
                    <div className="mt-3 p-2 bg-blue-50 rounded">
                      <div className="font-medium text-xs text-gray-700">
                        Orden Asignada:
                      </div>
                      <div className="text-xs text-blue-700 mt-1">
                        {selectedVehicle.orderAssigned}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Origen: (
                        {Math.round(
                          selectedVehicle.status === "picking_up"
                            ? selectedVehicle.target.x
                            : 0
                        )}
                        ,{" "}
                        {Math.round(
                          selectedVehicle.status === "picking_up"
                            ? selectedVehicle.target.y
                            : 0
                        )}
                        )
                      </div>
                      <div className="text-xs text-gray-600">
                        Destino: ({Math.round(selectedVehicle.target.x)},{" "}
                        {Math.round(selectedVehicle.target.y)})
                      </div>
                    </div>
                  )}

                  {/* Leyenda de indicadores */}
                  <div className="mt-3 p-2 bg-gray-50 rounded">
                    <div className="font-medium text-xs text-gray-700 mb-2">
                      Indicadores:
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full border-2 border-orange-400"></div>
                        <span>Con carga</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>⛽</span>
                        <span>Combustible bajo</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>🔧</span>
                        <span>En mantenimiento</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>⚠️</span>
                        <span>Averiado</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-1 border-2 border-blue-500"
                          style={{ borderStyle: "dashed" }}
                        ></div>
                        <span>Línea a objetivo actual</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex-1 p-4 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Truck className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                Selecciona un vehículo en el mapa para ver sus detalles
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogisticsMapGrid;
