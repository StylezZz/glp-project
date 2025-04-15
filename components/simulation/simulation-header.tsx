"use client"

import { Button } from "@/components/ui/button"
import { Play, Pause, SkipBack, SkipForward, StepBack, StepForward } from "lucide-react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface SimulationHeaderProps {
  simulationType?: string | null
}

export function SimulationHeader({ simulationType }: SimulationHeaderProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const getSimulationTypeLabel = () => {
    switch (simulationType) {
      case "daily":
        return "Operación Día a Día"
      case "weekly":
        return "Simulación Semanal"
      case "collapse":
        return "Simulación Colapso"
      default:
        return "Simulación"
    }
  }

  const simulationStats = {
    refillTanks: [
      { id: 1, capacity: 100, currentLevel: 75, location: "Norte" },
      { id: 2, capacity: 100, currentLevel: 45, location: "Centro" },
      { id: 3, capacity: 100, currentLevel: 15, location: "Sur" }
    ],
    orders: {
      delivered: 25,
      inProgress: 8,
      delayed: 3
    },
    trucks: {
      total: 12,
      inRoute: 5,
      breakdown: 2,
      maintenance: 1,
      available: 4
    }
  }

  const getTankLevelColor = (current: number, capacity: number) => {
    const level = (current / capacity) * 100
    if (level <= 20) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    if (level <= 40) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
  }

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          {/* Tiempo y tipo */}
          <div className="space-y-2">
            <div>
              <span className="text-muted-foreground">Fecha inicio:</span>
              <div className="font-medium">1/10/2023</div>
            </div>
            <div>
              <span className="text-muted-foreground">Simulación:</span>
              <div className="font-medium flex items-center gap-2">
                <span>01d 15h 46m</span>
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  {getSimulationTypeLabel()}
                </Badge>
              </div>
            </div>
          </div>

          {/* Estado de camiones */}
          <div>
            <span className="text-muted-foreground">Estado de Camiones:</span>
            <div className="flex flex-col gap-2 mt-1">
              <Badge variant="outline" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                <span className="mr-1 font-bold">{simulationStats.trucks.available}/{simulationStats.trucks.total}</span>
                <span className="text-xs">Disponibles</span>
              </Badge>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                <span className="mr-1 font-bold">{simulationStats.trucks.inRoute}</span>
                <span className="text-xs">En ruta</span>
              </Badge>
              <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                <span className="mr-1 font-bold">{simulationStats.trucks.breakdown}</span>
                <span className="text-xs">En avería</span>
              </Badge>
              <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                <span className="mr-1 font-bold">{simulationStats.trucks.maintenance}</span>
                <span className="text-xs">En mantenimiento</span>
              </Badge>
            </div>
          </div>

          {/* Estado de tanques reabastecedores */}
          <div>
            <span className="text-muted-foreground">Tanques Reabastecedores:</span>
            <div className="flex flex-col gap-2 mt-1">
              {simulationStats.refillTanks.map(tank => (
                <Badge 
                  key={tank.id}
                  variant="outline" 
                  className={getTankLevelColor(tank.currentLevel, tank.capacity)}
                >
                  <span className="mr-1 font-bold">{tank.currentLevel}/{tank.capacity}m³</span>
                  <span className="text-xs">Tanque {tank.location}</span>
                </Badge>
              ))}
            </div>
          </div>

          {/* Estado de pedidos */}
          <div>
            <span className="text-muted-foreground">Estado de Pedidos:</span>
            <div className="flex flex-col gap-2 mt-1">
              <Badge variant="outline" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                <span className="mr-1 font-bold">{simulationStats.orders.delivered}</span>
                <span className="text-xs">Entregados</span>
              </Badge>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                <span className="mr-1 font-bold">{simulationStats.orders.inProgress}</span>
                <span className="text-xs">En camino</span>
              </Badge>
              <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                <span className="mr-1 font-bold">{simulationStats.orders.delayed}</span>
                <span className="text-xs">Con retraso</span>
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
