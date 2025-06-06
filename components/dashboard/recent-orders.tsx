"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Plus } from "lucide-react"
import Link from "next/link"

const orders = [
  {
    id: "ORD-1234",
    customer: "Acme Corp",
    volume: "15m³",
    deadline: "Today, 14:30",
    status: "In Progress",
  },
  {
    id: "ORD-1235",
    customer: "TechSolutions Inc",
    volume: "8m³",
    deadline: "Today, 16:00",
    status: "Pending",
  },
  {
    id: "ORD-1236",
    customer: "Global Industries",
    volume: "22m³",
    deadline: "Today, 17:45",
    status: "Assigned",
  },
  {
    id: "ORD-1237",
    customer: "City Hospital",
    volume: "12m³",
    deadline: "Tomorrow, 09:00",
    status: "Scheduled",
  },
  {
    id: "ORD-1238",
    customer: "Metro Hotel",
    volume: "7m³",
    deadline: "Tomorrow, 11:30",
    status: "Scheduled",
  },
]

export function RecentOrders() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest customer orders</CardDescription>
        </div>
        <Button asChild size="sm">
          <Link href="/orders">
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-5 text-xs font-medium text-muted-foreground">
            <div>Order ID</div>
            <div>Customer</div>
            <div>Volume</div>
            <div>Deadline</div>
            <div>Status</div>
          </div>
          <div className="space-y-2">
            {orders.map((order) => (
              <div key={order.id} className="grid grid-cols-5 items-center py-2 text-sm">
                <div className="font-medium">{order.id}</div>
                <div>{order.customer}</div>
                <div>{order.volume}</div>
                <div>{order.deadline}</div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      order.status === "In Progress"
                        ? "default"
                        : order.status === "Pending"
                          ? "secondary"
                          : order.status === "Assigned"
                            ? "outline"
                            : "secondary"
                    }
                  >
                    {order.status}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/orders">View All Orders</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

