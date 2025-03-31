"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const dailyData = [
  { day: 1, deliveries: 24, fuel: 187, utilization: 53 },
  { day: 2, deliveries: 26, fuel: 195, utilization: 58 },
  { day: 3, deliveries: 22, fuel: 178, utilization: 49 },
  { day: 4, deliveries: 28, fuel: 210, utilization: 62 },
  { day: 5, deliveries: 25, fuel: 192, utilization: 56 },
  { day: 6, deliveries: 18, fuel: 156, utilization: 40 },
  { day: 7, deliveries: 20, fuel: 168, utilization: 44 },
]

const tankData = [
  { day: 1, tank1: 78, tank2: 65 },
  { day: 2, tank1: 62, tank2: 48 },
  { day: 3, tank1: 100, tank2: 100 },
  { day: 4, tank1: 85, tank2: 72 },
  { day: 5, tank1: 68, tank2: 54 },
  { day: 6, tank1: 52, tank2: 38 },
  { day: 7, tank1: 100, tank2: 100 },
]

const breakdownData = [
  { name: "On-time Deliveries", value: 92 },
  { name: "Late Deliveries", value: 6 },
  { name: "Failed Deliveries", value: 2 },
]

const COLORS = ["#16a34a", "#f59e0b", "#ef4444"]

export function SimulationResults() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulation Results</CardTitle>
        <CardDescription>Analysis of the simulation outcomes</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="performance">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
          </TabsList>
          <TabsContent value="performance" className="space-y-4 pt-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" label={{ value: "Day", position: "insideBottom", offset: -5 }} />
                  <YAxis yAxisId="left" label={{ value: "Deliveries", angle: -90, position: "insideLeft" }} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    label={{ value: "Fuel (L)", angle: 90, position: "insideRight" }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="deliveries"
                    name="Deliveries"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="fuel"
                    name="Fuel Consumption (L)"
                    stroke="#ef4444"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="p-4">
                <div className="text-sm font-medium">Avg. Daily Deliveries</div>
                <div className="mt-2 text-2xl font-bold">23.3</div>
                <div className="text-xs text-muted-foreground">+5% from baseline</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm font-medium">Avg. Fuel Consumption</div>
                <div className="mt-2 text-2xl font-bold">183.7 L</div>
                <div className="text-xs text-muted-foreground">-3% from baseline</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm font-medium">Avg. Truck Utilization</div>
                <div className="mt-2 text-2xl font-bold">51.7%</div>
                <div className="text-xs text-muted-foreground">+2% from baseline</div>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="resources" className="space-y-4 pt-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tankData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" label={{ value: "Day", position: "insideBottom", offset: -5 }} />
                  <YAxis label={{ value: "Tank Level (%)", angle: -90, position: "insideLeft" }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="tank1" name="Tank 1" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="tank2" name="Tank 2" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="p-4">
                <div className="text-sm font-medium">Min Tank Level</div>
                <div className="mt-2 text-2xl font-bold">38%</div>
                <div className="text-xs text-muted-foreground">Tank 2, Day 6</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm font-medium">Refill Events</div>
                <div className="mt-2 text-2xl font-bold">2</div>
                <div className="text-xs text-muted-foreground">Days 3 and 7</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm font-medium">Critical Levels</div>
                <div className="mt-2 text-2xl font-bold">0</div>
                <div className="text-xs text-muted-foreground">Below 30% capacity</div>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="deliveries" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" label={{ value: "Day", position: "insideBottom", offset: -5 }} />
                    <YAxis label={{ value: "Deliveries", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Bar dataKey="deliveries" name="Deliveries" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={breakdownData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {breakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="p-4">
                <div className="text-sm font-medium">Total Deliveries</div>
                <div className="mt-2 text-2xl font-bold">163</div>
                <div className="text-xs text-muted-foreground">Over 7 days</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm font-medium">On-time Delivery Rate</div>
                <div className="mt-2 text-2xl font-bold">92%</div>
                <div className="text-xs text-muted-foreground">+2% from target</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm font-medium">Avg. Delivery Time</div>
                <div className="mt-2 text-2xl font-bold">42 min</div>
                <div className="text-xs text-muted-foreground">-5 min from baseline</div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

