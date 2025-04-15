"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Download } from "lucide-react"

export function SimulationResultsDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Reporte de Fin de Simulación</DialogTitle>
          <DialogDescription>Resumen de los resultados de la simulación</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Fecha de Carga/Logística:</div>
            <div className="font-medium">01/12/2023</div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Tiempo de Simulación:</div>
            <div className="font-medium">01d 15h 46m</div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Tiempo Real:</div>
            <div className="font-medium">00h 05m 21s</div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Vehículos en uso:</div>
            <div className="font-medium">15/20</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-sm font-medium mb-2">Pedidos Entregados</div>
            <div className="text-3xl font-bold">157</div>
          </Card>

          <Card className="p-4">
            <div className="text-sm font-medium mb-2">Pedidos Fuera de Tiempo</div>
            <div className="text-3xl font-bold text-amber-500">23</div>
          </Card>

          <Card className="p-4">
            <div className="text-sm font-medium mb-2">Vehículos en ruta</div>
            <div className="text-3xl font-bold">8</div>
          </Card>

          <Card className="p-4">
            <div className="text-sm font-medium mb-2">Eficiencia</div>
            <div className="text-3xl font-bold text-green-500">87%</div>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cerrar
          </Button>
          <Button onClick={() => setOpen(false)}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Reporte
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
