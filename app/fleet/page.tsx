import type { Metadata } from "next"
import { FleetTable } from "@/components/fleet/fleet-table"
import { MaintenanceSchedule } from "@/components/fleet/maintenance-schedule"
import { FleetHeader } from "@/components/fleet/fleet-header"

export const metadata: Metadata = {
  title: "Fleet | GLP Distribution Logistics",
  description: "Manage GLP distribution fleet",
}

export default function FleetPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <FleetHeader />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FleetTable />
        </div>
        <div>
          <MaintenanceSchedule />
        </div>
      </div>
    </div>
  )
}

