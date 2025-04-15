'use client'
import React, { useRef, useEffect, useState } from 'react'

const GRID_SIZE = 20
const GRID_WIDTH = 80
const GRID_HEIGHT = 100 

// Tipos para elementos de la simulación
type Node = {
  x: number;
  y: number;
  color: string;
  type: 'plant' | 'tank' | 'client' | 'refuelStation';
  label?: string;
}

type ExtendedNode = Node & {
  info?: {
    nombre?: string;
    direccion?: string;
    demanda?: number; // m3 para clientes
    ultimaEntrega?: string;
    estadoTanque?: number; // porcentaje
    capacidad?: number; // m3 para tanques o planta
    horaRecarga?: string; // hora de recarga para tanques
  }
}

type Route = {
  from: [number, number];
  to: [number, number];
  color?: string;
  routeId?: string;
  distance?: number; // km
  estimatedTime?: number; // minutos
  type: 'supply' | 'delivery' | 'return' | 'refuel';
}

type VehicleIssue = {
  description: string;
  timestamp: string;
};

type Vehicle = {
  id: string;
  position: [number, number];
  destination: [number, number];
  progress: number; // valor entre 0 y 1
  color: string;
  capacity: number;
  currentFuel: number;
  status: 'idle' | 'delivering' | 'returning' | 'maintenance' | 'refueling';
  maintenanceSchedule?: {
    lastPreventive: string;
    nextPreventive: string;
  };
  currentLoad?: number; // carga en m³
  issues?: VehicleIssue[];
};

type Blockage = {
  from: [number, number];
  to: [number, number];
  reason: string;
  estimatedDuration: number; // minutos
  startTime: string;
  severity: 'high' | 'medium' | 'low';
};

