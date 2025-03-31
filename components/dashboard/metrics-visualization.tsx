"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

const deliveryData = [
  { day: "Mon", completed: 18, pending: 5 },
  { day: "Tue", completed: 23, pending: 2 },
  { day: "Wed", completed: 17, pending: 7 },
  { day: "Thu", completed: 24, pending: 3 },
  { day: "Fri", completed: 28, pending: 1 },
  { day: "Sat", completed: 15, pending: 4 },
  { day: "Sun", completed: 12, pending: 2 },
]

const fuelData = [
  { day: "Mon", consumption: 120 },
  { day: "Tue", consumption: 145 },
  { day: "Wed", consumption: 132 },
  { day: "Thu", consumption: 158 },
  { day: "Fri", consumption: 170 },
  { day: "Sat", consumption: 95 },
  { day: "Sun", consumption: 82 },
]

export function MetricsVisualization() {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
        <CardDescription>Weekly overview of key performance indicators</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="deliveries">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
            <TabsTrigger value="fuel">Fuel Consumption</TabsTrigger>
          </TabsList>
          <TabsContent value="deliveries" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deliveryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" name="Completed" fill="#16a34a" />
                  <Bar dataKey="pending" name="Pending" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="fuel" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fuelData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="consumption" name="Fuel (L)" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

