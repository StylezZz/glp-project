"use client";

import { RoutesHeader } from "@/components/routes/routes-header";
import { RouteMap } from "@/components/routes/route-map";
import { RouteControls } from "@/components/routes/route-controls";
import { useState } from "react";

interface SimulationData {
  route: Array<{ x: number; y: number }>;
  customer: { x: number; y: number; name: string };
  startTime: string;
}

export function RoutePlanning() {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null);
  // Generar ruta sintética (esto será reemplazado por API)
  const generateSyntheticRoute = (): SimulationData => {
    const customer = { x: 25, y: 15, name: "Cliente Inicial" }; // Cliente ejemplo

    // Ruta completa paso a paso
    const route = [
      // Inicio en almacén central
      { x: 12, y: 8 },

      // Ruta de ida (almacén -> cliente): primero horizontal, luego vertical
      { x: 13, y: 8 },
      { x: 14, y: 8 },
      { x: 15, y: 8 },
      { x: 16, y: 8 },
      { x: 17, y: 8 },
      { x: 18, y: 8 },
      { x: 19, y: 8 },
      { x: 20, y: 8 },
      { x: 21, y: 8 },
      { x: 22, y: 8 },
      { x: 23, y: 8 },
      { x: 24, y: 8 },
      { x: 25, y: 8 }, // Llegamos a la X del cliente

      // Ahora vertical hacia el cliente
      { x: 25, y: 9 },
      { x: 25, y: 10 },
      { x: 25, y: 11 },
      { x: 25, y: 12 },
      { x: 25, y: 13 },
      { x: 25, y: 14 },
      { x: 25, y: 15 }, // Llegada al cliente

      // Pausa en el cliente (entrega) - 3 pasos adicionales
      { x: 25, y: 15 },
      { x: 25, y: 15 },
      { x: 25, y: 15 },

      // Ruta de vuelta (cliente -> almacén): primero vertical, luego horizontal
      { x: 25, y: 14 },
      { x: 25, y: 13 },
      { x: 25, y: 12 },
      { x: 25, y: 11 },
      { x: 25, y: 10 },
      { x: 25, y: 9 },
      { x: 25, y: 8 },

      // Ahora horizontal hacia el almacén
      { x: 24, y: 8 },
      { x: 23, y: 8 },
      { x: 22, y: 8 },
      { x: 21, y: 8 },
      { x: 20, y: 8 },
      { x: 19, y: 8 },
      { x: 18, y: 8 },
      { x: 17, y: 8 },
      { x: 16, y: 8 },
      { x: 15, y: 8 },
      { x: 14, y: 8 },
      { x: 13, y: 8 },
      { x: 12, y: 8 }, // Regreso al almacén central
    ];

    return {
      route,
      customer,
      startTime: "00:00:00",
    };
  };

  const handleOptimizationStart = () => {
    setIsOptimizing(true);

    // Simular tiempo de optimización (2 segundos)
    setTimeout(() => {
      const routeData = generateSyntheticRoute();
      setSimulationData(routeData);
      setIsOptimizing(false); // La optimización terminó, ahora empieza la simulación
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <RoutesHeader />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <RouteControls onOptimizationStart={handleOptimizationStart} isOptimizing={isOptimizing} />
        <div className="lg:col-span-3">
          <RouteMap
            simulationData={simulationData}
            isOptimizing={isOptimizing}
            onOptimizationStart={handleOptimizationStart}
          />
        </div>
      </div>
    </div>
  );
}
