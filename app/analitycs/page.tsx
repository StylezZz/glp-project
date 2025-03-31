import type { Metadata } from "next"
import { AnalyticsHeader } from "@/components/analytics/analytics-header"
import { PerformanceMetrics } from "@/components/analytics/performance-metrics"
import { FuelConsumption } from "@/components/analytics/fuel-consumption"
import { DeliveryStats } from "@/components/analytics/delivery-stats"
import { TruckUtilization } from "@/components/analytics/truck-utilization"

export const metadata: Metadata = {
  title: "Analytics | GLP Distribution Logistics",
  description: "Analytics and reporting for GLP distribution operations",
}

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <AnalyticsHeader />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <PerformanceMetrics />
        <FuelConsumption />
        <DeliveryStats />
      </div>
      <TruckUtilization />
    </div>
  )
}

