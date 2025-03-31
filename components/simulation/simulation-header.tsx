import { Button } from "@/components/ui/button"
import { Save, FileDown, RefreshCw } from "lucide-react"

export function SimulationHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Simulation</h1>
        <p className="text-muted-foreground">Run simulations to analyze and optimize operations</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <FileDown className="mr-2 h-4 w-4" />
          Export Results
        </Button>
        <Button variant="outline" size="sm">
          <Save className="mr-2 h-4 w-4" />
          Save Scenario
        </Button>
        <Button size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  )
}

