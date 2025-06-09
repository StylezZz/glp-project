import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, Pause, Square, RotateCcw, Truck, AlertTriangle, 
  Wrench, Clock, Package, BarChart3, MapPin, Fuel 
} from 'lucide-react';

// Configuración del mapa
const MAP_CONFIG = {
  width: 70,
  height: 50,
  cellSize: 15,
};

// Almacenes principales
const WAREHOUSES = {
  central: { x: 12, y: 8, name: "Almacén Central", type: "central", capacity: Infinity, currentLevel: Infinity },
  norte: { x: 42, y: 42, name: "Almacén Norte", type: "intermediate", capacity: 1000, currentLevel: 750 },
  este: { x: 63, y: 3, name: "Almacén Este", type: "intermediate", capacity: 1000, currentLevel: 500 }
};

// Tipos de vehículos
const VEHICLE_TYPES = {
  TA: { color: '#e74c3c', size: 1.2, speed: 0.8, capacity: 25, count: 2 },
  TB: { color: '#3498db', size: 1.0, speed: 1.0, capacity: 15, count: 4 },
  TC: { color: '#f39c12', size: 0.9, speed: 1.2, capacity: 10, count: 4 },
  TD: { color: '#2ecc71', size: 0.8, speed: 1.5, capacity: 5, count: 10 }
};

// Generar bloqueos aleatorios
const generateBlockages = () => {
  const blockages = [];
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
        y: isHorizontal ? y : y + length 
      },
      type: isHorizontal ? 'horizontal' : 'vertical',
      severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      reason: ['Construcción', 'Accidente', 'Mantenimiento'][Math.floor(Math.random() * 3)]
    });
  }
  
  return blockages;
};

