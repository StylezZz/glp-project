"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Layers, Truck, Play, Pause, Square } from "lucide-react";

// Tipos para la simulación
interface RoutePoint {
  x: number;
  y: number;
}

interface SimulationData {
  route: RoutePoint[];
  customer: RoutePoint;
  startTime: string;
}

interface RouteMapProps {
  onOptimizationStart?: () => void;
  simulationData?: SimulationData | null;
  isOptimizing?: boolean;
}

export function RouteMap({
  onOptimizationStart,
  simulationData,
  isOptimizing = false,
}: RouteMapProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = React.useState(1);

  // Estados de simulación
  const [isSimulating, setIsSimulating] = React.useState(false);
  const [currentRouteIndex, setCurrentRouteIndex] = React.useState(0);
  const [simulationTime, setSimulationTime] = React.useState(0); // en segundos
  const [isPaused, setIsPaused] = React.useState(false);

  // Configuración del mapa
  const MAP_WIDTH = 70;
  const MAP_HEIGHT = 50;

  // Posiciones de los almacenes
  const MAIN_WAREHOUSE = { x: 12, y: 8 };
  const NORTH_WAREHOUSE = { x: 42, y: 42 };
  const EAST_WAREHOUSE = { x: 63, y: 3 };

  // Generar ruta sintética (esto será reemplazado por API)
  const generateSyntheticRoute = (): SimulationData => {
    const customer = { x: 25, y: 15 }; // Cliente ejemplo

    // Ruta de ida (movimientos ortogonales desde almacén central al cliente)
    const routeToCustomer: RoutePoint[] = [];
    let currentX = MAIN_WAREHOUSE.x;
    let currentY = MAIN_WAREHOUSE.y;

    // Primero moverse horizontalmente
    while (currentX !== customer.x) {
      if (currentX < customer.x) currentX++;
      else currentX--;
      routeToCustomer.push({ x: currentX, y: currentY });
    }

    // Luego moverse verticalmente
    while (currentY !== customer.y) {
      if (currentY < customer.y) currentY++;
      else currentY--;
      routeToCustomer.push({ x: currentX, y: currentY });
    }

    // Ruta de vuelta (del cliente al almacén central)
    const routeToWarehouse: RoutePoint[] = [];
    currentX = customer.x;
    currentY = customer.y;

    // Primero verticalmente
    while (currentY !== MAIN_WAREHOUSE.y) {
      if (currentY > MAIN_WAREHOUSE.y) currentY--;
      else currentY++;
      routeToWarehouse.push({ x: currentX, y: currentY });
    }

    // Luego horizontalmente
    while (currentX !== MAIN_WAREHOUSE.x) {
      if (currentX > MAIN_WAREHOUSE.x) currentX--;
      else currentX++;
      routeToWarehouse.push({ x: currentX, y: currentY });
    }

    // Combinar rutas: almacén -> cliente -> almacén
    const completeRoute = [
      MAIN_WAREHOUSE, // Punto inicial
      ...routeToCustomer,
      ...routeToWarehouse,
    ];

    return {
      route: completeRoute,
      customer,
      startTime: "00:00:00",
    };
  };

  // Efecto para manejar la optimización
  React.useEffect(() => {
    if (isOptimizing && !isSimulating) {
      // Simular tiempo de optimización
      setTimeout(() => {
        const route = generateSyntheticRoute();
        setIsSimulating(true);
        setCurrentRouteIndex(0);
        setSimulationTime(0);
        setIsPaused(false);
      }, 2000); // 2 segundos de "optimización"
    }
  }, [isOptimizing]);

  // Efecto para la simulación paso a paso
  React.useEffect(() => {
    if (!isSimulating || isPaused || !simulationData) return;

    const interval = setInterval(() => {
      setSimulationTime((prev) => prev + 72); // 72 segundos por paso

      setCurrentRouteIndex((prev) => {
        const nextIndex = prev + 1;
        if (nextIndex >= simulationData.route.length) {
          setIsSimulating(false);
          return prev;
        }
        return nextIndex;
      });
    }, 1000); // 1 segundo real = 72 segundos simulados

    return () => clearInterval(interval);
  }, [isSimulating, isPaused, simulationData]);

  // Función para formatear tiempo
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Funciones de control de simulación
  const handlePlayPause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsSimulating(false);
    setCurrentRouteIndex(0);
    setSimulationTime(0);
    setIsPaused(false);
  };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      drawCanvas(ctx, canvas.width, canvas.height);
    };

    const drawCanvas = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.clearRect(0, 0, width, height);

      ctx.save();

      // Solo aplicar zoom desde el centro, sin centrar el mapa
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.translate(centerX, centerY);
      ctx.scale(zoom, zoom);
      ctx.translate(-centerX, -centerY);

      drawGrid(ctx, width, height);
      drawMapElements(ctx, width, height);

      ctx.restore();
    };

    resizeCanvas();

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas.parentElement!);

    return () => {
      resizeObserver.disconnect();
    };
  }, [zoom, currentRouteIndex, simulationData]);

  const drawGrid = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    // Usar todo el espacio disponible - celdas rectangulares
    const cellWidth = canvasWidth / MAP_WIDTH;
    const cellHeight = canvasHeight / MAP_HEIGHT;

    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 0.5 / zoom;

    // Líneas verticales
    for (let x = 0; x <= MAP_WIDTH; x++) {
      const xPos = x * cellWidth;
      ctx.beginPath();
      ctx.moveTo(xPos, 0);
      ctx.lineTo(xPos, MAP_HEIGHT * cellHeight);
      ctx.stroke();
    }

    // Líneas horizontales
    for (let y = 0; y <= MAP_HEIGHT; y++) {
      const yPos = y * cellHeight;
      ctx.beginPath();
      ctx.moveTo(0, yPos);
      ctx.lineTo(MAP_WIDTH * cellWidth, yPos);
      ctx.stroke();
    }

    // Etiquetas de coordenadas
    ctx.fillStyle = "#94a3b8";
    const fontSize = Math.max(8, Math.min(cellWidth, cellHeight) * 0.3);
    ctx.font = `${fontSize}px sans-serif`;

    // Etiquetas X
    for (let x = 0; x <= MAP_WIDTH; x += 5) {
      const xPos = x * cellWidth;
      ctx.fillText(x.toString(), xPos + 2, 12);
    }

    // Etiquetas Y
    for (let y = 0; y <= MAP_HEIGHT; y += 5) {
      const yPos = y * cellHeight;
      ctx.fillText(y.toString(), 2, yPos + 12);
    }

    return { cellWidth, cellHeight };
  };

  const drawMapElements = (
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    // Usar todo el espacio disponible
    const cellWidth = canvasWidth / MAP_WIDTH;
    const cellHeight = canvasHeight / MAP_HEIGHT;

    const mapToCanvas = (x: number, y: number) => ({
      x: x * cellWidth,
      y: y * cellHeight,
    });

    // Dibujar almacenes
    // Almacén principal
    const mainPos = mapToCanvas(MAIN_WAREHOUSE.x, MAIN_WAREHOUSE.y);
    ctx.fillStyle = "#3b82f6";
    ctx.beginPath();
    const mainRadius = Math.min(cellWidth, cellHeight) * 0.4;
    ctx.arc(mainPos.x, mainPos.y, mainRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1e293b";
    const fontSize = Math.max(10, Math.min(cellWidth, cellHeight) * 0.25);
    ctx.font = `${fontSize}px sans-serif`;
    ctx.fillText("Almacén Central", mainPos.x - cellWidth * 1.5, mainPos.y - cellHeight * 0.8);

    // Almacén Norte
    const northPos = mapToCanvas(NORTH_WAREHOUSE.x, NORTH_WAREHOUSE.y);
    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    const northRadius = Math.min(cellWidth, cellHeight) * 0.3;
    ctx.arc(northPos.x, northPos.y, northRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1e293b";
    ctx.fillText("Almacén Norte", northPos.x - cellWidth * 1.5, northPos.y - cellHeight * 0.6);

    // Almacén Este
    const eastPos = mapToCanvas(EAST_WAREHOUSE.x, EAST_WAREHOUSE.y);
    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    const eastRadius = Math.min(cellWidth, cellHeight) * 0.3;
    ctx.arc(eastPos.x, eastPos.y, eastRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1e293b";
    ctx.fillText("Almacén Este", eastPos.x - cellWidth * 1.5, eastPos.y - cellHeight * 0.6);

    // Dibujar cliente si existe simulationData
    if (simulationData) {
      const customerPos = mapToCanvas(simulationData.customer.x, simulationData.customer.y);
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      const customerSize = Math.min(cellWidth, cellHeight) * 0.3;
      ctx.rect(
        customerPos.x - customerSize / 2,
        customerPos.y - customerSize / 2,
        customerSize,
        customerSize
      );
      ctx.fill();
      ctx.fillStyle = "#1e293b";
      const customerFontSize = Math.max(8, Math.min(cellWidth, cellHeight) * 0.2);
      ctx.font = `${customerFontSize}px sans-serif`;
      ctx.fillText("Cliente", customerPos.x - cellWidth * 0.8, customerPos.y - cellHeight * 0.4);

      // Dibujar ruta recorrida
      if (currentRouteIndex > 0) {
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = Math.max(2, Math.min(cellWidth, cellHeight) * 0.1) / zoom;
        ctx.beginPath();

        for (let i = 0; i < currentRouteIndex && i < simulationData.route.length - 1; i++) {
          const from = mapToCanvas(simulationData.route[i].x, simulationData.route[i].y);
          const to = mapToCanvas(simulationData.route[i + 1].x, simulationData.route[i + 1].y);

          if (i === 0) {
            ctx.moveTo(from.x, from.y);
          }
          ctx.lineTo(to.x, to.y);
        }
        ctx.stroke();
      }

      // Dibujar camión en posición actual
      if (currentRouteIndex < simulationData.route.length) {
        const currentPos = simulationData.route[currentRouteIndex];
        const truckPos = mapToCanvas(currentPos.x, currentPos.y);

        ctx.fillStyle = "#ef4444";
        ctx.save();
        ctx.translate(truckPos.x, truckPos.y);

        // Calcular ángulo de rotación basado en dirección
        let angle = 0;
        if (currentRouteIndex > 0 && currentRouteIndex < simulationData.route.length) {
          const prevPos = simulationData.route[currentRouteIndex - 1];
          const dx = currentPos.x - prevPos.x;
          const dy = currentPos.y - prevPos.y;
          angle = Math.atan2(dy, dx);
        }

        ctx.rotate(angle);

        // Dibujar camión como triángulo
        const truckSize = Math.min(cellWidth, cellHeight) * 0.2;
        ctx.beginPath();
        ctx.moveTo(truckSize, 0);
        ctx.lineTo(-truckSize * 0.7, -truckSize * 0.7);
        ctx.lineTo(-truckSize * 0.7, truckSize * 0.7);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.5));
  };

  return (
    <Card className="h-[calc(100vh-12rem)]">
      <Tabs defaultValue="map">
        <div className="flex items-center justify-between border-b px-4">
          <TabsList className="h-12">
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="list">Route List</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-1">
            {/* Controles de simulación */}
            {isSimulating && (
              <>
                <Button variant="ghost" size="icon" onClick={handlePlayPause}>
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={handleStop}>
                  <Square className="h-4 w-4" />
                </Button>
              </>
            )}
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
            <div className="relative h-full w-full overflow-hidden">
              <canvas
                ref={canvasRef}
                className="block w-full h-full"
                style={{ maxWidth: "100%", maxHeight: "100%" }}
              />

              {/* Información de simulación */}
              {isSimulating && simulationData && (
                <div className="absolute top-4 left-4 flex flex-col gap-1 bg-background/90 p-3 rounded-md border">
                  <div className="font-medium text-sm">Simulación Activa</div>
                  <div className="text-xs">Tiempo: {formatTime(simulationTime)}</div>
                  <div className="text-xs">
                    Paso: {currentRouteIndex + 1}/{simulationData.route.length}
                  </div>
                  <div className="text-xs">
                    Posición: ({simulationData.route[currentRouteIndex]?.x},{" "}
                    {simulationData.route[currentRouteIndex]?.y})
                  </div>
                  {isPaused && <div className="text-xs text-yellow-600">PAUSADO</div>}
                </div>
              )}

              {/* Leyenda */}
              <div className="absolute bottom-4 left-4 flex flex-col gap-2 bg-background/80 p-2 rounded-md border">
                <div className="text-xs font-medium">Leyenda</div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span>Almacén Central</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span>Almacenes Intermedios</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="h-3 w-3 rounded bg-amber-500"></div>
                  <span>Cliente</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <span>Camión</span>
                </div>
                <div className="text-xs text-muted-foreground mt-2">Mapa: 70x50 unidades</div>
              </div>

              {/* Posiciones de almacenes */}
              <div className="absolute top-4 right-4 flex flex-col gap-1 bg-background/80 p-2 rounded-md border text-xs">
                <div className="font-medium">Posiciones:</div>
                <div>
                  Central: ({MAIN_WAREHOUSE.x}, {MAIN_WAREHOUSE.y})
                </div>
                <div>
                  Norte: ({NORTH_WAREHOUSE.x}, {NORTH_WAREHOUSE.y})
                </div>
                <div>
                  Este: ({EAST_WAREHOUSE.x}, {EAST_WAREHOUSE.y})
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="list" className="m-0 p-4 h-full overflow-auto">
            <div className="space-y-4">
              {simulationData && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Ruta Optimizada
                  </h3>
                  <div className="rounded-md border p-3 space-y-2">
                    <div className="text-xs text-muted-foreground">
                      Total de pasos: {simulationData.route.length}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Tiempo estimado: {formatTime(simulationData.route.length * 72)}
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {simulationData.route.map((point, index) => (
                        <div
                          key={index}
                          className={`text-xs p-1 rounded ${
                            index === currentRouteIndex
                              ? "bg-blue-100 font-medium"
                              : index < currentRouteIndex
                              ? "bg-green-50"
                              : "bg-gray-50"
                          }`}
                        >
                          {index + 1}. ({point.x}, {point.y}) - {formatTime(index * 72)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
