import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Truck, Tool, AlertCircle } from "lucide-react"

interface SimulationVehiclesViewProps {
  simulationData: any
}

export function SimulationVehiclesView({ simulationData }: SimulationVehiclesViewProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid gap-4">
          {/* Lista de vehículos */}
          {[1, 2, 3].map((vehicle) => (
            <div key={vehicle} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Truck className="h-8 w-8 text-muted-foreground" />
                <div>
                  <div className="font-medium">Vehículo #{vehicle}</div>
                  <div className="text-sm text-muted-foreground">Capacidad: 1000L</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <div>Combustible: 75%</div>
                  <div>Última mantención: 2d</div>
                </div>
                <Badge className="bg-green-100 text-green-800">En ruta</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
