import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Clock, MapPin } from "lucide-react"

interface SimulationOrdersViewProps {
  simulationData: any
}

export function SimulationOrdersView({ simulationData }: SimulationOrdersViewProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid gap-4">
          {/* Lista de pedidos */}
          {[1, 2, 3].map((order) => (
            <div key={order} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Package className="h-8 w-8 text-muted-foreground" />
                <div>
                  <div className="font-medium">Pedido #{order}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>San Isidro, Lima</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>15:30</span>
                </div>
                <Badge>En proceso</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
