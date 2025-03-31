"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function TankLevels() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Niveles de Tanques</CardTitle>
        <CardDescription>Capacidad de almacenamiento actual</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium">Planta Principal</span>
              <span className="text-xs text-muted-foreground">Suministro Ilimitado</span>
            </div>
            <span className="text-sm font-medium">100%</span>
          </div>
          <Progress value={100} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium">Tanque 1</span>
              <span className="text-xs text-muted-foreground">Capacidad de 160m³</span>
            </div>
            <span className="text-sm font-medium">78%</span>
          </div>
          <Progress value={78} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium">Tanque 2</span>
              <span className="text-xs text-muted-foreground">Capacidad de 160m³</span>
            </div>
            <span className="text-sm font-medium">65%</span>
          </div>
          <Progress value={65} className="h-2" />
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Próximo llenado: Hoy a las 00:00
        </div>
      </CardContent>
    </Card>
  );
}