export default function SimulationVisualizer() {
  // Nodos: Planta principal, 3 tanques intermedios, algunos clientes y estaciones de recarga
  const nodes: ExtendedNode[] = [
    {
      x: 10, y: 10,
      color: "#1E40AF",
      type: "plant",
      label: "Planta Principal",
      info: {
        nombre: "Planta Principal PLG",
        direccion: "Av. Industrial 1500, Zona Este",
        capacidad: 1000,
        estadoTanque: 98
      }
    },
    {
      x: 20, y: 20,
      color: "#047857",
      type: "tank",
      label: "Tanque Intermedio Norte",
      info: {
        nombre: "Tanque Intermedio Norte",
        direccion: "Av. Norte 450, Sector 3",
        capacidad: 160,
        estadoTanque: 75,
        horaRecarga: "12:00"
      }
    },
    {
      x: 30, y: 30,
      color: "#047857",
      type: "tank",
      label: "Tanque Intermedio Sur",
      info: {
        nombre: "Tanque Intermedio Sur",
        direccion: "Av. Sur 780, Sector 8",
        capacidad: 160,
        estadoTanque: 62,
        horaRecarga: "12:00"
      }
    },
    {
      x: 40, y: 40,
      color: "#047857",
      type: "tank",
      label: "Tanque Intermedio Este",
      info: {
        nombre: "Tanque Intermedio Este",
        direccion: "Av. Este 300, Sector 5",
        capacidad: 160,
        estadoTanque: 55,
        horaRecarga: "12:00"
      }
    },
    {
      x: 15, y: 15,
      color: "#DC2626",
      type: "client",
      label: "Cliente A",
      info: {
        nombre: "Cliente A",
        direccion: "Zona A",
        demanda: 18,
        ultimaEntrega: "2023-05-15",
        estadoTanque: 45
      }
    },
    {
      x: 25, y: 25,
      color: "#DC2626",
      type: "client",
      label: "Cliente B",
      info: {
        nombre: "Cliente B",
        direccion: "Zona B",
        demanda: 8,
        ultimaEntrega: "2023-05-14",
        estadoTanque: 30
      }
    },
    {
      x: 35, y: 35,
      color: "#F59E0B",
      type: "refuelStation",
      label: "Estación Norte"
    },
    {
      x: 45, y: 45,
      color: "#F59E0B",
      type: "refuelStation",
      label: "Estación Sur"
    },
  ];

  // Rutas en la cuadrícula (se pueden ampliar según el escenario)
  const gridRoutes: Route[] = [
    { from: [10, 10], to: [30, 10], color: "#1E40AF", routeId: "supply-1", distance: 20, type: "supply", estimatedTime: 25 },
    { from: [30, 10], to: [30, 30], color: "#1E40AF", routeId: "supply-2", distance: 20, type: "supply", estimatedTime: 25 },
    { from: [10, 10], to: [10, 60], color: "#1E40AF", routeId: "supply-3", distance: 50, type: "supply", estimatedTime: 60 },
    { from: [10, 60], to: [50, 60], color: "#1E40AF", routeId: "supply-4", distance: 40, type: "supply", estimatedTime: 50 },
    // Puedes agregar más rutas de entrega o retorno
  ];

  // Se incluyen varios vehículos en la simulación
  const vehicles: Vehicle[] = [
    { 
      id: "camion-grande-1", 
      position: [20, 25], 
      destination: [20, 20],
      progress: 0.7, 
      color: "#7E22CE", 
      capacity: 25, 
      currentFuel: 85, 
      status: 'delivering',
      currentLoad: 18, 
      maintenanceSchedule: {
        lastPreventive: "2023-03-15",
        nextPreventive: "2023-05-15"
      },
      issues: [
        { description: "Falla en la transmisión", timestamp: "2023-05-10 14:30" }
      ]
    },
    { 
      id: "camion-mediano-1", 
      position: [37, 28], 
      destination: [40, 25],
      progress: 0.4, 
      color: "#7E22CE", 
      capacity: 15, 
      currentFuel: 70, 
      status: 'delivering',
      currentLoad: 8, 
      maintenanceSchedule: {
        lastPreventive: "2023-04-01",
        nextPreventive: "2023-06-01"
      }
    },
    { 
      id: "camion-pequeno-1", 
      position: [27, 45], 
      destination: [25, 45],
      progress: 0.6, 
      color: "#7E22CE", 
      capacity: 5, 
      currentFuel: 50, 
      status: 'delivering',
      currentLoad: 5, 
      maintenanceSchedule: {
        lastPreventive: "2023-04-10",
        nextPreventive: "2023-06-10"
      }
    },
    { 
      id: "camion-grande-2", 
      position: [52, 35], 
      destination: [55, 35],
      progress: 0.5, 
      color: "#7E22CE", 
      capacity: 25, 
      currentFuel: 60, 
      status: 'delivering',
      currentLoad: 22, 
      maintenanceSchedule: {
        lastPreventive: "2023-03-20",
        nextPreventive: "2023-05-20"
      }
    },
    { 
      id: "camion-mediano-2", 
      position: [60, 62], 
      destination: [60, 65],
      progress: 0.3, 
      color: "#7E22CE", 
      capacity: 15, 
      currentFuel: 75, 
      status: 'delivering',
      currentLoad: 10, 
      maintenanceSchedule: {
        lastPreventive: "2023-04-05",
        nextPreventive: "2023-06-05"
      }
    },
    { 
      id: "camion-abastecedor-1", 
      position: [20, 10], 
      destination: [30, 10],
      progress: 0.8, 
      color: "#1E40AF", 
      capacity: 40, 
      currentFuel: 90, 
      status: 'delivering',
      currentLoad: 40, 
      maintenanceSchedule: {
        lastPreventive: "2023-04-15",
        nextPreventive: "2023-06-15"
      }
    },
    { 
      id: "camion-pequeno-2", 
      position: [40, 50], 
      destination: [40, 45],
      progress: 0.5, 
      color: "#7E22CE", 
      capacity: 5, 
      currentFuel: 40, 
      status: 'delivering',
      currentLoad: 3, 
      maintenanceSchedule: {
        lastPreventive: "2023-04-12",
        nextPreventive: "2023-06-12"
      }
    },
    { 
      id: "camion-grande-3", 
      position: [30, 20], 
      destination: [30, 25],
      progress: 0.6, 
      color: "#7E22CE", 
      capacity: 25, 
      currentFuel: 80, 
      status: 'delivering',
      currentLoad: 20, 
      maintenanceSchedule: {
        lastPreventive: "2023-04-18",
        nextPreventive: "2023-06-18"
      }
    },
  ];

  // Bloqueos de ejemplo
  const blockages: Blockage[] = [
    {
      from: [20, 20],
      to: [25, 25],
      reason: "Bloqueo",
      estimatedDuration: 120,
      startTime: "08:00",
      severity: "high"
    },
    {
      from: [30, 30],
      to: [35, 35],
      reason: "Bloqueo",
      estimatedDuration: 45,
      startTime: "09:30",
      severity: "high"
    },
    {
      from: [40, 40],
      to: [45, 45],
      reason: "Bloqueo",
      estimatedDuration: 180,
      startTime: "10:00",
      severity: "high"
    }
  ];

  // Zoom fijo y posición
  const [scale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // Para mostrar detalles del vehículo seleccionado
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [hoveredVehicle, setHoveredVehicle] = useState<Vehicle | null>(null);

  // Estado de simulación para animar vehículos
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [simulationTime, setSimulationTime] = useState(0);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Actualización de posiciones de vehículos según el tiempo de simulación
  const calculateVehiclePositions = () => {
    return vehicles.map(vehicle => {
      const cycleTime = 180;
      const calculatedProgress = ((simulationTime % cycleTime) / cycleTime);
      let status: Vehicle['status'] = 'idle';
      if (calculatedProgress < 0.4) status = 'delivering';
      else if (calculatedProgress < 0.7) status = 'returning';
      else if (calculatedProgress < 0.8) status = 'refueling';
      else status = 'idle';
      
      return {
        ...vehicle,
        progress: calculatedProgress,
        status
      };
    });
  };

  const currentVehicles = calculateVehiclePositions();

  // Función para calcular la posición entre dos puntos en función del progreso
  const calculatePosition = (start: [number, number], end: [number, number], progress: number): [number, number] => {
    return [
      start[0] + (end[0] - start[0]) * progress,
      start[1] + (end[1] - start[1]) * progress
    ];
  };

  // Determinar el color del vehículo según su estado
  const getVehicleColor = (vehicle: Vehicle) => {
    switch(vehicle.status) {
      case 'delivering': return (vehicle.currentLoad && vehicle.currentLoad > 30) ? '#1E40AF' : '#047857';
      case 'returning': return '#7E22CE';
      case 'maintenance': return '#DC2626';
      case 'refueling': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  // Al hacer click en un vehículo, se muestran sus detalles
  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  // Animación de la simulación
  const animateSimulation = (timestamp: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
    }
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;
    setSimulationTime(prevTime => prevTime + (deltaTime * playbackSpeed) / 1000);
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animateSimulation);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = null;
      animationRef.current = requestAnimationFrame(animateSimulation);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
  }, [isPlaying, playbackSpeed]);

  return (
    <div className="relative">
      <div className="border rounded-md bg-white overflow-hidden w-full h-[730px]">
        <svg
          ref={svgRef}
          width={GRID_WIDTH * GRID_SIZE}
          height={GRID_HEIGHT * GRID_SIZE}
          className="bg-white"
        >
          <g transform={`translate(${position.x}, ${position.y}) scale(${scale})`}>
            {/* Dibujando la cuadrícula */}
            {Array.from({ length: GRID_WIDTH + 1 }).map((_, i) => (
              <line
                key={`v-${i}`}
                x1={i * GRID_SIZE}
                y1={0}
                x2={i * GRID_SIZE}
                y2={GRID_HEIGHT * GRID_SIZE}
                stroke="#e2e8f0"
                strokeWidth={1/scale}
              />
            ))}
            {Array.from({ length: GRID_HEIGHT + 1 }).map((_, j) => (
              <line
                key={`h-${j}`}
                x1={0}
                y1={j * GRID_SIZE}
                x2={GRID_WIDTH * GRID_SIZE}
                y2={j * GRID_SIZE}
                stroke="#e2e8f0"
                strokeWidth={1/scale}
              />
            ))}
            {/* Rutas de la cuadrícula */}
            {gridRoutes.map((r, i) => (
              <line
                key={`grid-route-${i}`}
                x1={r.from[0] * GRID_SIZE + GRID_SIZE / 2}
                y1={r.from[1] * GRID_SIZE + GRID_SIZE / 2}
                x2={r.to[0] * GRID_SIZE + GRID_SIZE / 2}
                y2={r.to[1] * GRID_SIZE + GRID_SIZE / 2}
                stroke={r.type === 'supply' ? '#1E40AF' :
                        r.type === 'delivery' ? '#047857' :
                        r.type === 'return' ? '#7E22CE' : '#F59E0B'}
                strokeWidth={2/scale}
                strokeDasharray={(r.type === 'return' || r.type === 'refuel') ? `${5/scale},${5/scale}` : "none"}
              />
            ))}
            {/* Dibujando bloqueos */}
            {blockages.map((bloqueo, i) => (
              <g key={`blockage-${i}`}>
                <line
                  x1={bloqueo.from[0] * GRID_SIZE + GRID_SIZE / 2}
                  y1={bloqueo.from[1] * GRID_SIZE + GRID_SIZE / 2}
                  x2={bloqueo.to[0] * GRID_SIZE + GRID_SIZE / 2}
                  y2={bloqueo.to[1] * GRID_SIZE + GRID_SIZE / 2}
                  stroke={
                    bloqueo.severity === 'high'
                    ? '#EF4444'
                    : bloqueo.severity === 'medium'
                      ? '#F59E0B'
                      : '#FCD34D'
                  }
                  strokeWidth={4/scale}
                  strokeDasharray={`${8/scale},${4/scale}`}
                />
                <text
                  x={(bloqueo.from[0] + bloqueo.to[0]) * GRID_SIZE / 2 + GRID_SIZE / 2}
                  y={(bloqueo.from[1] + bloqueo.to[1]) * GRID_SIZE / 2 + GRID_SIZE / 2 - 10/scale}
                  fontSize={`${8/scale}px`}
                  fill="#000"
                  textAnchor="middle"
                >
                  {bloqueo.reason}
                </text>
              </g>
            ))}
            {/* Dibujando nodos (plantas, tanques, clientes, estaciones) */}
            {nodes.map((node, i) => (
              <g key={`node-${i}`}>
                <circle
                  cx={node.x * GRID_SIZE + GRID_SIZE / 2}
                  cy={node.y * GRID_SIZE + GRID_SIZE / 2}
                  r={(node.type === 'refuelStation' ? 4 : 6) / Math.sqrt(scale)}
                  fill={node.color}
                  stroke={node.type === 'tank' ? '#047857' : node.type === 'plant' ? '#1E3A8A' : 'none'}
                  strokeWidth={1/scale}
                />
                {node.label && (
                  <text
                    x={node.x * GRID_SIZE + GRID_SIZE / 2 + 8/scale}
                    y={node.y * GRID_SIZE + GRID_SIZE / 2 + 4/scale}
                    fontSize={`${10/scale}px`}
                    fill="#4B5563"
                  >
                    {node.label}
                  </text>
                )}
              </g>
            ))}
            {/* Dibujando vehículos y asignándoles funcionalidad de click y hover */}
            {currentVehicles.map((vehicle, i) => {
              const currentPos = calculatePosition(vehicle.position, vehicle.destination, vehicle.progress);
              const direction = vehicle.destination[0] > vehicle.position[0]
                ? '→'
                : vehicle.destination[0] < vehicle.position[0]
                  ? '←'
                  : vehicle.destination[1] > vehicle.position[1]
                    ? '↓' : '↑';
              return (
                <g
                  key={`vehicle-${i}`}
                  transform={`translate(${currentPos[0] * GRID_SIZE}, ${currentPos[1] * GRID_SIZE})`}
                  onClick={() => handleVehicleClick(vehicle)}
                  onMouseEnter={() => setHoveredVehicle(vehicle)}
                  onMouseLeave={() => setHoveredVehicle(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    x={-6/scale}
                    y={-3/scale}
                    width={12/scale}
                    height={6/scale}
                    fill={getVehicleColor(vehicle)}
                    stroke="#000"
                    strokeWidth={0.5/scale}
                  />
                  <text
                    x={0}
                    y={-8/scale}
                    fontSize={`${8/scale}px`}
                    fill="#000"
                    textAnchor="middle"
                  >
                    {direction}
                  </text>
                  <circle cx={-3/scale} cy={4/scale} r={1.5/scale} fill="#000" />
                  <circle cx={3/scale} cy={4/scale} r={1.5/scale} fill="#000" />
                  <rect
                    x={-5/scale}
                    y={-6/scale}
                    width={(10 * (vehicle.currentFuel / 100))/scale}
                    height={2/scale}
                    fill={vehicle.currentFuel > 30 ? '#10B981' : '#EF4444'}
                  />
                  <text
                    x={0}
                    y={0}
                    fontSize={`${6/scale}px`}
                    fill="#FFF"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {vehicle.capacity}m³
                  </text>
                </g>
              );
            })}
            {/* Tooltip para mostrar información del vehículo al hacer hover */}
            {hoveredVehicle && (
              <foreignObject
                x={(hoveredVehicle.position[0] * GRID_SIZE) + 10}
                y={(hoveredVehicle.position[1] * GRID_SIZE) - 20}
                width={150}
                height={50}
              >
                <div className="bg-white p-2 rounded shadow-md text-xs">
                  <p><strong>ID:</strong> {hoveredVehicle.id}</p>
                  <p><strong>Combustible:</strong> {hoveredVehicle.currentFuel}%</p>
                </div>
              </foreignObject>
            )}
          </g>
        </svg>
      </div>
      {/* Panel de detalles del vehículo seleccionado */}
      {selectedVehicle && (
        <div 
          className="absolute top-4 right-4 bg-white p-4 rounded shadow-md z-10"
          style={{ width: '300px' }}
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-lg">Detalles del Vehículo</h2>
            <button onClick={() => setSelectedVehicle(null)} className="text-gray-500">Cerrar</button>
          </div>
          <p><strong>ID:</strong> {selectedVehicle.id}</p>
          <p><strong>Capacidad:</strong> {selectedVehicle.capacity} m³</p>
          <p><strong>Carga Actual:</strong> {selectedVehicle.currentLoad} m³</p>
          <p><strong>Combustible:</strong> {selectedVehicle.currentFuel}%</p>
          <p><strong>Estado:</strong> {selectedVehicle.status}</p>
          {selectedVehicle.issues && selectedVehicle.issues.length > 0 && (
            <div className="mt-3">
              <h3 className="font-bold">Averías</h3>
              {selectedVehicle.issues.map((issue, idx) => (
                <div key={idx} className="border p-1 my-1 rounded">
                  <p><strong>Descripción:</strong> {issue.description}</p>
                  <p><strong>Hora:</strong> {issue.timestamp}</p>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3">
            <h3 className="font-bold">Bloqueos Cercanos</h3>
            {blockages.filter(b => {
              const [vx, vy] = calculatePosition(selectedVehicle.position, selectedVehicle.destination, selectedVehicle.progress);
              const dist = (point: [number, number]) => Math.hypot(vx - point[0], vy - point[1]);
              return dist(b.from) < 10 || dist(b.to) < 10;
            }).map((b, idx) => (
              <div key={idx} className="border p-1 my-1 rounded">
                <p><strong>Razón:</strong> {b.reason}</p>
                <p><strong>Severidad:</strong> {b.severity}</p>
                <p><strong>Duración Estimada:</strong> {b.estimatedDuration} mins</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
