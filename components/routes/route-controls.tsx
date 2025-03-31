"use client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Truck, Fuel, Clock, RotateCw } from "lucide-react"
import { toast } from "sonner"

export function RouteControls() {

  const handleOptimize = () => {
    toast("Optimization started");
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Route Controls</CardTitle>
        <CardDescription>Configure and optimize delivery routes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="algorithm">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="algorithm">Algorithm</TabsTrigger>
            <TabsTrigger value="constraints">Constraints</TabsTrigger>
          </TabsList>
          <TabsContent value="algorithm" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="algorithm">Optimization Algorithm</Label>
              <Select defaultValue="genetic">
                <SelectTrigger id="algorithm">
                  <SelectValue placeholder="Select algorithm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="genetic">Genetic Algorithm</SelectItem>
                  <SelectItem value="annealing">Simulated Annealing</SelectItem>
                  <SelectItem value="tabu">Tabu Search</SelectItem>
                  <SelectItem value="ant">Ant Colony Optimization</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="iterations">Max Iterations</Label>
              <Input id="iterations" type="number" defaultValue="1000" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="convergence">Convergence Threshold</Label>
                <span className="text-xs text-muted-foreground">0.01</span>
              </div>
              <Slider defaultValue={[0.01]} min={0.001} max={0.1} step={0.001} />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="parallel" className="flex flex-col space-y-1">
                <span>Parallel Processing</span>
                <span className="font-normal text-xs text-muted-foreground">Use multiple CPU cores</span>
              </Label>
              <Switch id="parallel" defaultChecked />
            </div>
          </TabsContent>

          <TabsContent value="constraints" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="objective">Primary Objective</Label>
              <Select defaultValue="fuel">
                <SelectTrigger id="objective">
                  <SelectValue placeholder="Select objective" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fuel">Minimize Fuel Consumption</SelectItem>
                  <SelectItem value="distance">Minimize Total Distance</SelectItem>
                  <SelectItem value="time">Minimize Delivery Time</SelectItem>
                  <SelectItem value="balanced">Balanced Load Distribution</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="time-weight">Time Window Importance</Label>
                <span className="text-xs text-muted-foreground">70%</span>
              </div>
              <Slider defaultValue={[70]} min={0} max={100} step={5} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-trucks">Maximum Trucks</Label>
              <Input id="max-trucks" type="number" defaultValue="10" />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="maintenance" className="flex flex-col space-y-1">
                <span>Consider Maintenance</span>
                <span className="font-normal text-xs text-muted-foreground">Include scheduled maintenance</span>
              </Label>
              <Switch id="maintenance" defaultChecked />
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Current Selection</h3>
            <Badge variant="outline">15 Orders</Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-1">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span>Trucks Required:</span>
              </div>
              <span className="font-medium">5</span>
            </div>
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-1">
                <Fuel className="h-4 w-4 text-muted-foreground" />
                <span>Est. Fuel Consumption:</span>
              </div>
              <span className="font-medium">187L</span>
            </div>
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Est. Completion Time:</span>
              </div>
              <span className="font-medium">5h 30m</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button className="w-full" onClick={handleOptimize}>
          <RotateCw className="mr-2 h-4 w-4" />
          Run Optimization
        </Button>
        <Button variant="outline" className="w-full">
          Reset Parameters
        </Button>
      </CardFooter>
    </Card>
  )
}

