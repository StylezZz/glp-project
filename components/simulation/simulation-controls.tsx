/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Search, Truck, Package } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SimulationControlsProps {
  simulationData?: any;
}

export function SimulationControls({
  simulationData,
}: SimulationControlsProps) {
  const [isRunning, setIsRunning] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterType, setFilterType] = React.useState("all");

  const simulationStats = {
    refillTanks: [
      { id: 1, capacity: 100, currentLevel: 75, location: "Norte" },
      { id: 2, capacity: 100, currentLevel: 45, location: "Centro" },
      { id: 3, capacity: 100, currentLevel: 15, location: "Sur" },
    ],
    trucks: {
      total: 12,
      inRoute: 5,
      available: 4,
      maintenance: 3,
      broken: 2,
    },
    orders: {
      total: 45,
      inProgress: 15,
      delayed: 3,
      completed: 27,
    },
    trucksData: [
      { id: 1, name: "Camión 1", fuelLevel: 80, status: "En ruta" },
      { id: 2, name: "Camión 2", fuelLevel: 50, status: "Disponible" },
      { id: 3, name: "Camión 3", fuelLevel: 20, status: "En mantenimiento" },
    ],
  };

  const getTankLevelColor = (current: number, capacity: number) => {
    const level = (current / capacity) * 100;
    if (level <= 20) return "bg-red-100 text-red-800";
    if (level <= 40) return "bg-yellow-100 text-yellow-800";
    return "bg-emerald-100 text-emerald-800";
  };

  const handleRunSimulation = () => {
    setIsRunning(true);
    toast("Simulación iniciada");
  };

  const handlePauseSimulation = () => {
    setIsRunning(false);
    toast("Simulación pausada");
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Monitor de Simulación</CardTitle>
            <CardDescription>
              Estado actual de la simulación en tiempo real
            </CardDescription>
          </div>
          <Badge
            variant={isRunning ? "default" : "outline"}
            className="bg-primary/10"
          >
            {isRunning ? "En ejecución" : "Detenido"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="vehicles">Vehículos</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="flex flex-col gap-4">
              {/* Tanques de Combustible */}
              <div className="space-y-2 p-4 border rounded-lg shadow-sm">
                <h3 className="text-sm font-semibold text-primary">
                  Estado de Tanques
                </h3>
                <div className="space-y-3">
                  {simulationStats.refillTanks.map((tank) => (
                    <div key={tank.id} className="space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium">{tank.location}</span>
                        <span
                          className={`${getTankLevelColor(
                            tank.currentLevel,
                            tank.capacity
                          )} px-2 py-1 rounded-md`}
                        >
                          {tank.currentLevel}/{tank.capacity}m³
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full">
                        <div
                          className={`h-2 rounded-full transition-all ${getTankLevelColor(
                            tank.currentLevel,
                            tank.capacity
                          )}`}
                          style={{
                            width: `${
                              (tank.currentLevel / tank.capacity) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estado de Flota */}
              <div className="space-y-2 p-4 border rounded-lg">
                <h3 className="text-sm font-medium">Estado de Flota</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 border rounded-md">
                      <div className="text-sm text-muted-foreground">Total</div>
                      <div className="text-xl font-bold">
                        {simulationStats.trucks.total}
                      </div>
                    </div>
                    <div className="p-2 border rounded-md">
                      <div className="text-sm text-muted-foreground">
                        En Ruta
                      </div>
                      <div className="text-xl font-bold">
                        {simulationStats.trucks.inRoute}
                      </div>
                    </div>
                    <div className="p-2 border rounded-md">
                      <div className="text-sm text-muted-foreground">
                        Disponibles
                      </div>
                      <div className="text-xl font-bold">
                        {simulationStats.trucks.available}
                      </div>
                    </div>
                    <div className="p-2 border rounded-md">
                      <div className="text-sm text-muted-foreground">
                        En Mantenimiento
                      </div>
                      <div className="text-xl font-bold">
                        {simulationStats.trucks.maintenance}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estado de Pedidos */}
              <div className="space-y-2 p-4 border rounded-lg">
                <h3 className="text-sm font-medium">Estado de Pedidos</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 border rounded-md">
                      <div className="text-sm text-muted-foreground">Total</div>
                      <div className="text-xl font-bold">
                        {simulationStats.orders.total}
                      </div>
                    </div>
                    <div className="p-2 border rounded-md">
                      <div className="text-sm text-muted-foreground">
                        En Proceso
                      </div>
                      <div className="text-xl font-bold">
                        {simulationStats.orders.inProgress}
                      </div>
                    </div>
                    <div className="p-2 border rounded-md bg-yellow-50">
                      <div className="text-sm text-muted-foreground">
                        Retrasados
                      </div>
                      <div className="text-xl font-bold text-yellow-600">
                        {simulationStats.orders.delayed}
                      </div>
                    </div>
                    <div className="p-2 border rounded-md bg-green-50">
                      <div className="text-sm text-muted-foreground">
                        Completados
                      </div>
                      <div className="text-xl font-bold text-green-600">
                        {simulationStats.orders.completed}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="vehicles" className="space-y-4 mt-4">
            <Input
              placeholder="Buscar vehículo..."
              className="w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {simulationStats.trucksData
                .filter((truck) =>
                  truck.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((truck) => (
                  <div
                    key={truck.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{truck.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Combustible: {truck.fuelLevel}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Estado: {truck.status}
                        </div>
                      </div>
                    </div>
                    <Badge
                      className={`${
                        truck.status === "En ruta"
                          ? "bg-blue-100 text-blue-800"
                          : truck.status === "Disponible"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {truck.status}
                    </Badge>
                  </div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4 mt-4">
            <Input
              placeholder="Buscar pedido..."
              className="w-full"
              icon={<Search className="h-4 w-4" />}
            />
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {[1, 2, 3].map((order) => (
                <div
                  key={order}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Pedido #{order}</div>
                      <div className="text-sm text-muted-foreground">
                        Cliente: ABC Corp
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">En proceso</Badge>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
