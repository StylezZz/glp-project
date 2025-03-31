"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

const dailyUtilization = [
  { day: "Mon", active: 8, idle: 4, maintenance: 3 },
  { day: "Tue", active: 10, idle: 3, maintenance: 2 },
  { day: "Wed", active: 7, idle: 5, maintenance: 3 },
  { day: "Thu", active: 11, idle: 2, maintenance: 2 },
  { day: "Fri", active: 9, idle: 4, maintenance: 2 },
  { day: "Sat", active: 6, idle: 7, maintenance: 2 },
  { day: "Sun", active: 5, idle: 8, maintenance: 2 },
]

const truckUtilization = [
  { id: "TRK-001", utilization: 78 },
  { id: "TRK-002", utilization: 65 },
  { id: "TRK-003", utilization: 82 },
  { id: "TRK-004", utilization: 45 },
  { id: "TRK-005", utilization: 30 },
  { id: "TRK-006", utilization: 72 },
  { id: "TRK-007", utilization: 68 },
  { id: "TRK-008", utilization: 25 },
  { id: "TRK-009", utilization: 58 },
  { id: "TRK-010", utilization: 75 },
]

export function TruckUtilization() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Truck Utilization</CardTitle>
        <CardDescription>Fleet usage and efficiency metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="daily">Daily Status</TabsTrigger>
            <TabsTrigger value="trucks">By Truck</TabsTrigger>
          </TabsList>
          <TabsContent value="daily" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyUtilization}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="active" name="Active" stackId="a" fill="#16a34a" />
                  <Bar dataKey="idle" name="Idle" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="maintenance" name="Maintenance" stackId="a" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="trucks" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={truckUtilization} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="id" type="category" width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="utilization" name="Utilization (%)" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

