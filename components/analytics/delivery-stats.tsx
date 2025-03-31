"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

const deliveryData = [
  { name: "On-time", value: 92 },
  { name: "Late", value: 6 },
  { name: "Failed", value: 2 },
]

const COLORS = ["#16a34a", "#f59e0b", "#ef4444"]

export function DeliveryStats() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Statistics</CardTitle>
        <CardDescription>Delivery performance breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={deliveryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {deliveryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">92%</div>
            <div className="text-xs text-muted-foreground">On-time</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-500">6%</div>
            <div className="text-xs text-muted-foreground">Late</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-500">2%</div>
            <div className="text-xs text-muted-foreground">Failed</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

