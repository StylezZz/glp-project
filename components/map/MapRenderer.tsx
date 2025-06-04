/* eslint-disable @typescript-eslint/no-explicit-any */
// components/map/MapRenderer.tsx

'use client';

import { useEffect } from 'react';
import {
  MapState,
  MapConfig,
  ViewportState,
  MapTheme,
  GridPosition,
  Vehicle,
  Route,
  Blockage,
  Breakdown,
} from '@/types/map';
import {
  gridToPixel,
  getVehicleDirection,
} from '@/lib/mapUtils';

interface MapRendererProps {
  canvas: HTMLCanvasElement | null;
  data: Partial<MapState>;
  config: MapConfig;
  viewport: ViewportState;
  theme: MapTheme;
  selectedEntity?: any;
  hoveredPosition?: GridPosition | null;
}

export function MapRenderer({
  canvas,
  data,
  config,
  theme,
  selectedEntity,
  hoveredPosition,
}: MapRendererProps) {
  useEffect(() => {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // No viewport transformations needed - fixed map
    ctx.save();

    // Draw background
    ctx.fillStyle = theme.backgroundColor;
    ctx.fillRect(0, 0, config.width * config.cellSize, config.height * config.cellSize);

    // Draw grid
    drawGrid(ctx, config, theme);

    // Draw routes (behind entities)
    if (data.routes) {
      data.routes.forEach(route => drawRoute(ctx, route, config, theme));
    }

    // Draw blockages
    if (data.blockages) {
      data.blockages.forEach(blockage => drawBlockage(ctx, blockage, config, theme));
    }

    // Draw entities
    if (data.plants) {
      data.plants.forEach(plant => drawPlant(ctx, plant, config, theme, plant === selectedEntity));
    }

    if (data.tanks) {
      data.tanks.forEach(tank => drawTank(ctx, tank, config, theme, tank === selectedEntity));
    }

    if (data.refuelStations) {
      data.refuelStations.forEach(station => 
        drawRefuelStation(ctx, station, config, theme, station === selectedEntity)
      );
    }

    if (data.clients) {
      data.clients.forEach(client => drawClient(ctx, client, config, theme, client === selectedEntity));
    }

    // Draw breakdowns
    if (data.breakdowns) {
      data.breakdowns.forEach(breakdown => drawBreakdown(ctx, breakdown, config, theme));
    }

    // Draw vehicles (on top)
    if (data.vehicles) {
      data.vehicles.forEach(vehicle => drawVehicle(ctx, vehicle, config, theme, vehicle === selectedEntity));
    }

    // Draw hovered cell highlight
    if (hoveredPosition) {
      drawCellHighlight(ctx, hoveredPosition, config, '#3B82F6', 0.2);
    }

    ctx.restore();
  }, [canvas, data, config, theme, selectedEntity, hoveredPosition]); // Removed viewport dependency

  return null; // This component only renders to canvas
}

