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
      to: [20, 25], // Changed to vertical (same x coordinate)
      reason: "Bloqueo",
      estimatedDuration: 120,
      startTime: "08:00",
      severity: "high"
    },
    {
      from: [30, 30],
      to: [35, 30], // Changed to horizontal (same y coordinate)
      reason: "Bloqueo",
      estimatedDuration: 45,
      startTime: "09:30",
      severity: "medium"
    },
    {
      from: [40, 40],
      to: [40, 45], // Changed to vertical (same x coordinate)
      reason: "Bloqueo",
      estimatedDuration: 180,
      startTime: "10:00",
      severity: "low"
    },
    // Nuevos bloqueos de ejemplo
    {
      from: [15, 35],
      to: [25, 35], // Horizontal (same y coordinate)
      reason: "Bloqueo",
      estimatedDuration: 90,
      startTime: "11:30",
      severity: "medium"
    },
    {
      from: [50, 50],
      to: [50, 55], // Vertical (same x coordinate)
      reason: "Bloqueo",
      estimatedDuration: 240,
      startTime: "07:45",
      severity: "high"
    }
  ];

  // Helper function to check if a blockage is orthogonal (horizontal or vertical)
  const isOrthogonalBlockage = (from: [number, number], to: [number, number]): boolean => {
    return from[0] === to[0] || from[1] === to[1];
  };

  // Function to add a new blockage with validation
  const addBlockage = (newBlockage: Blockage) => {
    if (!isOrthogonalBlockage(newBlockage.from, newBlockage.to)) {
      console.error("Invalid blockage: must be horizontal or vertical");
      return false;
    }
    // Add the blockage to the state
    // blockages.push(newBlockage); // This would require state management
    return true;
  };
  
  // Zoom fijo y posición
  const [scale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Para mostrar detalles del vehículo seleccionado
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [hoveredVehicle, setHoveredVehicle] = useState<Vehicle | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number, y: number } | null>(null);

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

  // Detectar si un punto está dentro de un vehículo
  const isPointInVehicle = (x: number, y: number, vehicle: Vehicle): boolean => {
    const currentPos = calculatePosition(vehicle.position, vehicle.destination, vehicle.progress);
    const vehicleX = currentPos[0] * GRID_SIZE;
    const vehicleY = currentPos[1] * GRID_SIZE;
    
    return (
      x >= vehicleX - 6 &&
      x <= vehicleX + 6 &&
      y >= vehicleY - 3 &&
      y <= vehicleY + 6
    );
  };

  // Manejar el movimiento del mouse sobre el canvas
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) - position.x;
    const y = (e.clientY - rect.top) - position.y;
    
    setHoveredPoint({ x, y });
    
    // Verificar si el mouse está sobre algún vehículo
    const hovered = currentVehicles.find(vehicle => isPointInVehicle(x, y, vehicle));
    setHoveredVehicle(hovered || null);
  };

  // Manejar el click en el canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) - position.x;
    const y = (e.clientY - rect.top) - position.y;
    
    // Verificar si se hizo clic en algún vehículo
    const clicked = currentVehicles.find(vehicle => isPointInVehicle(x, y, vehicle));
    if (clicked) {
      handleVehicleClick(clicked);
    }
  };

  // Dibujar la simulación en el canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Aplicar transformación para posición y escala
    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.scale(scale, scale);
    
    // Dibujar la cuadrícula
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1/scale;
    ctx.beginPath();
    for (let i = 0; i <= GRID_WIDTH; i++) {
      ctx.moveTo(i * GRID_SIZE, 0);
      ctx.lineTo(i * GRID_SIZE, GRID_HEIGHT * GRID_SIZE);
    }
    for (let j = 0; j <= GRID_HEIGHT; j++) {
      ctx.moveTo(0, j * GRID_SIZE);
      ctx.lineTo(GRID_WIDTH * GRID_SIZE, j * GRID_SIZE);
    }
    ctx.stroke();
    
    // Dibujar rutas
    for (const route of gridRoutes) {
      ctx.beginPath();
      ctx.moveTo(route.from[0] * GRID_SIZE + GRID_SIZE / 2, route.from[1] * GRID_SIZE + GRID_SIZE / 2);
      ctx.lineTo(route.to[0] * GRID_SIZE + GRID_SIZE / 2, route.to[1] * GRID_SIZE + GRID_SIZE / 2);
      
      // Asignar color según el tipo de ruta
      ctx.strokeStyle = route.type === 'supply' ? '#1E40AF' :
                       route.type === 'delivery' ? '#047857' :
                       route.type === 'return' ? '#7E22CE' : '#F59E0B';
      ctx.lineWidth = 2/scale;
      
      // Línea discontinua para rutas de retorno y recarga
      if (route.type === 'return' || route.type === 'refuel') {
        ctx.setLineDash([5/scale, 5/scale]);
      } else {
        ctx.setLineDash([]);
      }
      
      ctx.stroke();
    }
    
    // Dibujar bloqueos
    for (const blockage of blockages) {
      ctx.beginPath();
      ctx.moveTo(blockage.from[0] * GRID_SIZE + GRID_SIZE / 2, blockage.from[1] * GRID_SIZE + GRID_SIZE / 2);
      ctx.lineTo(blockage.to[0] * GRID_SIZE + GRID_SIZE / 2, blockage.to[1] * GRID_SIZE + GRID_SIZE / 2);
      
      // Color según la severidad
      ctx.strokeStyle = blockage.severity === 'high' ? '#EF4444' :
                       blockage.severity === 'medium' ? '#F59E0B' : '#FCD34D';
      ctx.lineWidth = 4/scale;
      ctx.setLineDash([8/scale, 4/scale]);
      ctx.stroke();
      
      // Texto del bloqueo
      ctx.setLineDash([]);
      ctx.font = `${8/scale}px Arial`;
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.fillText(
        blockage.reason,
        (blockage.from[0] + blockage.to[0]) * GRID_SIZE / 2 + GRID_SIZE / 2,
        (blockage.from[1] + blockage.to[1]) * GRID_SIZE / 2 + GRID_SIZE / 2 - 10/scale
      );
    }
    
    // Dibujar nodos (plantas, tanques, clientes, estaciones)
    for (const node of nodes) {
      ctx.beginPath();
      ctx.arc(
        node.x * GRID_SIZE + GRID_SIZE / 2,
        node.y * GRID_SIZE + GRID_SIZE / 2,
        (node.type === 'refuelStation' ? 4 : 6) / Math.sqrt(scale),
        0,
        2 * Math.PI
      );
      ctx.fillStyle = node.color;
      ctx.fill();
      
      // Borde para tanques y plantas
      if (node.type === 'tank' || node.type === 'plant') {
        ctx.strokeStyle = node.type === 'tank' ? '#047857' : '#1E3A8A';
        ctx.lineWidth = 1/scale;
        ctx.stroke();
      }
      
      // Etiqueta del nodo
      if (node.label) {
        ctx.font = `${10/scale}px Arial`;
        ctx.fillStyle = '#4B5563';
        ctx.textAlign = 'left';
        ctx.fillText(
          node.label,
          node.x * GRID_SIZE + GRID_SIZE / 2 + 8/scale,
          node.y * GRID_SIZE + GRID_SIZE / 2 + 4/scale
        );
      }
    }
    
    // Dibujar vehículos
    for (const vehicle of currentVehicles) {
      const currentPos = calculatePosition(vehicle.position, vehicle.destination, vehicle.progress);
      const x = currentPos[0] * GRID_SIZE;
      const y = currentPos[1] * GRID_SIZE;
      
      // Dirección del vehículo
      const direction = vehicle.destination[0] > vehicle.position[0]
        ? '→'
        : vehicle.destination[0] < vehicle.position[0]
          ? '←'
          : vehicle.destination[1] > vehicle.position[1]
            ? '↓' : '↑';
      
      // Dibujar cuerpo del vehículo
      ctx.fillStyle = getVehicleColor(vehicle);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 0.5/scale;
      ctx.beginPath();
      ctx.rect(x - 6/scale, y - 3/scale, 12/scale, 6/scale);
      ctx.fill();
      ctx.stroke();
      
      // Dibujar dirección
      ctx.font = `${8/scale}px Arial`;
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.fillText(direction, x, y - 8/scale);
      
      // Dibujar ruedas
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(x - 3/scale, y + 4/scale, 1.5/scale, 0, 2 * Math.PI);
      ctx.arc(x + 3/scale, y + 4/scale, 1.5/scale, 0, 2 * Math.PI);
      ctx.fill();
      
      // Dibujar indicador de combustible
      ctx.fillStyle = vehicle.currentFuel > 30 ? '#10B981' : '#EF4444';
      ctx.beginPath();
      ctx.rect(x - 5/scale, y - 6/scale, (10 * vehicle.currentFuel / 100)/scale, 2/scale);
      ctx.fill();
      
      // Dibujar capacidad
      ctx.font = `${6/scale}px Arial`;
      ctx.fillStyle = '#FFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${vehicle.capacity}m³`, x, y);
      
      // Resaltar vehículo seleccionado o con hover
      if (vehicle === selectedVehicle || vehicle === hoveredVehicle) {
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 1.5/scale;
        ctx.beginPath();
        ctx.rect(x - 7/scale, y - 7/scale, 14/scale, 14/scale);
        ctx.stroke();
      }
    }
    
    // Dibujar tooltip para vehículo con hover
    if (hoveredVehicle && hoveredPoint) {
      const currentPos = calculatePosition(hoveredVehicle.position, hoveredVehicle.destination, hoveredVehicle.progress);
      const x = currentPos[0] * GRID_SIZE + 10;
      const y = currentPos[1] * GRID_SIZE - 25;
      
      // Fondo del tooltip
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(x, y, 150, 50);
      ctx.fill();
      ctx.stroke();
      
      // Texto del tooltip
      ctx.font = '12px Arial';
      ctx.fillStyle = '#000';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`ID: ${hoveredVehicle.id}`, x + 8, y + 8);
      ctx.fillText(`Combustible: ${hoveredVehicle.currentFuel}%`, x + 8, y + 26);
    }
    
    ctx.restore();
  }, [currentVehicles, gridRoutes, nodes, blockages, position, scale, hoveredVehicle, selectedVehicle, hoveredPoint]);

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
        <canvas
          ref={canvasRef}
          width={GRID_WIDTH * GRID_SIZE}
          height={GRID_HEIGHT * GRID_SIZE}
          className="bg-white"
          onMouseMove={handleMouseMove}
          onClick={handleCanvasClick}
          style={{ cursor: 'pointer' }}
        />
      </div>
      
      {/* Panel de detalles del vehículo seleccionado */}
      {selectedVehicle && (
        <div 
          className="absolute top-4 right-4 bg-white p-4 rounded shadow-md z-10"
          style={{ width: '300px' }}
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-lg">Información del Vehículo</h2>
            <button onClick={() => setSelectedVehicle(null)} className="text-gray-500">Cerrar</button>
          </div>
          <p><strong>ID:</strong> {selectedVehicle.id}</p>
          <p><strong>Capacidad:</strong> {selectedVehicle.capacity} m³</p>
          <p><strong>Carga Actual:</strong> {selectedVehicle.currentLoad} m³</p>
          <p><strong>Combustible:</strong> {selectedVehicle.currentFuel}%</p>
          <p><strong>Estado:</strong> {selectedVehicle.status}</p>
          {selectedVehicle.issues && selectedVehicle.issues.length > 0 && (
            <div className="mt-3">
              <h3 className="font-bold">Problemas</h3>
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
