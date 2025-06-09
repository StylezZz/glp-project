/* eslint-disable @typescript-eslint/no-explicit-any */
/* components/simulation/simulation-client.tsx */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Settings, 
  BarChart3, 
  Map as MapIcon,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { SimulationSelection } from './simulation-selection';
import { SimulationControls } from './simulation-controls';
import SimulationVisualizer from './simulation-visualizer';
import { SimulationResults } from './simulation-results';
import { SimulationGridSystem } from './simulation-grid-system';
import { SimulationControlPanel } from './simulation-control-panel';
import { SimulationTruckStatus } from './simulation-truck-status';
import { toast } from 'sonner';
import type { Truck, TruckState } from '@/types/logistics';
import { findPath } from '@/lib/pathfinding';

type SimulationState = 'selection' | 'running' | 'completed' | 'error';

interface SimulationData {
  type: string;
  files: {
    pedidos?: string;
    bloqueos?: string;
    averias?: string;
  };
  config?: {
    startDate?: string;
    duration?: number;
    speed?: number;
  };
}

export default function SimulationPageClient() {
  const [simulationState, setSimulationState] = useState<SimulationState>('selection');
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null);
  const [activeTab, setActiveTab] = useState('grid'); // Changed from 'map' to 'grid'
  const [simulationResults, setSimulationResults] = useState<any>(null);
  
  // Grid system specific states
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [blockedCells, setBlockedCells] = useState<Set<string>>(new Set());
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTruckId, setSelectedTruckId] = useState<number | null>(null);
  const [depots, setDepots] = useState([
    // Refueling stations
    { x: 10, y: 5, type: 'refueling' as const },
    { x: 40, y: 25, type: 'refueling' as const },
    // Maintenance depots
    { x: 5, y: 20, type: 'maintenance' as const },
    { x: 35, y: 5, type: 'maintenance' as const }
  ]);
    // Initialize trucks
  useEffect(() => {
    const initialTrucks: Truck[] = Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      x: Math.floor(Math.random() * 40) + 5,
      y: Math.floor(Math.random() * 25) + 5,
      state: "operational" as TruckState,
      direction: Math.floor(Math.random() * 4),
      speed: 1,
      lastMoved: Date.now(),
      path: [],
      fuel: Math.floor(Math.random() * 50) + 50, // 50-100% de combustible
      maintenance: Math.floor(Math.random() * 30), // 0-30% necesidad de mantenimiento
      payload: Math.floor(Math.random() * 5000), // Carga aleatoria inicial
      maxCapacity: 10000, // Capacidad máxima de carga
    }));
    setTrucks(initialTrucks);

    // Add some initial blocked areas
    const initialBlocked = new Set([
      "15-10",
      "15-11",
      "15-12",
      "15-13",
      "15-14",
      "15-15",
      "15-16",
      "15-17",
      "15-18",
      "30-5",
      "31-5",
      "32-5",
      "33-5",
      "34-5",
      "35-5", 
      "25-20",
      "25-21",
      "25-22",
      "25-23",
      "25-24",
      "25-25",
    ]);
    setBlockedCells(initialBlocked);
  }, []);
  
  // Update the movement logic
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTrucks((prevTrucks) =>
        prevTrucks.map((truck) => {
          if (truck.state !== "operational") return truck;

          const now = Date.now();
          if (now - truck.lastMoved < 500) return truck;

          // Check fuel level
          if (truck.fuel <= 0) {
            return {
              ...truck,
              state: "broken",
            };
          }

          // Check maintenance level
          if (truck.maintenance >= 100) {
            return {
              ...truck,
              state: "maintenance",
            };
          }

          // If truck has no path or reached destination, set a new random destination
          if (!truck.path.length) {
            const destination = {
              x: Math.floor(Math.random() * 50),
              y: Math.floor(Math.random() * 30),
            };

            // Generate path to destination using A* algorithm
            const path = findPath(
              { x: truck.x, y: truck.y },
              destination,
              blockedCells,
              { width: 50, height: 30 }
            );

            return {
              ...truck,
              path: path || [],
              lastMoved: now,
            };
          }

          // Follow existing path
          const nextPos = truck.path[0];
          const newPath = truck.path.slice(1);

          // Check if the truck is at a refueling station
          const atRefuelingStation = depots.some(
            (depot) => 
              depot.type === 'refueling' && 
              Math.abs(nextPos.x - depot.x) <= 2 && 
              Math.abs(nextPos.y - depot.y) <= 2
          );

          // Check if the truck is at a maintenance station
          const atMaintenanceStation = depots.some(
            (depot) => 
              depot.type === 'maintenance' && 
              Math.abs(nextPos.x - depot.x) <= 2 && 
              Math.abs(nextPos.y - depot.y) <= 2
          );

          // Update truck properties based on location
          let newFuel = truck.fuel - (Math.random() * 0.2 + 0.1); // Normal consumption between 0.1-0.3%
          let newMaintenance = truck.maintenance + (Math.random() * 0.15 + 0.05); // Normal increase 0.05-0.2%
          
          if (atRefuelingStation) {
            newFuel = Math.min(100, newFuel + 5); // Refuel when at station
          }
          
          if (atMaintenanceStation) {
            newMaintenance = Math.max(0, newMaintenance - 5); // Repair when at station
          }

          return {
            ...truck,
            x: nextPos.x,
            y: nextPos.y,
            path: newPath,
            lastMoved: now,
            fuel: Math.max(0, newFuel),
            maintenance: Math.min(100, newMaintenance),
          };
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, blockedCells, depots]);
  const handleStartSimulation = async (type: string, data: any) => {
    try {
      setSimulationData({ type, files: data });
      setSimulationState('running');
      setActiveTab('grid'); // Changed from 'map' to 'grid'
      
      toast.success(`Simulación ${getSimulationTypeLabel(type)} iniciada`);
      
      // Mock simulation completion after 30 seconds for demo
      setTimeout(() => {
        setSimulationResults({
          type,
          duration: '00:00:30',
          completedOrders: 157,
          delayedOrders: 23,
          efficiency: 87,
          fuelConsumption: 2500,
          vehiclesUsed: 15,
          totalVehicles: 20,
        });
        setSimulationState('completed');
        toast.success('Simulación completada');
      }, 30000);
      
    } catch (error) {
      console.error('Error starting simulation:', error);
      setSimulationState('error');
      toast.error('Error al iniciar la simulación');
    }
  };
  
  // Truck handling functions for the grid
  const handleTruckStateChange = (truckId: number, newState: TruckState) => {
    setTrucks((prevTrucks) =>
      prevTrucks.map((truck) =>
        truck.id === truckId ? { ...truck, state: newState } : truck
      )
    );
  };

  const handleSetTruckDestination = (truckId: number, x: number, y: number) => {
    setTrucks((prevTrucks) =>
      prevTrucks.map((truck) => {
        if (truck.id !== truckId) return truck;

        const path = findPath(
          { x: truck.x, y: truck.y },
          { x, y },
          blockedCells,
          { width: 50, height: 30 }
        );

        return {
          ...truck,
          path: path || [],
          destination: { x, y },
        };
      })
    );
  };
  
  const handleAddTruck = () => {
    if (trucks.length >= 20) return;

    const newTruck: Truck = {
      id: trucks.length + 1,
      x: Math.floor(Math.random() * 40) + 5,
      y: Math.floor(Math.random() * 25) + 5,
      state: "operational",
      direction: Math.floor(Math.random() * 4),
      speed: 1,
      lastMoved: Date.now(),
      path: [],
      fuel: Math.floor(Math.random() * 20) + 80, // 80-100% de combustible para el nuevo camión
      maintenance: 0, // Mantenimiento inicial en 0
      payload: 0, // Sin carga inicial
      maxCapacity: 10000, // Capacidad máxima de carga
    };
    setTrucks([...trucks, newTruck]);
  };

  const handleRemoveTruck = (truckId: number) => {
    setTrucks((prevTrucks) =>
      prevTrucks.filter((truck) => truck.id !== truckId)
    );
  };

  const handleSendTruckToStation = (truckId: number, stationType: 'refueling' | 'maintenance') => {
    const truck = trucks.find(t => t.id === truckId);
    if (!truck) return;

    // Encontrar la estación más cercana del tipo solicitado
    const targetStations = depots.filter(d => d.type === stationType);
    if (targetStations.length === 0) return;

    // Encuentra la estación más cercana
    let closestStation = targetStations[0];
    let minDistance = Math.abs(truck.x - targetStations[0].x) + Math.abs(truck.y - targetStations[0].y);
    
    for (let i = 1; i < targetStations.length; i++) {
      const distance = Math.abs(truck.x - targetStations[i].x) + Math.abs(truck.y - targetStations[i].y);
      if (distance < minDistance) {
        minDistance = distance;
        closestStation = targetStations[i];
      }
    }

    // Ajusta para llegar cerca de la estación (no exactamente sobre ella)
    const destination = { 
      x: closestStation.x + 1, // Posición adyacente al depot
      y: closestStation.y + 1
    };
    
    handleSetTruckDestination(truckId, destination.x, destination.y);
  };

  const handleResetSimulation = () => {
    setSimulationState('selection');
    setSimulationData(null);
    setSimulationResults(null);
    setActiveTab('map');
  };

  const getSimulationTypeLabel = (type: string) => {
    switch (type) {
      case 'daily': return 'Operación Día a Día';
      case 'weekly': return 'Simulación Semanal';
      case 'collapse': return 'Simulación Colapso';
      default: return 'Simulación';
    }
  };

  const getStateColor = (state: SimulationState) => {
    switch (state) {
      case 'selection': return 'bg-blue-100 text-blue-800';
      case 'running': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStateIcon = (state: SimulationState) => {
    switch (state) {
      case 'selection': return <Settings className="h-4 w-4" />;
      case 'running': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getStateLabel = (state: SimulationState) => {
    switch (state) {
      case 'selection': return 'Configuración';
      case 'running': return 'En ejecución';
      case 'completed': return 'Completada';
      case 'error': return 'Error';
      default: return 'Desconocido';
    }
  };

  if (simulationState === 'selection') {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Simulación de Logística GLP</h1>
          <p className="text-muted-foreground mt-2">
            Configure y ejecute simulaciones para optimizar las operaciones de distribución
          </p>
        </div>
        
        <SimulationSelection onStartSimulation={handleStartSimulation} />
      </div>
    );
  }

  if (simulationState === 'error') {
    return (
      <div className="container mx-auto p-4">
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Ha ocurrido un error durante la simulación. Por favor, intente nuevamente.
          </AlertDescription>
        </Alert>
        
        <Button onClick={handleResetSimulation}>
          Volver a configuración
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {simulationData ? getSimulationTypeLabel(simulationData.type) : 'Simulación'}
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor en tiempo real del progreso de la simulación
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge className={getStateColor(simulationState)}>
              {getStateIcon(simulationState)}
              <span className="ml-1">{getStateLabel(simulationState)}</span>
            </Badge>
            
            <Button 
              variant="outline" 
              onClick={handleResetSimulation}
              disabled={simulationState === 'running'}
            >
              Nueva Simulación
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Quick Stats */}
        {simulationState === 'running' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tiempo transcurrido</p>
                    <p className="text-2xl font-bold">00:15:32</p>
                  </div>
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pedidos procesados</p>
                    <p className="text-2xl font-bold">89</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Vehículos activos</p>
                    <p className="text-2xl font-bold">12/15</p>
                  </div>
                  <Play className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Eficiencia</p>
                    <p className="text-2xl font-bold">94%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3"> {/* Changed from grid-cols-4 to grid-cols-3 */}
            <TabsTrigger value="grid" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Grid Logístico</span>
            </TabsTrigger>
            <TabsTrigger value="controls" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Controles</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Resultados</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Removed the "map" TabsContent component */}
          
          <TabsContent value="grid" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <SimulationGridSystem
                  trucks={trucks}
                  blockedCells={blockedCells}
                  onTruckSelect={setSelectedTruckId}
                  onSetDestination={(x, y) => selectedTruckId !== null && handleSetTruckDestination(selectedTruckId, x, y)}
                  selectedTruckId={selectedTruckId !== null ? selectedTruckId : undefined}
                  depots={depots}
                />
              </div>

              <div className="space-y-4">
                <SimulationControlPanel
                  isRunning={isRunning}
                  onToggleRunning={() => setIsRunning(!isRunning)}
                  onAddTruck={handleAddTruck}
                  trucksCount={trucks.length}
                  maxTrucks={20}
                />

                {/* Estadísticas de la flota */}
                <div className="bg-white rounded-xl shadow-lg p-4">
                  <h3 className="font-medium mb-2 text-slate-800">Estadísticas de Flota</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-green-50 p-2 rounded-md">
                      <div className="text-xs text-green-700">Operativos</div>
                      <div className="text-xl font-bold text-green-600">
                        {trucks.filter(t => t.state === "operational").length}
                      </div>
                    </div>
                    <div className="bg-yellow-50 p-2 rounded-md">
                      <div className="text-xs text-yellow-700">En mantenimiento</div>
                      <div className="text-xl font-bold text-yellow-600">
                        {trucks.filter(t => t.state === "maintenance").length}
                      </div>
                    </div>
                    <div className="bg-red-50 p-2 rounded-md">
                      <div className="text-xs text-red-700">Averiados</div>
                      <div className="text-xl font-bold text-red-600">
                        {trucks.filter(t => t.state === "broken").length}
                      </div>
                    </div>
                    <div className="bg-blue-50 p-2 rounded-md">
                      <div className="text-xs text-blue-700">Combustible promedio</div>
                      <div className="text-xl font-bold text-blue-600">
                        {trucks.length ? Math.round(trucks.reduce((sum, t) => sum + (t.fuel || 0), 0) / trucks.length) : 0}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detalles del camión seleccionado */}
                {selectedTruckId && (
                  <div className="bg-white rounded-xl shadow-lg p-4">
                    <h3 className="font-medium mb-2 text-slate-800">
                      Camión #{selectedTruckId}
                    </h3>
                    
                    {(() => {
                      const truck = trucks.find(t => t.id === selectedTruckId);
                      if (!truck) return <p>No seleccionado</p>;
                      
                      return (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <div className="text-xs text-slate-500">Estado</div>
                              <div className={`font-medium ${
                                truck.state === 'operational' ? 'text-green-600' : 
                                truck.state === 'maintenance' ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {truck.state === 'operational' ? 'Operativo' : 
                                 truck.state === 'maintenance' ? 'En mantenimiento' : 'Averiado'}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500">Posición</div>
                              <div className="font-medium">X: {truck.x}, Y: {truck.y}</div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500">Combustible</div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                <div 
                                  className={`h-2.5 rounded-full ${truck.fuel > 30 ? 'bg-green-500' : 'bg-red-500'}`}
                                  style={{ width: `${truck.fuel}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-right mt-1">{truck.fuel}%</div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500">Mantenimiento</div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                <div 
                                  className={`h-2.5 rounded-full ${truck.maintenance < 70 ? 'bg-green-500' : 'bg-yellow-500'}`}
                                  style={{ width: `${truck.maintenance}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-right mt-1">{truck.maintenance}%</div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <button 
                              className="bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded flex items-center"
                              onClick={() => handleSendTruckToStation(truck.id, 'refueling')}
                            >
                              <span className="mr-1">⛽</span> Ir a Repostar
                            </button>
                            <button 
                              className="bg-purple-500 hover:bg-purple-600 text-white text-xs py-1 px-2 rounded flex items-center"
                              onClick={() => handleSendTruckToStation(truck.id, 'maintenance')}
                            >
                              <span className="mr-1">🔧</span> Ir a Mantenimiento
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <SimulationTruckStatus
                  trucks={trucks}
                  onStateChange={handleTruckStateChange}
                  onRemoveTruck={handleRemoveTruck}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="controls" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <SimulationControls simulationData={simulationData} />
              </div>
              
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuración de Simulación</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Archivos cargados</h4>
                        <div className="space-y-2">
                          {simulationData?.files.pedidos && (
                            <div className="flex items-center justify-between p-2 bg-muted rounded">
                              <span className="text-sm">📄 {simulationData.files.pedidos}</span>
                              <Badge variant="outline">Pedidos</Badge>
                            </div>
                          )}
                          {simulationData?.files.bloqueos && (
                            <div className="flex items-center justify-between p-2 bg-muted rounded">
                              <span className="text-sm">📄 {simulationData.files.bloqueos}</span>
                              <Badge variant="outline">Bloqueos</Badge>
                            </div>
                          )}
                          {simulationData?.files.averias && (
                            <div className="flex items-center justify-between p-2 bg-muted rounded">
                              <span className="text-sm">📄 {simulationData.files.averias}</span>
                              <Badge variant="outline">Averías</Badge>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Parámetros</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Tipo:</span>
                            <span className="ml-2 font-medium">
                              {simulationData ? getSimulationTypeLabel(simulationData.type) : 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Velocidad:</span>
                            <span className="ml-2 font-medium">1x</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results" className="mt-6">
            {simulationState === 'completed' && simulationResults ? (
              <SimulationResults results={simulationResults} />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Resultados no disponibles</h3>
                  <p className="text-muted-foreground">
                    {simulationState === 'running' 
                      ? 'Los resultados se mostrarán cuando la simulación termine.'
                      : 'Ejecute una simulación para ver los resultados.'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}