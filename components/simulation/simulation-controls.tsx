"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, SkipForward, Calendar, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

export function SimulationControls() {
  const [isRunning, setIsRunning] = React.useState(false)

  const handleRunSimulation = () => {
    setIsRunning(true)
    toast("Simulation started")
  }

  const handlePauseSimulation = () => {
    setIsRunning(false)
    toast("Simulation paused")
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Simulation Controls</CardTitle>
        <CardDescription>Configure and run distribution simulations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="scenario">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scenario">Scenario</TabsTrigger>
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
          </TabsList>
          <TabsContent value="scenario" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="scenario-type">Simulation Type</Label>
              <Select defaultValue="daily">
                <SelectTrigger id="scenario-type">
                  <SelectValue placeholder="Select scenario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Operations</SelectItem>
                  <SelectItem value="weekly">Weekly Simulation</SelectItem>
                  <SelectItem value="collapse">Until Operational Collapse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input id="start-date" type="date" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (Days)</Label>
              <Input id="duration" type="number" defaultValue="1" min="1" max="30" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="speed">Simulation Speed</Label>
                <span className="text-xs text-muted-foreground">60x</span>
              </div>
              <Slider defaultValue={[60]} min={1} max={120} step={1} />
            </div>
          </TabsContent>

          <TabsContent value="parameters" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="order-rate">Order Rate</Label>
              <div className="flex items-center gap-2">
                <Input id="order-rate" type="number" defaultValue="20" min="1" />
                <span className="text-sm text-muted-foreground">per day</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="volume-range">Volume Range (m³)</Label>
              <div className="flex items-center gap-2">
                <Input id="volume-min" type="number" defaultValue="5" min="1" />
                <span className="text-sm text-muted-foreground">to</span>
                <Input id="volume-max" type="number" defaultValue="25" min="1" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="truck-count">Available Trucks</Label>
              <Input id="truck-count" type="number" defaultValue="15" min="1" />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="maintenance" className="flex flex-col space-y-1">
                <span>Include Maintenance</span>
                <span className="font-normal text-xs text-muted-foreground">Scheduled every 2 months</span>
              </Label>
              <Switch id="maintenance" defaultChecked />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="breakdowns" className="flex flex-col space-y-1">
                <span>Random Breakdowns</span>
                <span className="font-normal text-xs text-muted-foreground">5% probability per truck per day</span>
              </Label>
              <Switch id="breakdowns" defaultChecked />
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Simulation Status</h3>
            <Badge variant={isRunning ? "default" : "outline"}>{isRunning ? "Running" : "Ready"}</Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Current Day:</span>
              <span className="font-medium">1 of 7</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Current Time:</span>
              <span className="font-medium">08:45</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Orders Processed:</span>
              <span className="font-medium">12 / 24</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Active Trucks:</span>
              <span className="font-medium">8 / 15</span>
            </div>
          </div>

          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
            <div className="flex gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <div>
                <div className="font-medium text-amber-600 dark:text-amber-400">Warning: Tank 2 at 65% capacity</div>
                <div className="text-xs text-amber-600 dark:text-amber-400">Consider adjusting delivery schedule</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {isRunning ? (
          <Button className="w-full" variant="outline" onClick={handlePauseSimulation}>
            <Pause className="mr-2 h-4 w-4" />
            Pause Simulation
          </Button>
        ) : (
          <Button className="w-full" onClick={handleRunSimulation}>
            <Play className="mr-2 h-4 w-4" />
            Run Simulation
          </Button>
        )}
        <Button variant="outline" className="w-full">
          <SkipForward className="mr-2 h-4 w-4" />
          Skip to End
        </Button>
      </CardFooter>
    </Card>
  )
}

