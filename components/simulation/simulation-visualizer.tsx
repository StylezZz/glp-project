"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ZoomIn, ZoomOut, Layers, FastForward, Rewind, Play, Pause } from "lucide-react"

export function SimulationVisualizer() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [zoom, setZoom] = React.useState(1)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [timeScale, setTimeScale] = React.useState(1)

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

  const draw = React.useCallback(() => {
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
  }, [zoom, drawMapElements])

  React.useEffect(() => {
    draw()
    window.addEventListener("resize", draw)
    return () => window.removeEventListener("resize", draw)
  }, [draw])

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 2))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.6))
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleTimeScaleChange = (value: number[]) => {
    setTimeScale(value[0])
  }

  return (
    <Card className="h-[calc(100vh-12rem)]">
      <Tabs defaultValue="simulation">
        <div className="flex items-center justify-between border-b px-4">
          <TabsList className="h-12">
            <TabsTrigger value="simulation">Simulation</TabsTrigger>
            <TabsTrigger value="metrics">Real-time Metrics</TabsTrigger>
            <TabsTrigger value="events">Events Log</TabsTrigger>
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
          <TabsContent value="simulation" className="m-0 h-full">
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

              <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-background/80 p-2 rounded-md border w-64">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium">Simulation Time: 08:45</div>
                  <div className="text-xs font-medium">Day 1 of 7</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Rewind className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={togglePlayPause}>
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <FastForward className="h-4 w-4" />
                  </Button>
                  <div className="flex-1">
                    <Slider
                      defaultValue={[1]}
                      max={10}
                      min={1}
                      step={1}
                      value={[timeScale]}
                      onValueChange={handleTimeScaleChange}
                    />
                  </div>
                  <div className="text-xs font-medium">{timeScale}x</div>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="metrics" className="m-0 p-4 h-full overflow-auto">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="text-sm font-medium">Tank 1 Level</div>
                  <div className="mt-2 text-2xl font-bold">78%</div>
                  <div className="h-2 w-full bg-muted mt-2 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: "78%" }}></div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm font-medium">Tank 2 Level</div>
                  <div className="mt-2 text-2xl font-bold">65%</div>
                  <div className="h-2 w-full bg-muted mt-2 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: "65%" }}></div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm font-medium">Orders Pending</div>
                  <div className="mt-2 text-2xl font-bold">12</div>
                  <div className="text-xs text-muted-foreground">50% of daily total</div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm font-medium">Trucks Active</div>
                  <div className="mt-2 text-2xl font-bold">8/15</div>
                  <div className="text-xs text-muted-foreground">53% utilization</div>
                </Card>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Real-time Metrics</h3>
                <div className="rounded-md border overflow-hidden">
                  <table className="min-w-full divide-y divide-border">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Metric</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Current Value</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Target</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-background">
                      <tr>
                        <td className="px-4 py-2 text-sm">On-time Delivery Rate</td>
                        <td className="px-4 py-2 text-sm">98.2%</td>
                        <td className="px-4 py-2 text-sm">95.0%</td>
                        <td className="px-4 py-2 text-sm">
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                            Above Target
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm">Fuel Efficiency</td>
                        <td className="px-4 py-2 text-sm">0.42 L/km</td>
                        <td className="px-4 py-2 text-sm">0.45 L/km</td>
                        <td className="px-4 py-2 text-sm">
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                            Above Target
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm">Truck Utilization</td>
                        <td className="px-4 py-2 text-sm">53.3%</td>
                        <td className="px-4 py-2 text-sm">60.0%</td>
                        <td className="px-4 py-2 text-sm">
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                            Below Target
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm">Tank 1 Level</td>
                        <td className="px-4 py-2 text-sm">78.0%</td>
                        <td className="px-4 py-2 text-sm">50.0%</td>
                        <td className="px-4 py-2 text-sm">
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                            Above Target
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm">Tank 2 Level</td>
                        <td className="px-4 py-2 text-sm">65.0%</td>
                        <td className="px-4 py-2 text-sm">50.0%</td>
                        <td className="px-4 py-2 text-sm">
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                            Above Target
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="events" className="m-0 p-4 h-full overflow-auto">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Simulation Events</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-md border p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                      08:45
                    </div>
                    <div>
                      <div className="font-medium">Order Delivered</div>
                      <div className="text-sm text-muted-foreground">TRK-001 delivered order ORD-1234 to Acme Corp</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-md border p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                      08:30
                    </div>
                    <div>
                      <div className="font-medium">Truck Dispatched</div>
                      <div className="text-sm text-muted-foreground">TRK-002 dispatched to Tank 1 for refill</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-md border p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300">
                      08:15
                    </div>
                    <div>
                      <div className="font-medium">Tank Level Warning</div>
                      <div className="text-sm text-muted-foreground">Tank 2 level dropped below 70% capacity</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-md border p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                      08:00
                    </div>
                    <div>
                      <div className="font-medium">Simulation Started</div>
                      <div className="text-sm text-muted-foreground">Daily operations simulation initiated</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-md border p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
                      00:00
                    </div>
                    <div>
                      <div className="font-medium">Tanks Refilled</div>
                      <div className="text-sm text-muted-foreground">
                        Both intermediate tanks refilled to 100% capacity
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}

