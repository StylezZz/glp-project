import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bell, AlertTriangle, Info, Truck, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationsProps {
  className?: string;
}

export const Notifications: React.FC<NotificationsProps> = ({ className }) => {
  return (
    <div className={`notifications ${className || ""}`}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Notificaciones</CardTitle>
            <CardDescription>Alertas y actualizaciones del sistema</CardDescription>
          </div>
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Avería de Camión</AlertTitle>
            <AlertDescription>
              TRK-008 reportó falla de motor en el Sector D-3. Equipo de mantenimiento enviado.
            </AlertDescription>
          </Alert>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Advertencia de Nivel de Tanque</AlertTitle>
            <AlertDescription>
              El Tanque 2 está por debajo del 70% de capacidad. Considere ajustar el horario de
              entrega.
            </AlertDescription>
          </Alert>
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertTitle>Mantenimiento Programado</AlertTitle>
            <AlertDescription>
              TRK-003 tiene mantenimiento preventivo programado para mañana.
            </AlertDescription>
          </Alert>
          <Alert>
            <Truck className="h-4 w-4" />
            <AlertTitle>Optimización de Ruta</AlertTitle>
            <AlertDescription>
              Nuevo plan de ruta disponible para entregas de la tarde.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
