"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Pause, Plus, Truck } from "lucide-react"

interface ControlPanelProps {
  isRunning: boolean
  onToggleRunning: () => void
  onAddTruck: () => void
  trucksCount: number
  maxTrucks: number
}

export function ControlPanel({ isRunning, onToggleRunning, onAddTruck, trucksCount, maxTrucks }: ControlPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Panel de Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          <Button onClick={onToggleRunning} variant={isRunning ? "destructive" : "default"} className="w-full">
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pausar Simulación
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Iniciar Simulación
              </>
            )}
          </Button>

          <Button onClick={onAddTruck} disabled={trucksCount >= maxTrucks} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Camión
          </Button>
        </div>

        <div className="text-sm text-slate-600 space-y-1">
          <div className="flex justify-between">
            <span>Camiones activos:</span>
            <span className="font-semibold">
              {trucksCount}/{maxTrucks}
            </span>
          </div>
          <div className="text-xs text-slate-500">Haz clic en la grilla para agregar/quitar bloqueos</div>
        </div>
      </CardContent>
    </Card>
  )
}
