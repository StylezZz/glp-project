import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"

export function DashboardHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Resumen de tu distribución de GLP entre los días indicados</p>
      </div>
      <div className="flex items-center gap-2">
        <DatePickerWithRange />
        <Button variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

