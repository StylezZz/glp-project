"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const truckData = [
  { id: "TRK-001", consumption: 187 },
  { id: "TRK-002", consumption: 165 },
  { id: "TRK-003", consumption: 210 },
  { id: "TRK-004", consumption: 120 },
  { id: "TRK-005", consumption: 90 },
  { id: "TRK-006", consumption: 175 },
  { id: "TRK-007", consumption: 155 },
]

const routeData = [
  { route: "Route 1", consumption: 42 },
  { route: "Route 2", consumption: 58 },
  { route: "Route 3", consumption: 35 },
  { route: "Route 4", consumption: 62 },
  { route: "Route 5", consumption: 48 },
]

export function FuelConsumption() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fuel Consumption</CardTitle>
        <CardDescription>Fuel usage by truck and route</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="trucks">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="trucks">By Truck</TabsTrigger>
            <TabsTrigger value="routes">By Route</TabsTrigger>
          </TabsList>
          <TabsContent value="trucks" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={truckData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="id" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="consumption" name="Fuel (L)" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="routes" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={routeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="route" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="consumption" name="Fuel (L)" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

