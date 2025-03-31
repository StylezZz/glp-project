"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, Layers, Truck, Home, Package, Fuel } from "lucide-react"

export function RouteMap() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [zoom, setZoom] = React.useState(1)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Apply zoom
    ctx.save()
    ctx.scale(zoom, zoom)

    // Draw grid
    drawGrid(ctx, canvas.width / zoom, canvas.height / zoom)

    // Draw map elements
    drawMapElements(ctx)

    ctx.restore()
  }, [zoom])

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 40
    ctx.strokeStyle = "#e2e8f0"
    ctx.lineWidth = 0.5

    // Draw vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    // Draw horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Draw coordinate labels
    ctx.fillStyle = "#94a3b8"
    ctx.font = "10px sans-serif"

    // X-axis labels (A, B, C, etc.)
    for (let x = gridSize; x < width; x += gridSize) {
      const label = String.fromCharCode(64 + Math.floor(x / gridSize))
      ctx.fillText(label, x - 3, 12)
    }

    // Y-axis labels (1, 2, 3, etc.)
    for (let y = gridSize; y < height; y += gridSize) {
      const label = Math.floor(y / gridSize).toString()
      ctx.fillText(label, 5, y + 4)
    }
  }

  const drawMapElements = (ctx: CanvasRenderingContext2D) => {
    const gridSize = 40

    // Draw main plant
    ctx.fillStyle = "#3b82f6"
    ctx.beginPath()
    ctx.arc(gridSize * 5, gridSize * 5, 10, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = "#1e293b"
    ctx.font = "12px sans-serif"
    ctx.fillText("Main Plant", gridSize * 5 - 30, gridSize * 5 - 15)

    // Draw tanks
    ctx.fillStyle = "#10b981"
    ctx.beginPath()
    ctx.arc(gridSize * 8, gridSize * 3, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillText("Tank 1", gridSize * 8 - 20, gridSize * 3 - 12)

    ctx.beginPath()
    ctx.arc(gridSize * 3, gridSize * 8, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillText("Tank 2", gridSize * 3 - 20, gridSize * 8 - 12)

    // Draw customers
    const customers = [
      { x: 2, y: 3, name: "Acme Corp" },
      { x: 7, y: 7, name: "TechSolutions" },
      { x: 10, y: 4, name: "Global Ind." },
      { x: 4, y: 10, name: "City Hospital" },
      { x: 9, y: 9, name: "Metro Hotel" },
    ]

    ctx.fillStyle = "#f59e0b"
    customers.forEach((customer) => {
      ctx.beginPath()
      ctx.rect(customer.x * gridSize - 6, customer.y * gridSize - 6, 12, 12)
      ctx.fill()
      ctx.fillStyle = "#1e293b"
      ctx.fillText(customer.name, customer.x * gridSize - 30, customer.y * gridSize - 12)
      ctx.fillStyle = "#f59e0b"
    })

    // Draw trucks
    const trucks = [
      { x: 5.5, y: 5.5, angle: 45 },
      { x: 6.2, y: 4.3, angle: 90 },
      { x: 3.8, y: 7.2, angle: 180 },
      { x: 8.5, y: 8.1, angle: 270 },
      { x: 9.2, y: 3.5, angle: 315 },
    ]

    ctx.fillStyle = "#ef4444"
    trucks.forEach((truck) => {
      ctx.save()
      ctx.translate(truck.x * gridSize, truck.y * gridSize)
      ctx.rotate((truck.angle * Math.PI) / 180)

      // Draw truck as triangle
      ctx.beginPath()
      ctx.moveTo(0, -6)
      ctx.lineTo(-4, 6)
      ctx.lineTo(4, 6)
      ctx.closePath()
      ctx.fill()

      ctx.restore()
    })

    // Draw routes
    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 2

    // Route 1: Main Plant to Customer 1
    ctx.beginPath()
    ctx.moveTo(gridSize * 5, gridSize * 5)
    ctx.lineTo(gridSize * 2, gridSize * 3)
    ctx.stroke()

    // Route 2: Main Plant to Tank 1 to Customer 3
    ctx.beginPath()
    ctx.moveTo(gridSize * 5, gridSize * 5)
    ctx.lineTo(gridSize * 8, gridSize * 3)
    ctx.lineTo(gridSize * 10, gridSize * 4)
    ctx.stroke()

    // Route 3: Tank 2 to Customer 4
    ctx.strokeStyle = "#10b981"
    ctx.beginPath()
    ctx.moveTo(gridSize * 3, gridSize * 8)
    ctx.lineTo(gridSize * 4, gridSize * 10)
    ctx.stroke()

    // Route 4: Main Plant to Customer 2 to Customer 5
    ctx.strokeStyle = "#f59e0b"
    ctx.beginPath()
    ctx.moveTo(gridSize * 5, gridSize * 5)
    ctx.lineTo(gridSize * 7, gridSize * 7)
    ctx.lineTo(gridSize * 9, gridSize * 9)
    ctx.stroke()

    // Draw route direction arrows
    drawArrow(ctx, gridSize * 3.5, gridSize * 4, 135)
    drawArrow(ctx, gridSize * 6.5, gridSize * 4, 45)
    drawArrow(ctx, gridSize * 9, gridSize * 3.5, 0)
    drawArrow(ctx, gridSize * 3.5, gridSize * 9, 45)
    drawArrow(ctx, gridSize * 6, gridSize * 6, 45)
    drawArrow(ctx, gridSize * 8, gridSize * 8, 45)
  }

  const drawArrow = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate((angle * Math.PI) / 180)

    ctx.fillStyle = ctx.strokeStyle
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(-5, -3)
    ctx.lineTo(-5, 3)
    ctx.closePath()
    ctx.fill()

    ctx.restore()
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 2))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.6))
  }

  return (
    <Card className="h-[calc(100vh-12rem)]">
      <Tabs defaultValue="map">
        <div className="flex items-center justify-between border-b px-4">
          <TabsList className="h-12">
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="list">Route List</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Layers className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardContent className="p-0">
          <TabsContent value="map" className="m-0 h-full">
            <div className="relative h-full w-full">
              <canvas ref={canvasRef} className="h-full w-full" />
              <div className="absolute bottom-4 left-4 flex flex-col gap-2 bg-background/80 p-2 rounded-md border">
                <div className="text-xs font-medium">Legend</div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span>Main Plant</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span>Tanks</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="h-3 w-3 rounded bg-amber-500"></div>
                  <span>Customers</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <span>Trucks</span>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="list" className="m-0 p-4 h-full overflow-auto">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Route 1: TRK-001
                </h3>
                <div className="rounded-md border p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Home className="h-4 w-4 text-blue-500" />
                    <span>Main Plant</span>
                    <span className="text-muted-foreground ml-auto">Start: 08:00</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-amber-500" />
                    <span>Acme Corp (Sector A-3)</span>
                    <span className="text-muted-foreground ml-auto">ETA: 08:45</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Fuel className="h-4 w-4 text-muted-foreground" />
                      <span>Fuel: 12L</span>
                    </div>
                    <div>Distance: 3.2km</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Route 2: TRK-002
                </h3>
                <div className="rounded-md border p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Home className="h-4 w-4 text-blue-500" />
                    <span>Main Plant</span>
                    <span className="text-muted-foreground ml-auto">Start: 08:30</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Fuel className="h-4 w-4 text-green-500" />
                    <span>Tank 1 (Sector B-3)</span>
                    <span className="text-muted-foreground ml-auto">ETA: 09:15</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-amber-500" />
                    <span>Global Industries (Sector C-4)</span>
                    <span className="text-muted-foreground ml-auto">ETA: 10:00</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Fuel className="h-4 w-4 text-muted-foreground" />
                      <span>Fuel: 22L</span>
                    </div>
                    <div>Distance: 8.1km</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Route 3: TRK-003
                </h3>
                <div className="rounded-md border p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Fuel className="h-4 w-4 text-green-500" />
                    <span>Tank 2 (Sector B-8)</span>
                    <span className="text-muted-foreground ml-auto">Start: 09:00</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-amber-500" />
                    <span>City Hospital (Sector D-10)</span>
                    <span className="text-muted-foreground ml-auto">ETA: 09:45</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Fuel className="h-4 w-4 text-muted-foreground" />
                      <span>Fuel: 15L</span>
                    </div>
                    <div>Distance: 4.9km</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="comparison" className="m-0 p-4 h-full overflow-auto">
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="text-sm font-medium">Current Plan</div>
                  <div className="mt-2 text-2xl font-bold">187L</div>
                  <div className="text-xs text-muted-foreground">Total Fuel</div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm font-medium">Optimized Plan</div>
                  <div className="mt-2 text-2xl font-bold text-green-600">162L</div>
                  <div className="text-xs text-muted-foreground">Total Fuel</div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm font-medium">Savings</div>
                  <div className="mt-2 text-2xl font-bold text-green-600">13.4%</div>
                  <div className="text-xs text-muted-foreground">Fuel Reduction</div>
                </Card>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Comparison Details</h3>
                <div className="rounded-md border overflow-hidden">
                  <table className="min-w-full divide-y divide-border">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Metric</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Current</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Optimized</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Difference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-background">
                      <tr>
                        <td className="px-4 py-2 text-sm">Total Distance</td>
                        <td className="px-4 py-2 text-sm">78.5 km</td>
                        <td className="px-4 py-2 text-sm">68.2 km</td>
                        <td className="px-4 py-2 text-sm text-green-600">-13.1%</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm">Fuel Consumption</td>
                        <td className="px-4 py-2 text-sm">187 L</td>
                        <td className="px-4 py-2 text-sm">162 L</td>
                        <td className="px-4 py-2 text-sm text-green-600">-13.4%</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm">Delivery Time</td>
                        <td className="px-4 py-2 text-sm">5h 30m</td>
                        <td className="px-4 py-2 text-sm">4h 45m</td>
                        <td className="px-4 py-2 text-sm text-green-600">-13.6%</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm">Trucks Used</td>
                        <td className="px-4 py-2 text-sm">5</td>
                        <td className="px-4 py-2 text-sm">4</td>
                        <td className="px-4 py-2 text-sm text-green-600">-20.0%</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm">Average Load</td>
                        <td className="px-4 py-2 text-sm">68%</td>
                        <td className="px-4 py-2 text-sm">85%</td>
                        <td className="px-4 py-2 text-sm text-green-600">+25.0%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <Button className="w-full">Apply Optimized Plan</Button>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}

