"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Truck, TruckState } from "@/types/logistics"
import { Wrench, AlertTriangle, CheckCircle, X } from "lucide-react"

interface SimulationTruckStatusProps {
  trucks: Truck[]
  onStateChange: (truckId: number, newState: TruckState) => void
  onRemoveTruck: (truckId: number) => void
}

export function SimulationTruckStatus({ trucks, onStateChange, onRemoveTruck }: SimulationTruckStatusProps) {
  const getStateIcon = (state: TruckState) => {
    switch (state) {
      case "operational":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "maintenance":
        return <Wrench className="w-4 h-4 text-yellow-500" />
      case "broken":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
    }
  }

  const getStateColor = (state: TruckState) => {
    switch (state) {
      case "operational":
        return "bg-green-100 text-green-800"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800"
      case "broken":
        return "bg-red-100 text-red-800"
    }
  }

  const getStateLabel = (state: TruckState) => {
    switch (state) {
      case "operational":
        return "Operativo"
      case "maintenance":
        return "Mantenimiento"
      case "broken":
        return "Averiado"
    }
  }

  const operationalCount = trucks.filter((t) => t.state === "operational").length
  const maintenanceCount = trucks.filter((t) => t.state === "maintenance").length
  const brokenCount = trucks.filter((t) => t.state === "broken").length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado de Camiones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{operationalCount}</div>
            <div className="text-xs text-green-600">Operativos</div>
          </div>
          <div className="p-2 bg-yellow-50 rounded-lg">
            <div className="text-lg font-bold text-yellow-600">{maintenanceCount}</div>
            <div className="text-xs text-yellow-600">Mantenimiento</div>
          </div>
          <div className="p-2 bg-red-50 rounded-lg">
            <div className="text-lg font-bold text-red-600">{brokenCount}</div>
            <div className="text-xs text-red-600">Averiados</div>
          </div>
        </div>

        {/* Truck list */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {trucks.map((truck) => (
            <div key={truck.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                {getStateIcon(truck.state)}
                <span className="font-medium">Camión {truck.id}</span>
                <Badge className={getStateColor(truck.state)}>{getStateLabel(truck.state)}</Badge>
              </div>

              <div className="flex items-center gap-1">
                <select
                  value={truck.state}
                  onChange={(e) => onStateChange(truck.id, e.target.value as TruckState)}
                  className="text-xs border rounded px-1 py-0.5"
                >
                  <option value="operational">Operativo</option>
                  <option value="maintenance">Mantenimiento</option>
                  <option value="broken">Averiado</option>
                </select>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemoveTruck(truck.id)}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