function drawGrid(ctx: CanvasRenderingContext2D, config: MapConfig, theme: MapTheme) {
  ctx.strokeStyle = theme.gridColor;
  ctx.globalAlpha = theme.gridOpacity;
  ctx.lineWidth = 1;
  ctx.beginPath();

  // Vertical lines
  for (let x = 0; x <= config.width; x++) {
    ctx.moveTo(x * config.cellSize, 0);
    ctx.lineTo(x * config.cellSize, config.height * config.cellSize);
  }

  // Horizontal lines
  for (let y = 0; y <= config.height; y++) {
    ctx.moveTo(0, y * config.cellSize);
    ctx.lineTo(config.width * config.cellSize, y * config.cellSize);
  }

  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawRoute(ctx: CanvasRenderingContext2D, route: Route, config: MapConfig, theme: MapTheme) {
  if (route.path.length < 2) return;

  ctx.strokeStyle = theme.entityColors.route[route.type];
  ctx.lineWidth = route.type === 'supply' ? 3 : 2;
  ctx.globalAlpha = route.status === 'active' ? 1 : 0.5;

  // Set line style based on route type
  if (route.type === 'return' || route.type === 'maintenance') {
    ctx.setLineDash([5, 5]);
  } else {
    ctx.setLineDash([]);
  }

  ctx.beginPath();
  const startPixel = gridToPixel(route.path[0], config.cellSize);
  ctx.moveTo(startPixel.x, startPixel.y);

  for (let i = 1; i < route.path.length; i++) {
    const pixel = gridToPixel(route.path[i], config.cellSize);
    ctx.lineTo(pixel.x, pixel.y);
  }

  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;

  // Draw direction arrows
  drawRouteArrows(ctx, route, config);
}

function drawRouteArrows(ctx: CanvasRenderingContext2D, route: Route, config: MapConfig) {
  if (route.path.length < 2) return;

  ctx.fillStyle = ctx.strokeStyle;
  
  for (let i = 1; i < route.path.length; i++) {
    const from = route.path[i - 1];
    const to = route.path[i];
    const fromPixel = gridToPixel(from, config.cellSize);
    const toPixel = gridToPixel(to, config.cellSize);

    // Calculate arrow position (middle of segment)
    const midX = (fromPixel.x + toPixel.x) / 2;
    const midY = (fromPixel.y + toPixel.y) / 2;

    // Calculate direction
    const angle = Math.atan2(toPixel.y - fromPixel.y, toPixel.x - fromPixel.x);

    // Draw arrow
    ctx.save();
    ctx.translate(midX, midY);
    ctx.rotate(angle);
    
    ctx.beginPath();
    ctx.moveTo(-5, -3);
    ctx.lineTo(0, 0);
    ctx.lineTo(-5, 3);
    ctx.stroke();
    
    ctx.restore();
  }
}

// Cache para las imágenes de los camiones
const vehicleImages: Record<string, HTMLImageElement> = {};

// Función para cargar imágenes de camiones
function loadVehicleImage(imagePath: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (vehicleImages[imagePath]) {
      resolve(vehicleImages[imagePath]);
      return;
    }
    
    const img = new Image();
    img.onload = () => {
      vehicleImages[imagePath] = img;
      resolve(img);
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${imagePath}`));
    img.src = imagePath;
  });
}

// Función para dibujar vehículos con imágenes
function drawVehicle(
  ctx: CanvasRenderingContext2D,
  vehicle: Vehicle,
  config: MapConfig,
  theme: MapTheme,
  isSelected: boolean = false
) {
  const pixel = gridToPixel(vehicle.position, config.cellSize);
  const direction = getVehicleDirection(vehicle);
  
  // Configuración por tipo de vehículo
  const vehicleConfig = getVehicleConfig(vehicle.type);
  const baseSize = config.cellSize * 0.8; // Aumentamos el tamaño base para las imágenes
  const size = baseSize * vehicleConfig.sizeMultiplier;
  
  // Color de estado para indicadores
  const statusColor = theme.entityColors.vehicle[vehicle.status];
  
  // Intentar dibujar la imagen del camión
  const imagePath = vehicleConfig.imagePath;
  if (imagePath) {
    // Verificar si la imagen ya está en caché
    if (vehicleImages[imagePath]) {
      drawVehicleImage(ctx, vehicleImages[imagePath], pixel, size, direction, vehicle.status !== 'idle' ? statusColor : null);
    } else {
      // Cargar la imagen si no está en caché
      loadVehicleImage(imagePath)
        .then(img => {
          vehicleImages[imagePath] = img;
          drawVehicleImage(ctx, img, pixel, size, direction, vehicle.status !== 'idle' ? statusColor : null);
        })
        .catch(err => {
          console.error('Error loading vehicle image:', err);
          // Fallback: dibujar un rectángulo con el color del tipo de vehículo
          drawVehicleFallback(ctx, pixel, size, vehicleConfig.color, statusColor);
        });
    }
  } else {
    // Fallback si no hay imagen definida
    drawVehicleFallback(ctx, pixel, size, vehicleConfig.color, statusColor);
  }
  
  // Dibujar indicador de tipo de vehículo
  drawVehicleTypeIndicator(ctx, pixel.x, pixel.y, vehicle.type, size);
  
  // Dibujar nivel de combustible (barra debajo del vehículo)
  drawFuelIndicator(ctx, pixel.x, pixel.y, vehicle.fuelLevel, size);
  
  // Dibujar capacidad (texto en la parte inferior)
  ctx.fillStyle = '#000';
  ctx.font = `${Math.max(6, config.cellSize * 0.2)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(`${vehicleConfig.glpCapacity}m³`, pixel.x, pixel.y + size + 10); // Ajustado para no solapar con la barra de combustible
  
  // Dibujar highlight de selección
  if (isSelected) {
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(pixel.x, pixel.y, size + 3, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Mostrar información adicional cuando está seleccionado
    const infoY = pixel.y + size + 25;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(pixel.x - 50, infoY, 100, 40);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '8px Arial';
    ctx.fillText(`Peso Bruto: ${vehicleConfig.grossWeight} Ton`, pixel.x, infoY + 10);
    ctx.fillText(`Carga GLP: ${vehicleConfig.glpWeight} Ton`, pixel.x, infoY + 20);
    ctx.fillText(`Peso Combinado: ${vehicleConfig.combinedWeight} Ton`, pixel.x, infoY + 30);
  }
  
  // Dibujar indicadores de estado especiales
  if (vehicle.status === 'maintenance' || vehicle.status === 'broken') {
    drawStatusIcon(ctx, pixel, config, vehicle.status === 'broken' ? '⚠' : '🔧');
  }
}

// Función para dibujar la imagen del camión
function drawVehicleImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  pixel: { x: number, y: number },
  size: number,
  direction: string,
  statusColor: string | null
) {
  ctx.save();
  
  // Aplicar rotación según la dirección
  ctx.translate(pixel.x, pixel.y);
  switch (direction) {
    case '→': ctx.rotate(0); break;
    case '↓': ctx.rotate(Math.PI / 2); break;
    case '←': ctx.rotate(Math.PI); break;
    case '↑': ctx.rotate(-Math.PI / 2); break;
    default: ctx.rotate(0);
  }
  
  // Dibujar sombra
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.fillRect(-size/2 + 2, -size/2 + 2, size, size);
  
  // Dibujar la imagen del camión
  ctx.drawImage(image, -size/2, -size/2, size, size);
  
  // Dibujar borde de estado si es necesario
  if (statusColor) {
    ctx.strokeStyle = statusColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(-size/2, -size/2, size, size);
  }
  
  ctx.restore();
}

// Función de fallback para dibujar vehículos sin imagen
function drawVehicleFallback(
  ctx: CanvasRenderingContext2D,
  pixel: { x: number, y: number },
  size: number,
  vehicleColor: string,
  statusColor: string
) {
  // Dibujar sombra
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.fillRect(pixel.x - size/2 + 1, pixel.y - size/2 + 1, size, size);
  
  // Dibujar cuerpo principal del vehículo (rectángulo)
  ctx.fillStyle = vehicleColor;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.fillRect(pixel.x - size/2, pixel.y - size/2, size, size);
  ctx.strokeRect(pixel.x - size/2, pixel.y - size/2, size, size);
  
  // Dibujar indicador de estado (borde interno)
  ctx.strokeStyle = statusColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(pixel.x - size/2 + 2, pixel.y - size/2 + 2, size - 4, size - 4);
}

// Configuración de cada tipo de vehículo
function getVehicleConfig(type: Vehicle['type']) {
  const configs = {
    TA: {
      color: '#EF4444', // Rojo
      sizeMultiplier: 1.3,
      dots: 4,
      imagePath: '/vehicles/truck_TA.png',
      grossWeight: 2.5, // Ton
      glpCapacity: 25, // m3
      glpWeight: 12.5, // Ton
      combinedWeight: 15.0, // Ton
    },
    TB: {
      color: '#3B82F6', // Azul
      sizeMultiplier: 1.1,
      dots: 3,
      imagePath: '/vehicles/truck_TB.png',
      grossWeight: 2.0, // Ton
      glpCapacity: 15, // m3
      glpWeight: 7.5, // Ton
      combinedWeight: 9.5, // Ton
    },
    TC: {
      color: '#22C55E', // Verde
      sizeMultiplier: 0.9,
      dots: 2,
      imagePath: '/vehicles/truck_TC.png',
      grossWeight: 1.5, // Ton
      glpCapacity: 10, // m3
      glpWeight: 5.0, // Ton
      combinedWeight: 6.5, // Ton
    },
    TD: {
      color: '#8B5CF6', // Púrpura
      sizeMultiplier: 0.7,
      dots: 1,
      imagePath: '/vehicles/tuck_TD.png', // Nota: hay un error en el nombre del archivo (tuck en lugar de truck)
      grossWeight: 1.0, // Ton
      glpCapacity: 5, // m3
      glpWeight: 2.5, // Ton
      combinedWeight: 3.5, // Ton
    },
  };
  return configs[type];
}

// Dibujar flecha direccional
function drawDirectionArrow(
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  direction: string, 
  size: number
) {
  ctx.save();
  ctx.translate(x, y);
  
  // Rotar según la dirección
  switch (direction) {
    case '→': ctx.rotate(0); break;
    case '↓': ctx.rotate(Math.PI / 2); break;
    case '←': ctx.rotate(Math.PI); break;
    case '↑': ctx.rotate(-Math.PI / 2); break;
    default: ctx.rotate(0);
  }
  
  // Dibujar flecha
  ctx.fillStyle = '#FFF';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(size * 0.3, 0);
  ctx.lineTo(-size * 0.2, -size * 0.2);
  ctx.lineTo(-size * 0.1, 0);
  ctx.lineTo(-size * 0.2, size * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  ctx.restore();
}

// Dibujar indicador de tipo de vehículo (etiqueta)
function drawVehicleTypeIndicator(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  type: Vehicle['type'],
  size: number
) {
  // Crear un fondo para la etiqueta del tipo de vehículo
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  const padding = 2;
  const labelWidth = 16;
  const labelHeight = 12;
  
  // Dibujar fondo de la etiqueta
  ctx.fillRect(
    x - labelWidth/2,
    y - size/2 - labelHeight - padding,
    labelWidth,
    labelHeight
  );
  
  // Dibujar texto del tipo de vehículo
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '8px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    type,
    x,
    y - size/2 - labelHeight/2 - padding
  );
}

// Dibujar indicador de combustible como barra horizontal
function drawFuelIndicator(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  fuelLevel: number,
  size: number
) {
  const barWidth = size * 0.8;
  const barHeight = 3;
  const barY = y + size/2 + 5; // Posición debajo del camión
  
  // Fondo de la barra (gris)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.fillRect(x - barWidth/2, barY, barWidth, barHeight);
  
  // Nivel de combustible (verde o rojo según el nivel)
  const fillWidth = (fuelLevel / 100) * barWidth;
  ctx.fillStyle = fuelLevel > 30 ? '#10B981' : '#EF4444';
  ctx.fillRect(x - barWidth/2, barY, fillWidth, barHeight);
  
  // Borde de la barra
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(x - barWidth/2, barY, barWidth, barHeight);
}

function drawPlant(
  ctx: CanvasRenderingContext2D,
  plant: any,
  config: MapConfig,
  theme: MapTheme,
  isSelected: boolean = false
) {
  const pixel = gridToPixel(plant.position, config.cellSize);
  const size = config.cellSize * 0.9;

  // Draw plant building
  ctx.fillStyle = theme.entityColors.plant;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;

  // Main building
  ctx.fillRect(pixel.x - size/2, pixel.y - size/2, size, size);
  ctx.strokeRect(pixel.x - size/2, pixel.y - size/2, size, size);

  // Chimney - smaller
  const chimneyWidth = size * 0.2;
  const chimneyHeight = size * 0.3;
  ctx.fillRect(
    pixel.x - chimneyWidth/2,
    pixel.y - size/2 - chimneyHeight,
    chimneyWidth,
    chimneyHeight
  );
  ctx.strokeRect(
    pixel.x - chimneyWidth/2,
    pixel.y - size/2 - chimneyHeight,
    chimneyWidth,
    chimneyHeight
  );

  // Label - smaller font
  ctx.fillStyle = '#000';
  ctx.font = `${Math.max(6, config.cellSize * 0.3)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(plant.name || 'Plant', pixel.x, pixel.y + size/2 + 2);

  // Selection highlight
  if (isSelected) {
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    ctx.strokeRect(pixel.x - size/2 - 2, pixel.y - size/2 - 2, size + 4, size + 4);
  }
}

function drawTank(
  ctx: CanvasRenderingContext2D,
  tank: any,
  config: MapConfig,
  theme: MapTheme,
  isSelected: boolean = false
) {
  const pixel = gridToPixel(tank.position, config.cellSize);
  const radius = config.cellSize * 0.4;

  // Draw tank circle
  ctx.fillStyle = theme.entityColors.tank[tank.status] || theme.entityColors.tank.operational;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.arc(pixel.x, pixel.y, radius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();

  // Draw level indicator
  const levelHeight = (tank.currentLevel / tank.capacity) * (radius * 2);
  ctx.fillStyle = tank.currentLevel / tank.capacity > 0.2 ? '#3B82F6' : '#EF4444';
  
  ctx.save();
  ctx.beginPath();
  ctx.arc(pixel.x, pixel.y, radius - 1, 0, 2 * Math.PI);
  ctx.clip();
  
  ctx.fillRect(
    pixel.x - radius + 1,
    pixel.y + radius - 1 - levelHeight,
    (radius - 1) * 2,
    levelHeight
  );
  ctx.restore();

  // Label - smaller font
  ctx.fillStyle = '#000';
  ctx.font = `${Math.max(6, config.cellSize * 0.25)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(tank.name || 'Tank', pixel.x, pixel.y + radius + 2);

  // Selection highlight
  if (isSelected) {
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(pixel.x, pixel.y, radius + 2, 0, 2 * Math.PI);
    ctx.stroke();
  }
}

function drawClient(
  ctx: CanvasRenderingContext2D,
  client: any,
  config: MapConfig,
  theme: MapTheme,
  isSelected: boolean = false
) {
  const pixel = gridToPixel(client.position, config.cellSize);
  const size = config.cellSize * 0.6;

  // Draw client marker
  ctx.fillStyle = theme.entityColors.client[client.status] || theme.entityColors.client.active;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 0.5;

  ctx.beginPath();
  ctx.arc(pixel.x, pixel.y, size/2, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();

  // Draw priority indicator - smaller
  if (client.priority === 'high' || client.priority === 'critical') {
    ctx.fillStyle = client.priority === 'critical' ? '#DC2626' : '#F59E0B';
    ctx.beginPath();
    ctx.arc(pixel.x + size/3, pixel.y - size/3, size/8, 0, 2 * Math.PI);
    ctx.fill();
  }

  // Label - smaller font
  ctx.fillStyle = '#000';
  ctx.font = `${Math.max(6, config.cellSize * 0.25)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(client.name || 'Client', pixel.x, pixel.y + size/2 + 2);

  // Selection highlight
  if (isSelected) {
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(pixel.x, pixel.y, size/2 + 2, 0, 2 * Math.PI);
    ctx.stroke();
  }
}

function drawRefuelStation(
  ctx: CanvasRenderingContext2D,
  station: any,
  config: MapConfig,
  theme: MapTheme,
  isSelected: boolean = false
) {
  const pixel = gridToPixel(station.position, config.cellSize);
  const size = config.cellSize * 0.5;

  // Draw pump
  ctx.fillStyle = theme.entityColors.refuelStation;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;

  ctx.fillRect(pixel.x - size/4, pixel.y - size/2, size/2, size);
  ctx.strokeRect(pixel.x - size/4, pixel.y - size/2, size/2, size);

  // Draw hose
  ctx.beginPath();
  ctx.moveTo(pixel.x, pixel.y - size/2);
  ctx.lineTo(pixel.x + size/2, pixel.y - size/4);
  ctx.stroke();

  // Label
  ctx.fillStyle = '#000';
  ctx.font = `${config.cellSize * 0.25}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('Fuel', pixel.x, pixel.y + size/2 + 5);

  // Selection highlight
  if (isSelected) {
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 3;
    ctx.strokeRect(pixel.x - size/4 - 3, pixel.y - size/2 - 3, size/2 + 6, size + 6);
  }
}

function drawBlockage(
  ctx: CanvasRenderingContext2D,
  blockage: Blockage,
  config: MapConfig,
  theme: MapTheme
) {
  const fromPixel = gridToPixel(blockage.from, config.cellSize);
  const toPixel = gridToPixel(blockage.to, config.cellSize);

  ctx.strokeStyle = theme.entityColors.blockage[blockage.severity];
  ctx.lineWidth = 6;
  ctx.setLineDash([8, 4]);

  ctx.beginPath();
  ctx.moveTo(fromPixel.x, fromPixel.y);
  ctx.lineTo(toPixel.x, toPixel.y);
  ctx.stroke();

  ctx.setLineDash([]);

  // Draw blockage icon
  const midX = (fromPixel.x + toPixel.x) / 2;
  const midY = (fromPixel.y + toPixel.y) / 2;

  ctx.fillStyle = '#000';
  ctx.font = `${config.cellSize * 0.4}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🚫', midX, midY);
}

function drawBreakdown(
  ctx: CanvasRenderingContext2D,
  breakdown: Breakdown,
  config: MapConfig,
  theme: MapTheme
) {
  const pixel = gridToPixel(breakdown.position, config.cellSize);

  // Draw breakdown indicator
  ctx.fillStyle = theme.entityColors.breakdown[breakdown.severity];
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(pixel.x, pixel.y, config.cellSize * 0.3, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();

  // Draw warning icon
  ctx.fillStyle = '#FFF';
  ctx.font = `${config.cellSize * 0.3}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⚠', pixel.x, pixel.y);
}

function drawStatusIcon(
  ctx: CanvasRenderingContext2D,
  pixel: { x: number; y: number },
  config: MapConfig,
  icon: string
) {
  ctx.fillStyle = '#000';
  ctx.font = `${config.cellSize * 0.3}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(icon, pixel.x + config.cellSize * 0.4, pixel.y - config.cellSize * 0.4);
}

function drawCellHighlight(
  ctx: CanvasRenderingContext2D,
  position: GridPosition,
  config: MapConfig,
  color: string,
  alpha: number = 0.3
) {
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.fillRect(
    position.x * config.cellSize,
    position.y * config.cellSize,
    config.cellSize,
    config.cellSize
  );
  ctx.globalAlpha = 1;
}