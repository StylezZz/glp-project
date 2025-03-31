"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

const dailyData = [
  { day: "Mon", onTime: 96, fuel: 187, utilization: 53 },
  { day: "Tue", onTime: 98, fuel: 195, utilization: 58 },
  { day: "Wed", onTime: 94, fuel: 178, utilization: 49 },
  { day: "Thu", onTime: 99, fuel: 210, utilization: 62 },
  { day: "Fri", onTime: 97, fuel: 192, utilization: 56 },
  { day: "Sat", onTime: 95, fuel: 156, utilization: 40 },
  { day: "Sun", onTime: 93, fuel: 168, utilization: 44 },
]

const weeklyData = [
  { week: "W1", onTime: 95, fuel: 1286, utilization: 52 },
  { week: "W2", onTime: 96, fuel: 1320, utilization: 55 },
  { week: "W3", onTime: 97, fuel: 1245, utilization: 58 },
  { week: "W4", onTime: 98, fuel: 1310, utilization: 60 },
]

export function PerformanceMetrics() {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
        <CardDescription>Key performance indicators over time</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
          </TabsList>
          <TabsContent value="daily" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="onTime"
                    name="On-time Delivery (%)"
                    stroke="#16a34a"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="utilization"
                    name="Truck Utilization (%)"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="weekly" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="onTime"
                    name="On-time Delivery (%)"
                    stroke="#16a34a"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="utilization"
                    name="Truck Utilization (%)"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

