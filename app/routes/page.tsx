import type { Metadata } from "next"
import { RoutesHeader } from "@/components/routes/routes-header"
import { RouteMap } from "@/components/routes/route-map"
import { RouteControls } from "@/components/routes/route-controls"

export const metadata: Metadata = {
  title: "Routes | GLP Distribution Logistics",
  description: "Plan and optimize delivery routes",
}

export default function RoutesPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <RoutesHeader />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <RouteControls />
        <div className="lg:col-span-3">
          <RouteMap />
        </div>
      </div>
    </div>
  )
}

