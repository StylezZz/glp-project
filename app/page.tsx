import type { Metadata } from "next";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { MetricsVisualization } from "@/components/dashboard/metrics-visualization";
import { TankLevels } from "@/components/dashboard/tank-levels";
import { ActiveTrucks } from "@/components/dashboard/active-trucks";
import { Notifications } from "@/components/dashboard/notifications";
import { RecentOrders } from "@/components/dashboard/recent-orders";

export const metadata: Metadata = {
  title: "Panel de Control | Logística de Distribución GLP",
  description: "Panel de Control de Logística de Distribución GLP",
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <SummaryCards />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <MetricsVisualization className="lg:col-span-2" />
        <TankLevels />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Notifications className="lg:col-span-1" />
        <RecentOrders className="lg:col-span-2" />
      </div>
      <ActiveTrucks />
    </div>
  );
}
