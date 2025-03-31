import type { Metadata } from "next"
import { OrdersHeader } from "@/components/orders/orders-header"
import { OrdersTable } from "@/components/orders/orders-table"

export const metadata: Metadata = {
  title: "Orders | GLP Distribution Logistics",
  description: "Manage GLP distribution orders",
}

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <OrdersHeader />
      <OrdersTable />
    </div>
  )
}

