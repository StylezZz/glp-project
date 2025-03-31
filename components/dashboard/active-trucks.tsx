"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Truck } from "lucide-react";
import Link from "next/link";

const trucks = [
  {
    id: "TRK-001",
    driver: "John Smith",
    capacity: "20m³",
    status: "En Ruta",
    location: "Sector A-5",
  },
  {
    id: "TRK-002",
    driver: "Maria Garcia",
    capacity: "15m³",
    status: "Cargando",
    location: "Planta Principal",
  },
  {
    id: "TRK-003",
    driver: "Robert Chen",
    capacity: "25m³",
    status: "Entregando",
    location: "Sector C-2",
  },
  {
    id: "TRK-004",
    driver: "Sarah Johnson",
    capacity: "10m³",
    status: "Regresando",
    location: "Sector B-7",
  },
  {
    id: "TRK-005",
    driver: "David Kim",
    capacity: "18m³",
    status: "Mantenimiento",
    location: "Depósito",
  },
];

export function ActiveTrucks() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Flota Activa</CardTitle>
          <CardDescription>Estado actual de los camiones</CardDescription>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="/fleet">
            <Truck className="mr-2 h-4 w-4" />
            Gestionar Flota
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-5 text-xs font-medium text-muted-foreground">
            <div>ID del Camión</div>
            <div>Conductor</div>
            <div>Capacidad</div>
            <div>Estado</div>
            <div>Ubicación</div>
          </div>
          <div className="space-y-2">
            {trucks.map((truck) => (
              <div key={truck.id} className="grid grid-cols-5 items-center py-2 text-sm">
                <div className="font-medium">{truck.id}</div>
                <div>{truck.driver}</div>
                <div>{truck.capacity}</div>
                <div>
                  <Badge
                    variant={
                      truck.status === "En Ruta"
                        ? "default"
                        : truck.status === "Cargando"
                        ? "secondary"
                        : truck.status === "Entregando"
                        ? "outline"
                        : truck.status === "Regresando"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {truck.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {truck.location}
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/fleet">Ver Todos los Camiones</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
