"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

// Datos simulados por día para pedidos
const orderData = [
  { day: 1, completados: 24, enTiempo: 20, retrasados: 4, cancelados: 1 },
  { day: 2, completados: 26, enTiempo: 22, retrasados: 3, cancelados: 2 },
  { day: 3, completados: 22, enTiempo: 20, retrasados: 2, cancelados: 0 },
  { day: 4, completados: 28, enTiempo: 25, retrasados: 3, cancelados: 1 },
  { day: 5, completados: 25, enTiempo: 23, retrasados: 2, cancelados: 0 },
  { day: 6, completados: 18, enTiempo: 15, retrasados: 3, cancelados: 1 },
  { day: 7, completados: 20, enTiempo: 18, retrasados: 2, cancelados: 0 },
]

// Datos más detallados de vehículos para la tabla expandida
const detailedVehicleData = [
  { 
    id: "V001", 
    entregas: 42, 
    combustible: 328, 
    utilizacion: 68, 
    mantenimiento: 0,
    conductorAsignado: "Juan Pérez",
    capacidadTanque: 500,
    ultimoMantenimiento: "2023-10-15",
    kmRecorridos: 845,
    estado: "Operativo",
    tipoVehiculo: "Camión Cisterna",
    pedidosAsignados: [
      { codigo: "P001", cliente: "Distribuidora Norte", estado: "Entregado", tiempo: "40 min" },
      { codigo: "P012", cliente: "Gas Industrial SA", estado: "Entregado", tiempo: "35 min" },
      { codigo: "P023", cliente: "Residencial Torres", estado: "Entregado", tiempo: "45 min" },
    ]
  },
  { 
    id: "V002", 
    entregas: 38, 
    combustible: 302, 
    utilizacion: 62, 
    mantenimiento: 1,
    conductorAsignado: "Miguel Rojas",
    capacidadTanque: 450,
    ultimoMantenimiento: "2023-11-02",
    kmRecorridos: 782,
    estado: "En Mantenimiento",
    tipoVehiculo: "Camión Cisterna",
    pedidosAsignados: [
      { codigo: "P005", cliente: "Comercial Este", estado: "Entregado", tiempo: "42 min" },
      { codigo: "P019", cliente: "Restaurantes Unidos", estado: "Retrasado", tiempo: "65 min" },
      { codigo: "P027", cliente: "Hospital Central", estado: "Entregado", tiempo: "38 min" },
    ]
  },
  { 
    id: "V003", 
    entregas: 45, 
    combustible: 345, 
    utilizacion: 73, 
    mantenimiento: 0,
    conductorAsignado: "Ana Mendoza",
    capacidadTanque: 500,
    ultimoMantenimiento: "2023-10-28",
    kmRecorridos: 912,
    estado: "Operativo",
    tipoVehiculo: "Camión Cisterna Grande",
    pedidosAsignados: [
      { codigo: "P008", cliente: "Fábrica Industrial", estado: "Entregado", tiempo: "37 min" },
      { codigo: "P014", cliente: "Condominio Las Palmas", estado: "Entregado", tiempo: "41 min" },
      { codigo: "P031", cliente: "Centro Comercial Plaza", estado: "Entregado", tiempo: "39 min" },
    ]
  },
  { 
    id: "V004", 
    entregas: 32, 
    combustible: 284, 
    utilizacion: 58, 
    mantenimiento: 2,
    conductorAsignado: "Carlos Benítez",
    capacidadTanque: 400,
    ultimoMantenimiento: "2023-11-05",
    kmRecorridos: 621,
    estado: "En Mantenimiento",
    tipoVehiculo: "Camión Cisterna Mediano",
    pedidosAsignados: [
      { codigo: "P003", cliente: "Residencial Sur", estado: "Retrasado", tiempo: "58 min" },
      { codigo: "P022", cliente: "Hotel Los Pinos", estado: "Entregado", tiempo: "43 min" },
      { codigo: "P029", cliente: "Estación de Servicio", estado: "Cancelado", tiempo: "N/A" },
    ]
  },
]

