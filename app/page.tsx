import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { MetricsVisualization } from "@/components/dashboard/metrics-visualization"
import { TankLevels } from "@/components/dashboard/tank-levels"
import { ActiveTrucks } from "@/components/dashboard/active-trucks"
import { Notifications } from "@/components/dashboard/notifications"
import { RecentOrders } from "@/components/dashboard/recent-orders"

export const metadata: Metadata = {
  title: "Dashboard | GLP Distribution Logistics",
  description: "GLP Distribution Logistics Dashboard",
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <SummaryCards />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <MetricsVisualization />
        <TankLevels />
        <Notifications />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <RecentOrders />
        <ActiveTrucks />
      </div>
    </div>
  )
}

