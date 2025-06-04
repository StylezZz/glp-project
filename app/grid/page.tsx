/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { GridSystem } from "@/components/trucks/grid-system";
import { ControlPanel } from "@/components/trucks/control-panel";
import { TruckStatus } from "@/components/trucks/trucks-status";
import type { Truck, TruckState } from "@/types/logistics";
import { findPath } from "@/lib/pathfinding";

export default function LogisticsSystem() {
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
  }, []);  // Update the movement logic in your useEffect
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

  const toggleBlockedCell = (x: number, y: number) => {
    const cellKey = `${x}-${y}`;
    setBlockedCells((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cellKey)) {
        newSet.delete(cellKey);
      } else {
        newSet.add(cellKey);
      }
      return newSet;
    });
  };
  // Stats calculation for dashboard
  const stats = {
    operational: trucks.filter(t => t.state === "operational").length,
    maintenance: trucks.filter(t => t.state === "maintenance").length,
    broken: trucks.filter(t => t.state === "broken").length,
    avgFuel: trucks.length ? Math.round(trucks.reduce((sum, t) => sum + (t.fuel || 0), 0) / trucks.length) : 0,
    avgMaintenance: trucks.length ? Math.round(trucks.reduce((sum, t) => sum + (t.maintenance || 0), 0) / trucks.length) : 0,
  };

  // Función para acercar un camión a una estación de combustible o mantenimiento
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-800">
            Sistema de Gestión Logística
          </h1>
          <p className="text-slate-600">
            Monitoreo y control de flota de camiones en tiempo real
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <GridSystem
              trucks={trucks}
              blockedCells={blockedCells}
              onCellClick={toggleBlockedCell}
              onTruckSelect={setSelectedTruckId}              onSetDestination={(x, y) => selectedTruckId !== null && handleSetTruckDestination(selectedTruckId, x, y)}
              selectedTruckId={selectedTruckId !== null ? selectedTruckId : undefined}
              depots={depots}
            />
          </div>

          <div className="space-y-4">
            <ControlPanel
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
                  <div className="text-xl font-bold text-green-600">{stats.operational}</div>
                </div>
                <div className="bg-yellow-50 p-2 rounded-md">
                  <div className="text-xs text-yellow-700">En mantenimiento</div>
                  <div className="text-xl font-bold text-yellow-600">{stats.maintenance}</div>
                </div>
                <div className="bg-red-50 p-2 rounded-md">
                  <div className="text-xs text-red-700">Averiados</div>
                  <div className="text-xl font-bold text-red-600">{stats.broken}</div>
                </div>
                <div className="bg-blue-50 p-2 rounded-md">
                  <div className="text-xs text-blue-700">Combustible promedio</div>
                  <div className="text-xl font-bold text-blue-600">{stats.avgFuel}%</div>
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

            <TruckStatus
              trucks={trucks}
              onStateChange={handleTruckStateChange}
              onRemoveTruck={handleRemoveTruck}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
