import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SimulationDataViewProps {
  simulationData: any
}

export function SimulationDataView({ simulationData }: SimulationDataViewProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Estadísticas de rendimiento */}
          <div className="space-y-2">
            <h3 className="font-medium">Rendimiento</h3>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Eficiencia de entregas:</span>
                <Badge variant="outline">95%</Badge>
              </div>
              <div className="flex justify-between">
                <span>Tiempo promedio:</span>
                <Badge variant="outline">45 min</Badge>
              </div>
            </div>
          </div>

          {/* Métricas de combustible */}
          <div className="space-y-2">
            <h3 className="font-medium">Consumo Combustible</h3>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Total consumido:</span>
                <Badge variant="outline">2500 L</Badge>
              </div>
              <div className="flex justify-between">
                <span>Promedio por ruta:</span>
                <Badge variant="outline">12.5 L</Badge>
              </div>
            </div>
          </div>

          {/* Indicadores operativos */}
          <div className="space-y-2">
            <h3 className="font-medium">Operaciones</h3>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Rutas completadas:</span>
                <Badge variant="outline">156</Badge>
              </div>
              <div className="flex justify-between">
                <span>Reabastecimientos:</span>
                <Badge variant="outline">23</Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