// Hook principal de simulación
const useSimulation = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [warehouses, setWarehouses] = useState(WAREHOUSES);
  const [blockages] = useState(generateBlockages());
  const [trails, setTrails] = useState(new Map());
  const [orders, setOrders] = useState([]);
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    completedOrders: 0,
    failedOrders: 0,
    totalDeliveries: 0,
    averageDeliveryTime: 0,
    vehicleUtilization: 0
  });
  const intervalRef = useRef();
  const timeRef = useRef(0);

  // Verificar si una posición está bloqueada
  const isPositionBlocked = (pos) => {
    return blockages.some(blockage => {
      if (blockage.type === 'horizontal') {
        return pos.y === blockage.start.y && 
               pos.x >= blockage.start.x && 
               pos.x <= blockage.end.x;
      } else {
        return pos.x === blockage.start.x && 
               pos.y >= blockage.start.y && 
               pos.y <= blockage.end.y;
      }
    });
  };

  // Pathfinding ortogonal estricto con movimiento por líneas de grilla
  const calculateGridPath = (start, end) => {
    const path = [];
    const startGrid = { x: Math.round(start.x), y: Math.round(start.y) };
    const endGrid = { x: Math.round(end.x), y: Math.round(end.y) };
    
    let current = { ...startGrid };
    
    // Movimiento horizontal primero
    while (current.x !== endGrid.x) {
      if (current.x < endGrid.x) {
        current.x += 1;
      } else {
        current.x -= 1;
      }
      
      // Verificar si la posición está bloqueada
      if (!isPositionBlocked(current)) {
        path.push({ ...current });
      } else {
        // Si está bloqueado, intentar ruta alternativa
        const detour = current.y + (Math.random() > 0.5 ? 1 : -1);
        if (detour >= 0 && detour < MAP_CONFIG.height && !isPositionBlocked({ x: current.x, y: detour })) {
          current.y = detour;
          path.push({ ...current });
        }
      }
    }
    
    // Movimiento vertical después
    while (current.y !== endGrid.y) {
      if (current.y < endGrid.y) {
        current.y += 1;
      } else {
        current.y -= 1;
      }
      
      if (!isPositionBlocked(current)) {
        path.push({ ...current });
      } else {
        // Ruta alternativa horizontal
        const detour = current.x + (Math.random() > 0.5 ? 1 : -1);
        if (detour >= 0 && detour < MAP_CONFIG.width && !isPositionBlocked({ x: detour, y: current.y })) {
          current.x = detour;
          path.push({ ...current });
        }
      }
    }
    
    return path;
  };

  // Generar vehículos iniciales
  const generateInitialVehicles = () => {
    const vehicleList = [];
    let globalId = 1;
    
    Object.entries(VEHICLE_TYPES).forEach(([type, config]) => {
      for (let i = 0; i < config.count; i++) {
        vehicleList.push({
          id: `${type}-${globalId}`,
          type,
          position: { x: WAREHOUSES.central.x, y: WAREHOUSES.central.y },
          target: { x: WAREHOUSES.central.x, y: WAREHOUSES.central.y },
          status: 'idle',
          currentLoad: 0,
          fuelLevel: 100,
          maintenanceLevel: 100,
          totalDeliveries: 0,
          orderAssigned: null,
          lastMaintenance: Date.now(),
          path: [],
          currentPathIndex: 0,
          ...config
        });
        globalId++;
      }
    });
    
    return vehicleList;
  };

  // Generar órdenes periódicamente
  const generateOrders = () => {
    if (Math.random() < 0.4) {
      let destinationX, destinationY;
      
      // Generar destino aleatorio evitando almacenes
      do {
        destinationX = Math.floor(Math.random() * (MAP_CONFIG.width - 10)) + 5;
        destinationY = Math.floor(Math.random() * (MAP_CONFIG.height - 10)) + 5;
      } while (
        // Evitar almacenes (radio de 3 celdas alrededor de cada almacén)
        (Math.abs(destinationX - WAREHOUSES.central.x) < 3 && Math.abs(destinationY - WAREHOUSES.central.y) < 3) ||
        (Math.abs(destinationX - WAREHOUSES.norte.x) < 3 && Math.abs(destinationY - WAREHOUSES.norte.y) < 3) ||
        (Math.abs(destinationX - WAREHOUSES.este.x) < 3 && Math.abs(destinationY - WAREHOUSES.este.y) < 3)
      );
      
      const newOrder = {
        id: `ORDER-${Date.now()}`,
        destination: { x: destinationX, y: destinationY, name: `Cliente (${destinationX},${destinationY})` },
        quantity: Math.floor(Math.random() * 20) + 5,
        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        status: 'pending',
        createdAt: Date.now(),
        assignedVehicle: null
      };
      
      setOrders(prev => [...prev, newOrder]);
    }
  };

  // Asignar órdenes a vehículos disponibles
  const assignOrders = () => {
    setOrders(prevOrders => {
      const updatedOrders = [...prevOrders];
      
      setVehicles(prevVehicles => {
        const updatedVehicles = [...prevVehicles];
        
        const availableVehicles = updatedVehicles.filter(v => 
          v.status === 'idle' && v.maintenanceLevel > 20 && v.fuelLevel > 10
        );
        
        const pendingOrders = updatedOrders.filter(o => o.status === 'pending');
        
        pendingOrders.forEach(order => {
          const suitableVehicle = availableVehicles.find(v => 
            v.capacity >= order.quantity && !v.orderAssigned
          );
          
          if (suitableVehicle) {
            const vehicleIndex = updatedVehicles.findIndex(v => v.id === suitableVehicle.id);
            const orderIndex = updatedOrders.findIndex(o => o.id === order.id);
            
            if (vehicleIndex !== -1 && orderIndex !== -1) {
              updatedVehicles[vehicleIndex] = {
                ...suitableVehicle,
                status: 'loading',
                orderAssigned: order.id,
                target: order.destination,
                currentLoad: order.quantity
              };
              
              updatedOrders[orderIndex] = {
                ...order,
                status: 'assigned',
                assignedVehicle: suitableVehicle.id
              };
              
              // Remover de disponibles para evitar asignaciones múltiples
              const availableIndex = availableVehicles.findIndex(v => v.id === suitableVehicle.id);
              if (availableIndex !== -1) {
                availableVehicles.splice(availableIndex, 1);
              }
            }
          }
        });
        
        return updatedVehicles;
      });
      
      return updatedOrders;
    });
  };

  // Actualizar vehículos
  const updateVehicles = () => {
    setVehicles(prevVehicles => {
      return prevVehicles.map(vehicle => {
        // Desgaste y mantenimiento
        let newVehicle = {
          ...vehicle,
          fuelLevel: Math.max(0, vehicle.fuelLevel - 0.1),
          maintenanceLevel: Math.max(0, vehicle.maintenanceLevel - 0.05)
        };

        // Mantenimiento preventivo automático
        if (newVehicle.maintenanceLevel < 20 || newVehicle.fuelLevel < 10) {
          newVehicle.status = 'maintenance';
          newVehicle.target = WAREHOUSES.central;
        }

        // Averías aleatorias
        if (Math.random() < 0.0005 && newVehicle.status !== 'maintenance') {
          newVehicle.status = 'breakdown';
          newVehicle.target = WAREHOUSES.central;
        }

        // Lógica de movimiento estricto por grilla
        if (['loading', 'delivering', 'returning', 'maintenance', 'breakdown'].includes(newVehicle.status)) {
          
          // Si no tiene path o llegó al final del path, calcular nuevo path
          if (!newVehicle.path || newVehicle.path.length === 0 || newVehicle.currentPathIndex >= newVehicle.path.length) {
            const currentPos = { 
              x: Math.round(newVehicle.position.x), 
              y: Math.round(newVehicle.position.y) 
            };
            const targetPos = { 
              x: Math.round(newVehicle.target.x), 
              y: Math.round(newVehicle.target.y) 
            };
            
            if (currentPos.x !== targetPos.x || currentPos.y !== targetPos.y) {
              newVehicle.path = calculateGridPath(currentPos, targetPos);
              newVehicle.currentPathIndex = 0;
            }
          }
          
          // Verificar si llegó al destino
          const dx = newVehicle.target.x - newVehicle.position.x;
          const dy = newVehicle.target.y - newVehicle.position.y;
          
          if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
            // Llegó al destino - manejar transiciones de estado
            if (newVehicle.status === 'loading') {
              newVehicle.status = 'delivering';
              newVehicle.path = [];
              newVehicle.currentPathIndex = 0;
              setOrders(prev => prev.map(order => 
                order.id === newVehicle.orderAssigned 
                  ? { ...order, status: 'in_transit' }
                  : order
              ));
            } else if (newVehicle.status === 'delivering') {
              newVehicle.status = 'returning';
              newVehicle.target = WAREHOUSES.central;
              newVehicle.currentLoad = 0;
              newVehicle.totalDeliveries++;
              newVehicle.path = [];
              newVehicle.currentPathIndex = 0;
              
              setOrders(prev => prev.map(order => 
                order.id === newVehicle.orderAssigned 
                  ? { ...order, status: 'completed', completedAt: Date.now() }
                  : order
              ));
            } else if (newVehicle.status === 'returning' || newVehicle.status === 'maintenance' || newVehicle.status === 'breakdown') {
              newVehicle.status = 'idle';
              newVehicle.position = { x: WAREHOUSES.central.x, y: WAREHOUSES.central.y };
              newVehicle.orderAssigned = null;
              newVehicle.path = [];
              newVehicle.currentPathIndex = 0;
              
              if (newVehicle.maintenanceLevel < 20 || newVehicle.fuelLevel < 10) {
                newVehicle.fuelLevel = 100;
                newVehicle.maintenanceLevel = 100;
                newVehicle.lastMaintenance = Date.now();
              }
            }
          } else if (newVehicle.path && newVehicle.path.length > 0 && newVehicle.currentPathIndex < newVehicle.path.length) {
            // Mover hacia el siguiente punto en el path
            const nextPoint = newVehicle.path[newVehicle.currentPathIndex];
            const currentX = Math.round(newVehicle.position.x);
            const currentY = Math.round(newVehicle.position.y);
            
            // Movimiento estrictamente ortogonal hacia el siguiente punto
            if (currentX !== nextPoint.x) {
              // Mover horizontalmente
              if (currentX < nextPoint.x) {
                newVehicle.position.x = Math.min(newVehicle.position.x + (newVehicle.speed * 0.15), nextPoint.x);
              } else {
                newVehicle.position.x = Math.max(newVehicle.position.x - (newVehicle.speed * 0.15), nextPoint.x);
              }
            } else if (currentY !== nextPoint.y) {
              // Mover verticalmente
              if (currentY < nextPoint.y) {
                newVehicle.position.y = Math.min(newVehicle.position.y + (newVehicle.speed * 0.15), nextPoint.y);
              } else {
                newVehicle.position.y = Math.max(newVehicle.position.y - (newVehicle.speed * 0.15), nextPoint.y);
              }
            }
            
            // Si llegó al punto actual del path, avanzar al siguiente
            if (Math.abs(newVehicle.position.x - nextPoint.x) < 0.1 && 
                Math.abs(newVehicle.position.y - nextPoint.y) < 0.1) {
              newVehicle.position.x = nextPoint.x;
              newVehicle.position.y = nextPoint.y;
              newVehicle.currentPathIndex++;
            }

            // Actualizar rastro solo cuando se mueve
            setTrails(prevTrails => {
              const vehicleTrail = prevTrails.get(newVehicle.id) || [];
              const lastPoint = vehicleTrail[vehicleTrail.length - 1];
              
              // Solo agregar al rastro si se movió significativamente
              if (!lastPoint || 
                  Math.abs(lastPoint.x - newVehicle.position.x) > 0.5 || 
                  Math.abs(lastPoint.y - newVehicle.position.y) > 0.5) {
                const newTrail = [...vehicleTrail, { ...newVehicle.position, timestamp: Date.now() }];
                const filteredTrail = newTrail.slice(-40);
                
                const updatedTrails = new Map(prevTrails);
                updatedTrails.set(newVehicle.id, filteredTrail);
                return updatedTrails;
              }
              return prevTrails;
            });
          }
        }

        return newVehicle;
      });
    });
  };

  // Actualizar estadísticas
  const updateStatistics = () => {
    const completedOrders = orders.filter(o => o.status === 'completed');
    const failedOrders = orders.filter(o => o.status === 'failed');
    const activeVehicles = vehicles.filter(v => v.status !== 'idle').length;
    
    setStatistics({
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      failedOrders: failedOrders.length,
      totalDeliveries: vehicles.reduce((sum, v) => sum + v.totalDeliveries, 0),
      averageDeliveryTime: completedOrders.length > 0 
        ? completedOrders.reduce((sum, o) => sum + (o.completedAt - o.createdAt), 0) / completedOrders.length / 1000
        : 0,
      vehicleUtilization: Math.round((activeVehicles / vehicles.length) * 100)
    });
  };

  // Inicializar
  useEffect(() => {
    setVehicles(generateInitialVehicles());
  }, []);

  // Ciclo principal
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        timeRef.current += 1;
        updateVehicles();
        updateStatistics();
        
        if (timeRef.current % 30 === 0) generateOrders();
        if (timeRef.current % 15 === 0) assignOrders();
      }, 100);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

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
    stopSimulation
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
    stopSimulation
  } = useSimulation();

  const [selectedVehicle, setSelectedVehicle] = useState(null);

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
    return blockages.map(blockage => {
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
      const size = warehouse.type === 'central' ? 12 : 8;
      
      return (
        <g key={key}>
          <rect
            x={x - size/2}
            y={y - size/2}
            width={size}
            height={size}
            fill={warehouse.type === 'central' ? '#2c3e50' : '#34495e'}
            stroke="#fff"
            strokeWidth="1"
            rx="2"
          />
          <text
            x={x}
            y={y - size/2 - 3}
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
    const trailElements = [];
    
    trails.forEach((trail, vehicleId) => {
      if (trail.length < 2) return;
      
      const vehicle = vehicles.find(v => v.id === vehicleId);
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
            strokeOpacity={0.4}
            strokeLinecap="round"
          />
        );
      }
    });
    
    return trailElements;
  };

  const renderOrderDestinations = () => {
    return orders
      .filter(order => ['assigned', 'in_transit'].includes(order.status))
      .map(order => {
        const x = order.destination.x * MAP_CONFIG.cellSize;
        const y = order.destination.y * MAP_CONFIG.cellSize;
        
        return (
          <g key={`dest-${order.id}`}>
            <circle
              cx={x}
              cy={y}
              r="4"
              fill="#9b59b6"
              stroke="#fff"
              strokeWidth="1"
            />
            <text
              x={x}
              y={y - 8}
              textAnchor="middle"
              fontSize="7"
              fill="#9b59b6"
              fontWeight="bold"
            >
              📦
            </text>
          </g>
        );
      });
  };

  const renderVehicles = () => {
    return vehicles.map(vehicle => {
      const x = vehicle.position.x * MAP_CONFIG.cellSize;
      const y = vehicle.position.y * MAP_CONFIG.cellSize;
      const size = 4 * vehicle.size;
      
      let statusColor = vehicle.color;
      if (vehicle.status === 'breakdown') statusColor = '#c0392b';
      if (vehicle.status === 'maintenance') statusColor = '#8e44ad';
      
      return (
        <g key={vehicle.id}>
          <circle
            cx={x}
            cy={y}
            r={size}
            fill={statusColor}
            stroke="#fff"
            strokeWidth="1"
            style={{ cursor: 'pointer' }}
            onClick={() => setSelectedVehicle(vehicle)}
          />
          <text
            x={x}
            y={y + 1}
            textAnchor="middle"
            fontSize="6"
            fill="#fff"
            fontWeight="bold"
          >
            {vehicle.type}
          </text>
          {vehicle.status === 'breakdown' && (
            <text x={x + 6} y={y - 6} fontSize="8">⚠️</text>
          )}
          {vehicle.status === 'maintenance' && (
            <text x={x + 6} y={y - 6} fontSize="8">🔧</text>
          )}
        </g>
      );
    });
  };

  const getStatusCounts = () => {
    const counts = vehicles.reduce((acc, vehicle) => {
      acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
      return acc;
    }, {});
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="h-screen flex flex-col">
      {/* Panel de Control Compacto */}
      <div className="flex items-center justify-between p-2 border-b bg-white">
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={isRunning ? pauseSimulation : startSimulation}>
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="outline" onClick={stopSimulation}>
            <Square className="h-4 w-4" />
          </Button>
          <Badge variant={isRunning ? 'default' : 'outline'}>
            {isRunning ? 'Ejecutándose' : 'Detenido'}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <span>Órdenes: {statistics.completedOrders}/{statistics.totalOrders}</span>
          <span>Activos: {Object.values(statusCounts).reduce((a, b) => a + b, 0) - (statusCounts.idle || 0)}/20</span>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Mapa Principal - 75% del ancho */}
        <div className="flex-1 p-2">
          <Card className="h-full">
            <CardContent className="p-2 h-full">
              <div className="w-full h-full overflow-auto bg-gray-50 rounded-lg">
                <svg
                  width={MAP_CONFIG.width * MAP_CONFIG.cellSize}
                  height={MAP_CONFIG.height * MAP_CONFIG.cellSize}
                  className="border border-gray-300"
                  style={{ background: '#fafafa' }}
                >
                  {renderGrid()}
                  {renderBlockages()}
                  {renderTrails()}
                  {renderWarehouses()}
                  {renderOrderDestinations()}
                  {renderVehicles()}
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel de Estadísticas - 25% del ancho */}
        <div className="w-80 p-2 border-l bg-gray-50">
          <Tabs defaultValue="stats" className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stats">Stats</TabsTrigger>
              <TabsTrigger value="vehicles">Vehículos</TabsTrigger>
              <TabsTrigger value="orders">Órdenes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="stats" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Estadísticas Generales
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-blue-50 rounded">
                      <div className="font-medium">Órdenes Totales</div>
                      <div className="text-lg font-bold text-blue-600">{statistics.totalOrders}</div>
                    </div>
                    <div className="p-2 bg-green-50 rounded">
                      <div className="font-medium">Completadas</div>
                      <div className="text-lg font-bold text-green-600">{statistics.completedOrders}</div>
                    </div>
                    <div className="p-2 bg-orange-50 rounded">
                      <div className="font-medium">Entregas Total</div>
                      <div className="text-lg font-bold text-orange-600">{statistics.totalDeliveries}</div>
                    </div>
                    <div className="p-2 bg-purple-50 rounded">
                      <div className="font-medium">Utilización</div>
                      <div className="text-lg font-bold text-purple-600">{statistics.vehicleUtilization}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Estado de Flota</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs">
                    {Object.entries(statusCounts).map(([status, count]) => (
                      <div key={status} className="flex justify-between">
                        <span className="capitalize">{status}:</span>
                        <Badge variant="outline" size="sm">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="vehicles" className="mt-4">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {vehicles.map(vehicle => (
                  <Card key={vehicle.id} className="p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: vehicle.color }}
                        />
                        <span className="text-xs font-medium">{vehicle.id}</span>
                      </div>
                      <Badge variant="outline" size="sm">
                        {vehicle.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      <div>Combustible: {Math.round(vehicle.fuelLevel)}%</div>
                      <div>Mantenimiento: {Math.round(vehicle.maintenanceLevel)}%</div>
                      <div>Entregas: {vehicle.totalDeliveries}</div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="orders" className="mt-4">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {orders.slice(-10).reverse().map(order => (
                  <Card key={order.id} className="p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{order.id}</span>
                      <Badge 
                        variant={order.status === 'completed' ? 'default' : 'outline'}
                        size="sm"
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      <div>Cantidad: {order.quantity}m³</div>
                      <div>Prioridad: {order.priority}</div>
                      {order.assignedVehicle && (
                        <div>Vehículo: {order.assignedVehicle}</div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Panel de Vehículo Seleccionado */}
      {selectedVehicle && (
        <div className="absolute bottom-4 right-4 w-80">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Vehículo {selectedVehicle.id}</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => setSelectedVehicle(null)}>×</Button>
              </div>
            </CardHeader>
            <CardContent className="text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>Estado: <Badge variant="outline">{selectedVehicle.status}</Badge></div>
                <div>Tipo: {selectedVehicle.type}</div>
                <div>Combustible: {Math.round(selectedVehicle.fuelLevel)}%</div>
                <div>Mantenimiento: {Math.round(selectedVehicle.maintenanceLevel)}%</div>
                <div>Carga: {selectedVehicle.currentLoad}m³</div>
                <div>Capacidad: {selectedVehicle.capacity}m³</div>
                <div>Posición: ({Math.round(selectedVehicle.position.x)}, {Math.round(selectedVehicle.position.y)})</div>
                <div>Entregas: {selectedVehicle.totalDeliveries}</div>
              </div>
              {selectedVehicle.orderAssigned && (
                <div className="mt-2 p-2 bg-blue-50 rounded">
                  <div className="font-medium">Orden Asignada:</div>
                  <div>{selectedVehicle.orderAssigned}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LogisticsMapGrid;