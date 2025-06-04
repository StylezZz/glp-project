/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/simulation/simulation-visualizer.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Square, 
  SkipForward, 
  SkipBack,
  RotateCcw,
  Settings,
  Download,
  Camera
} from 'lucide-react';
import { Map } from '@/components/map/Map';
import { MapFilters } from '@/components/map/MapFilters';
import { useMapData } from '@/hooks/useMapData';
import { 
  MapState, 
  MapFilters as MapFiltersType, 
  SimulationStatus,
  Vehicle,
  GridPosition 
} from '@/types/map';
import { toast } from 'sonner';

// Mock data generator for development/testing
const generateMockData = (): MapState => {
  // Planta principal - punto de origen
  const mainPlant = { x: 10, y: 25 };
  
  // Tanques intermedios - destinos
  const tanks = [
    { x: 60, y: 10, name: 'Tanque Norte' },
    { x: 60, y: 25, name: 'Tanque Centro' },
    { x: 60, y: 40, name: 'Tanque Sur' },
  ];

  // Generar 20 camiones de 4 tipos diferentes según la especificación
  const vehicles: Vehicle[] = [];
  const vehicleTypes: Vehicle['type'][] = ['TA', 'TB', 'TC', 'TD'];
  
  // Configuración de cada tipo de camión según la especificación
  const vehicleConfigs = {
    TA: { count: 2, grossWeight: 2.5, glpCapacity: 25, glpWeight: 12.5, combinedWeight: 15.0 },
    TB: { count: 4, grossWeight: 2.0, glpCapacity: 15, glpWeight: 7.5, combinedWeight: 9.5 },
    TC: { count: 4, grossWeight: 1.5, glpCapacity: 10, glpWeight: 5.0, combinedWeight: 6.5 },
    TD: { count: 10, grossWeight: 1.0, glpCapacity: 5, glpWeight: 2.5, combinedWeight: 3.5 },
  };
  const driverNames = [
    'Juan Pérez', 'María García', 'Carlos López', 'Ana Mendoza', 'Miguel Rojas',
    'Sofia Torres', 'Diego Silva', 'Carmen Flores', 'Roberto Cruz', 'Elena Morales',
    'Fernando Ruiz', 'Patricia Vega', 'Andrés Castro', 'Lucía Herrera', 'Manuel Ortiz',
    'Gabriela Santos', 'Jorge Ramírez', 'Isabel Delgado', 'Ricardo Méndez', 'Valeria Jiménez'
  ];

  // Crear el número específico de cada tipo de camión según la especificación
  for (let i = 0; i < 20; i++) {
    const type = vehicleTypes[i % 4];
    const tankDestination = tanks[i % 3]; // Rotar entre los 3 tanques
    
    // Obtener configuración del tipo de camión
    const config = vehicleConfigs[type];
    
    vehicles.push({
      id: `vehicle-${i + 1}`,
      position: { 
        x: mainPlant.x + (i % 5) - 2, // Pequeña variación alrededor de la planta
        y: mainPlant.y + Math.floor(i / 5) - 2 
      },
      destination: tankDestination,
      name: `Camión ${type} ${Math.floor(i / 4) + 1}`,
      type,
      capacity: config.glpCapacity,
      currentLoad: Math.floor(config.glpCapacity * 0.8), // 80% cargado
      fuelLevel: 85 + Math.random() * 15, // Entre 85% y 100%
      speed: type === 'TA' ? 1.0 : (type === 'TB' ? 1.2 : (type === 'TC' ? 1.5 : 2.0)),
      status: i < 16 ? 'delivering' : (i === 16 ? 'maintenance' : (i === 17 ? 'refueling' : 'idle')) as Vehicle['status'],
      driver: driverNames[i],
      // Propiedades específicas del tipo de camión
      grossWeight: config.grossWeight,
      glpCapacity: config.glpCapacity,
      glpWeight: config.glpWeight,
      combinedWeight: config.combinedWeight,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    });
  }

  const plants = [
    {
      id: 'plant-1',
      position: mainPlant,
      name: 'Planta Principal GLP',
      capacity: 2000,
      currentLevel: 1800,
      productionRate: 100,
      status: 'operational' as const,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
  ];

  const tanksData = tanks.map((tank, index) => ({
    id: `tank-${index + 1}`,
    position: tank,
    name: tank.name,
    capacity: 200,
    currentLevel: 120 - (index * 30), // Diferentes niveles
    refillRate: 25,
    lastRefill: '2023-01-01T00:00:00Z',
    status: (index === 0 ? 'operational' : index === 1 ? 'low' : 'critical') as const,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  }));

  // Algunos clientes distribuidos
  const clients = [
    {
      id: 'client-1',
      position: { x: 30, y: 15 },
      name: 'Distribuidora Norte',
      demand: 18,
      priority: 'high' as const,
      contractType: 'commercial' as const,
      status: 'pending' as const,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    {
      id: 'client-2',
      position: { x: 45, y: 35 },
      name: 'Residencial Torres',
      demand: 8,
      priority: 'medium' as const,
      contractType: 'residential' as const,
      status: 'active' as const,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    {
      id: 'client-3',
      position: { x: 25, y: 40 },
      name: 'Hospital Central',
      demand: 25,
      priority: 'critical' as const,
      contractType: 'institutional' as const,
      status: 'overdue' as const,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
  ];

  const refuelStations = [
    {
      id: 'refuel-1',
      position: { x: 35, y: 10 },
      name: 'Estación Norte',
      fuelCapacity: 1500,
      currentFuelLevel: 1200,
      serviceTime: 15,
      status: 'operational' as const,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    {
      id: 'refuel-2',
      position: { x: 35, y: 40 },
      name: 'Estación Sur',
      fuelCapacity: 1500,
      currentFuelLevel: 800,
      serviceTime: 15,
      status: 'operational' as const,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
  ];

  // Rutas principales de la planta a los tanques
  const routes = tanks.map((tank, index) => ({
    id: `route-${index + 1}`,
    path: [
      mainPlant,
      { x: 35, y: mainPlant.y }, // Punto intermedio
      { x: 35, y: tank.y },       // Vertical hacia el tanque
      tank                        // Destino final
    ],
    distance: Math.abs(tank.x - mainPlant.x) + Math.abs(tank.y - mainPlant.y),
    estimatedTime: 45 + (index * 10),
    type: 'delivery' as const,
    priority: 1,
    status: 'active' as const,
  }));

  // Algunos bloqueos para hacer la simulación más interesante
  const blockages = [
    {
      id: 'blockage-1',
      from: { x: 30, y: 25 },
      to: { x: 35, y: 25 },
      reason: 'Obras en la vía principal',
      severity: 'medium' as const,
      estimatedDuration: 90,
      startTime: '08:30',
      affectedRoutes: ['route-2'],
      status: 'active' as const,
    },
  ];

  return {
    vehicles,
    plants,
    tanks: tanksData,
    clients,
    refuelStations,
    routes,
    blockages,
    breakdowns: [],
    maintenances: [],
    orders: [],
    lastUpdated: new Date().toISOString(),
  };
};

export default function SimulationVisualizer() {
  // Use real data hook (commented out for demo)
  // const { 
  //   mapData, 
  //   simulationStatus, 
  //   isLoading, 
  //   error,
  //   startSimulation,
  //   pauseSimulation,
  //   stopSimulation,
  //   setSimulationSpeed
  // } = useMapData({
  //   autoRefresh: true,
  //   refreshInterval: 2000,
  //   enableRealTime: true,
  // });

  // Mock data for development
  const [mapData, setMapData] = useState<MapState>(generateMockData());
  const [simulationStatus, setSimulationStatus] = useState<SimulationStatus>({
    isRunning: false,
    currentTime: new Date().toISOString(),
    simulationSpeed: 1,
    totalOrders: 85,
    completedOrders: 47,
    activeVehicles: 16, // 16 de 20 camiones activos
    activeBlockages: 1,
    activeBreakdowns: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local state
  const [filters, setFilters] = useState<MapFiltersType>({
    showVehicles: true,
    showPlants: true,
    showTanks: true,
    showClients: true,
    showRefuelStations: true,
    showRoutes: true,
    showBlockages: true,
    showBreakdowns: true,
    showMaintenances: true,
    vehicleTypes: ['small', 'medium', 'large', 'tanker'],
    vehicleStatuses: ['idle', 'delivering', 'returning', 'maintenance', 'refueling', 'broken'],
    routeTypes: ['supply', 'delivery', 'return', 'maintenance'],
    blockageSeverities: ['low', 'medium', 'high', 'critical'],
  });

  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [simulationTime, setSimulationTime] = useState(0);

  // Simulation controls
  const handleStartSimulation = async () => {
    try {
      setIsLoading(true);
      // await startSimulation();
      setSimulationStatus(prev => ({ ...prev, isRunning: true }));
      toast.success('Simulación iniciada');
    } catch (err) {
      toast.error('Error al iniciar la simulación');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePauseSimulation = async () => {
    try {
      setIsLoading(true);
      // await pauseSimulation();
      setSimulationStatus(prev => ({ ...prev, isRunning: false }));
      toast.success('Simulación pausada');
    } catch (err) {
      toast.error('Error al pausar la simulación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopSimulation = async () => {
    try {
      setIsLoading(true);
      // await stopSimulation();
      setSimulationStatus(prev => ({ 
        ...prev, 
        isRunning: false,
        currentTime: new Date().toISOString()
      }));
      setSimulationTime(0);
      toast.success('Simulación detenida');
    } catch (err) {
      toast.error('Error al detener la simulación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeedChange = async (speed: number) => {
    try {
      // await setSimulationSpeed(speed);
      setSimulationStatus(prev => ({ ...prev, simulationSpeed: speed }));
      toast.success(`Velocidad de simulación: ${speed}x`);
    } catch (err) {
      toast.error('Error al cambiar la velocidad');
    }
  };

  // Mock animation for development - ORTHOGONAL MOVEMENT ONLY
  useEffect(() => {
    if (!simulationStatus?.isRunning) return;

    const interval = setInterval(() => {
      setSimulationTime(prev => prev + simulationStatus.simulationSpeed);
      
      // Update vehicle positions (mock) - only orthogonal movement
      setMapData(prev => ({
        ...prev,
        vehicles: prev.vehicles.map(vehicle => {
          if (vehicle.destination && vehicle.status === 'delivering') {
            const dx = vehicle.destination.x - vehicle.position.x;
            const dy = vehicle.destination.y - vehicle.position.y;
            
            // Solo mover si no está en el destino
            if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
              // Movimiento ortogonal: primero horizontal, luego vertical
              if (Math.abs(dx) > 0.5) {
                // Mover horizontalmente
                const moveX = dx > 0 ? Math.min(vehicle.speed * 0.2, Math.abs(dx)) : -Math.min(vehicle.speed * 0.2, Math.abs(dx));
                return {
                  ...vehicle,
                  position: {
                    x: vehicle.position.x + moveX,
                    y: vehicle.position.y, // No movimiento vertical
                  },
                };
              } else if (Math.abs(dy) > 0.5) {
                // Luego mover verticalmente
                const moveY = dy > 0 ? Math.min(vehicle.speed * 0.2, Math.abs(dy)) : -Math.min(vehicle.speed * 0.2, Math.abs(dy));
                return {
                  ...vehicle,
                  position: {
                    x: vehicle.position.x, // No movimiento horizontal
                    y: vehicle.position.y + moveY,
                  },
                };
              }
            } else {
              // Ha llegado al destino, cambiar estado
              return {
                ...vehicle,
                status: 'returning' as Vehicle['status'],
                destination: { x: 10, y: 25 }, // Regresar a la planta principal
              };
            }
          } else if (vehicle.destination && vehicle.status === 'returning') {
            // Lógica para regresar a la planta
            const dx = vehicle.destination.x - vehicle.position.x;
            const dy = vehicle.destination.y - vehicle.position.y;
            
            if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
              if (Math.abs(dx) > 0.5) {
                const moveX = dx > 0 ? Math.min(vehicle.speed * 0.2, Math.abs(dx)) : -Math.min(vehicle.speed * 0.2, Math.abs(dx));
                return {
                  ...vehicle,
                  position: {
                    x: vehicle.position.x + moveX,
                    y: vehicle.position.y,
                  },
                };
              } else if (Math.abs(dy) > 0.5) {
                const moveY = dy > 0 ? Math.min(vehicle.speed * 0.2, Math.abs(dy)) : -Math.min(vehicle.speed * 0.2, Math.abs(dy));
                return {
                  ...vehicle,
                  position: {
                    x: vehicle.position.x,
                    y: vehicle.position.y + moveY,
                  },
                };
              }
            } else {
              // Ha regresado a la planta, reiniciar ciclo
              const tanks = [
                { x: 60, y: 10 },
                { x: 60, y: 25 },
                { x: 60, y: 40 },
              ];
              const newDestination = tanks[Math.floor(Math.random() * tanks.length)];
              
              return {
                ...vehicle,
                status: 'delivering' as Vehicle['status'],
                destination: newDestination,
                currentLoad: Math.floor(vehicle.capacity * 0.8), // Recargar
              };
            }
          }
          return vehicle;
        }),
        lastUpdated: new Date().toISOString(),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [simulationStatus?.isRunning, simulationStatus?.simulationSpeed]);

  // Event handlers
  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedEntity(vehicle);
  };

  const handleClientClick = (client: any) => {
    setSelectedEntity(client);
  };

  const handleCellClick = (position: GridPosition) => {
    console.log('Cell clicked:', position);
  };

  const exportSimulationData = () => {
    const data = JSON.stringify(mapData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'simulation-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Datos exportados');
  };

  const takeScreenshot = () => {
    // This would implement canvas screenshot functionality
    toast.success('Captura de pantalla tomada');
  };

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>
            Recargar
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Simulation Controls Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-3">
              <span>Visualización de Simulación</span>
              <Badge 
                variant={simulationStatus?.isRunning ? 'default' : 'outline'}
                className={simulationStatus?.isRunning ? 'bg-green-100 text-green-800' : ''}
              >
                {simulationStatus?.isRunning ? 'En ejecución' : 'Detenido'}
              </Badge>
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              <MapFilters
                filters={filters}
                data={mapData}
                onFiltersChange={setFilters}
              />
              
              <Button variant="outline" size="sm" onClick={exportSimulationData}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              
              <Button variant="outline" size="sm" onClick={takeScreenshot}>
                <Camera className="h-4 w-4 mr-2" />
                Captura
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center justify-between">
            {/* Playback Controls */}
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleStopSimulation}
                disabled={isLoading}
              >
                <Square className="h-4 w-4" />
              </Button>
              
              <Button
                size="sm"
                onClick={simulationStatus?.isRunning ? handlePauseSimulation : handleStartSimulation}
                disabled={isLoading}
              >
                {simulationStatus?.isRunning ? (
                  <Pause className="h-4 w-4 mr-2" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {simulationStatus?.isRunning ? 'Pausar' : 'Iniciar'}
              </Button>
              
              <div className="flex items-center space-x-2 ml-4">
                <span className="text-sm text-muted-foreground">Velocidad:</span>
                {[0.5, 1, 2, 5].map(speed => (
                  <Button
                    key={speed}
                    size="sm"
                    variant={simulationStatus?.simulationSpeed === speed ? 'default' : 'outline'}
                    onClick={() => handleSpeedChange(speed)}
                    disabled={isLoading}
                  >
                    {speed}x
                  </Button>
                ))}
              </div>
            </div>

            {/* Simulation Stats */}
            <div className="flex items-center space-x-6 text-sm">
              <div>
                <span className="text-muted-foreground">Tiempo:</span>
                <span className="font-medium ml-1">
                  {Math.floor(simulationTime / 3600)}h {Math.floor((simulationTime % 3600) / 60)}m
                </span>
              </div>
              
              <div>
                <span className="text-muted-foreground">Vehículos activos:</span>
                <span className="font-medium ml-1">{simulationStatus?.activeVehicles}/20</span>
              </div>
              
              <div>
                <span className="text-muted-foreground">Pedidos:</span>
                <span className="font-medium ml-1">
                  {simulationStatus?.completedOrders}/{simulationStatus?.totalOrders}
                </span>
              </div>
              
              <div>
                <span className="text-muted-foreground">Bloqueos:</span>
                <span className="font-medium ml-1">{simulationStatus?.activeBlockages}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Visualization */}
      <Card className="p-0 overflow-hidden">
        <div className="flex justify-center p-4">
          {mapData && (
            <Map
              data={mapData}
              filters={filters}
              eventHandlers={{
                onVehicleClick: handleVehicleClick,
                onClientClick: handleClientClick,
                onCellClick: handleCellClick,
              }}
              showControls={false} // No zoom/pan controls needed
              showTooltips={true}
              enablePanning={false} // Fixed map
              enableZooming={false} // Fixed map
              className="border-2 border-gray-200 rounded-lg"
            />
          )}
        </div>
        
        {isLoading && (
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>Cargando...</span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Entity Details Panel */}
      {selectedEntity && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Detalles de {selectedEntity.name || selectedEntity.id}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedEntity(null)}
              >
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-3 rounded overflow-auto">
              {JSON.stringify(selectedEntity, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}