export function SimulationResults() {
  const [searchOrderTerm, setSearchOrderTerm] = useState("");
  const [searchVehicleTerm, setSearchVehicleTerm] = useState("");

  // Filtrar pedidos basados en el término de búsqueda
  const filteredOrders = orderData.filter(order =>
    Object.values(order).some(value =>
      String(value).toLowerCase().includes(searchOrderTerm.toLowerCase())
    )
  );

  // Filtrar vehículos basados en el término de búsqueda
  const filteredVehicles = detailedVehicleData.filter(vehicle =>
    Object.values(vehicle).some(value =>
      String(value).toLowerCase().includes(searchVehicleTerm.toLowerCase())
    )
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resultados de la Simulación</CardTitle>
        <CardDescription>Análisis de los resultados de la simulación logística</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="leyenda">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="leyenda">Leyenda</TabsTrigger>
            <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
            <TabsTrigger value="vehiculos">Vehículos</TabsTrigger>
          </TabsList>

          {/* Tab de Leyenda */}
          <TabsContent value="leyenda" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card className="p-6">
                <div className="text-lg font-bold mb-4">Estado de Pedidos</div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-[#16a34a] mr-2"></div>
                    <div>En Tiempo: Pedidos entregados dentro del plazo estimado</div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-[#f59e0b] mr-2"></div>
                    <div>Retrasados: Pedidos entregados después del plazo estimado</div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-[#ef4444] mr-2"></div>
                    <div>Cancelados: Pedidos que no pudieron ser completados</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="text-lg font-bold mb-4">Métricas de Vehículos</div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-[#3b82f6] mr-2"></div>
                    <div>Entregas: Número total de pedidos completados</div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-[#8b5cf6] mr-2"></div>
                    <div>Combustible: Litros de combustible utilizados</div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-[#ec4899] mr-2"></div>
                    <div>Utilización: Porcentaje de tiempo en actividad</div>
                  </div>
                </div>
              </Card>
            </div>
            
            <Card className="p-6">
              <div className="text-lg font-bold mb-4">Resumen General de la Simulación</div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-muted p-4">
                  <div className="text-sm font-medium">Total Pedidos</div>
                  <div className="mt-2 text-2xl font-bold">167</div>
                  <div className="text-xs text-muted-foreground">En 7 días de operación</div>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <div className="text-sm font-medium">Tasa de Entrega</div>
                  <div className="mt-2 text-2xl font-bold">97%</div>
                  <div className="text-xs text-muted-foreground">Pedidos completados vs. solicitados</div>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <div className="text-sm font-medium">Eficiencia Global</div>
                  <div className="mt-2 text-2xl font-bold">65.3%</div>
                  <div className="text-xs text-muted-foreground">Utilización de recursos</div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Tab de Pedidos */}
          <TabsContent value="pedidos" className="space-y-4 pt-4">
            <div className="flex items-center border rounded-md px-3 mb-4 bg-white">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Buscar pedidos..."
                value={searchOrderTerm}
                onChange={(e) => setSearchOrderTerm(e.target.value)}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">Día</th>
                    <th className="px-4 py-2 text-left">Completados</th>
                    <th className="px-4 py-2 text-left">En Tiempo</th>
                    <th className="px-4 py-2 text-left">Retrasados</th>
                    <th className="px-4 py-2 text-left">Cancelados</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-2">{order.day}</td>
                      <td className="px-4 py-2">{order.completados}</td>
                      <td className="px-4 py-2">{order.enTiempo}</td>
                      <td className="px-4 py-2">{order.retrasados}</td>
                      <td className="px-4 py-2">{order.cancelados}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredOrders.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No se encontraron pedidos con los criterios de búsqueda.
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab de Vehículos */}
          <TabsContent value="vehiculos" className="space-y-4 pt-4">
            <div className="flex items-center border rounded-md px-3 mb-4 bg-white">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Buscar vehículos..."
                value={searchVehicleTerm}
                onChange={(e) => setSearchVehicleTerm(e.target.value)}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">ID Vehículo</th>
                    <th className="px-4 py-2 text-left">Conductor</th>
                    <th className="px-4 py-2 text-left">Tipo</th>
                    <th className="px-4 py-2 text-left">Entregas</th>
                    <th className="px-4 py-2 text-left">Combustible</th>
                    <th className="px-4 py-2 text-left">Utilización</th>
                    <th className="px-4 py-2 text-left">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-2">{vehicle.id}</td>
                      <td className="px-4 py-2">{vehicle.conductorAsignado}</td>
                      <td className="px-4 py-2">{vehicle.tipoVehiculo}</td>
                      <td className="px-4 py-2">{vehicle.entregas}</td>
                      <td className="px-4 py-2">{vehicle.combustible} L</td>
                      <td className="px-4 py-2">{vehicle.utilizacion}%</td>
                      <td className="px-4 py-2">{vehicle.estado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredVehicles.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No se encontraron vehículos con los criterios de búsqueda.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

