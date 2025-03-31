import { Button } from "@/components/ui/button"
import { Plus, FileDown, FileUp } from "lucide-react"
import { AddTruckDialog } from "@/components/fleet/add-truck-dialog"

export function FleetHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fleet Management</h1>
        <p className="text-muted-foreground">Manage and monitor your delivery trucks</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <FileDown className="mr-2 h-4 w-4" />
          Export
        </Button>
        <Button variant="outline" size="sm">
          <FileUp className="mr-2 h-4 w-4" />
          Import
        </Button>
        <AddTruckDialog>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Truck
          </Button>
        </AddTruckDialog>
      </div>
    </div>
  )
}

