/* eslint-disable @typescript-eslint/no-explicit-any */
// components/map/Map.tsx

'use client';

import React, { useRef, useState, useCallback } from 'react';
import { 
  MapState, 
  MapConfig, 
  ViewportState, 
  MapEventHandlers, 
  MapFilters, 
  GridPosition,
  MapTheme
} from '@/types/map';
import { 
  DEFAULT_MAP_CONFIG,  
  gridToPixel, 
  filterMapData
} from '@/lib/mapUtils';
import { MapRenderer } from './MapRenderer';
import { EntityTooltip } from './EntityTooltip';
import { cn } from '@/lib/utils';

interface MapProps {
  data: MapState;
  config?: Partial<MapConfig>;
  filters?: Partial<MapFilters>;
  eventHandlers?: MapEventHandlers;
  theme?: Partial<MapTheme>;
  className?: string;
  showControls?: boolean;
  showTooltips?: boolean;
  enablePanning?: boolean;
  enableZooming?: boolean;
  maxZoom?: number;
  minZoom?: number;
}

const DEFAULT_FILTERS: MapFilters = {
  showVehicles: true,
  showPlants: true,
  showTanks: true,
  showClients: true,
  showRefuelStations: true,
  showRoutes: true,
  showBlockages: true,
  showBreakdowns: true,
  showMaintenances: true,
  vehicleTypes: ['TA', 'TB', 'TC', 'TD'],
  vehicleStatuses: ['idle', 'delivering', 'returning', 'maintenance', 'refueling', 'broken'],
  routeTypes: ['supply', 'delivery', 'return', 'maintenance'],
  blockageSeverities: ['low', 'medium', 'high', 'critical'],
};

const DEFAULT_THEME: MapTheme = {
  backgroundColor: '#ffffff',
  gridColor: '#e2e8f0',
  gridOpacity: 0.5,
  entityColors: {
    vehicle: {
      idle: '#6B7280',
      delivering: '#1E40AF',
      returning: '#7E22CE',
      maintenance: '#DC2626',
      refueling: '#F59E0B',
      broken: '#EF4444',
    },
    plant: '#1E3A8A',
    tank: {
      operational: '#047857',
      low: '#F59E0B',
      critical: '#DC2626',
      maintenance: '#6B7280',
    },
    client: {
      active: '#059669',
      pending: '#F59E0B',
      served: '#10B981',
      overdue: '#DC2626',
    },
    refuelStation: '#F59E0B',
    route: {
      supply: '#1E40AF',
      delivery: '#047857',
      return: '#7E22CE',
      maintenance: '#DC2626',
    },
    blockage: {
      low: '#FCD34D',
      medium: '#F59E0B',
      high: '#DC2626',
      critical: '#991B1B',
    },
    breakdown: {
      minor: '#F59E0B',
      major: '#DC2626',
      critical: '#991B1B',
    },
  },
};

export function Map({
  data,
  config = {},
  filters = {},
  eventHandlers = {},
  theme = {},
  className,
  showControls = true,
  showTooltips = true,
}: MapProps) {
  // Configuration
  const mapConfig: MapConfig = { ...DEFAULT_MAP_CONFIG, ...config };
  const mapFilters: MapFilters = { ...DEFAULT_FILTERS, ...filters };
  const mapTheme: MapTheme = { ...DEFAULT_THEME, ...theme };

  const [viewport, setViewport] = useState<ViewportState>({
    zoom: 1,
    panX: 0,
    panY: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<GridPosition | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter data based on current filters and viewport
  const filteredData = filterMapData(data, mapFilters, viewport);

  // Fixed canvas dimensions - no dynamic sizing
  const canvasWidth = mapConfig.width * mapConfig.cellSize;
  const canvasHeight = mapConfig.height * mapConfig.cellSize;

  // Event handlers - SIMPLIFIED: no panning/zooming, only entity selection
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    // Convert screen coordinates to grid position (no viewport transformation needed)
    const worldPos = pixelToGrid(screenX, screenY, mapConfig.cellSize);
    setHoveredPosition(worldPos);
    setTooltipPosition({ x: screenX, y: screenY });

    // Trigger hover event
    eventHandlers.onCellHover?.(worldPos);
  }, [mapConfig.cellSize, eventHandlers]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldPos = pixelToGrid(screenX, screenY, mapConfig.cellSize);

    // Find clicked entity
    let clickedEntity = null;

    // Check vehicles
    for (const vehicle of filteredData.vehicles || []) {
      const vehiclePixel = gridToPixel(vehicle.position, mapConfig.cellSize);
      
      if (Math.abs(screenX - vehiclePixel.x) < mapConfig.cellSize/2 && 
          Math.abs(screenY - vehiclePixel.y) < mapConfig.cellSize/2) {
        clickedEntity = vehicle;
        eventHandlers.onVehicleClick?.(vehicle);
        break;
      }
    }

    // Check other entities similarly...
    if (!clickedEntity) {
      for (const client of filteredData.clients || []) {
        const clientPixel = gridToPixel(client.position, mapConfig.cellSize);
        if (Math.abs(screenX - clientPixel.x) < mapConfig.cellSize/2 && 
            Math.abs(screenY - clientPixel.y) < mapConfig.cellSize/2) {
          clickedEntity = client;
          eventHandlers.onClientClick?.(client);
          break;
        }
      }
    }

    // Check tanks
    if (!clickedEntity) {
      for (const tank of filteredData.tanks || []) {
        const tankPixel = gridToPixel(tank.position, mapConfig.cellSize);
        if (Math.abs(screenX - tankPixel.x) < mapConfig.cellSize/2 && 
            Math.abs(screenY - tankPixel.y) < mapConfig.cellSize/2) {
          clickedEntity = tank;
          eventHandlers.onTankClick?.(tank);
          break;
        }
      }
    }

    // Check plants
    if (!clickedEntity) {
      for (const plant of filteredData.plants || []) {
        const plantPixel = gridToPixel(plant.position, mapConfig.cellSize);
        if (Math.abs(screenX - plantPixel.x) < mapConfig.cellSize/2 && 
            Math.abs(screenY - plantPixel.y) < mapConfig.cellSize/2) {
          clickedEntity = plant;
          eventHandlers.onPlantClick?.(plant);
          break;
        }
      }
    }

    setSelectedEntity(clickedEntity);
    eventHandlers.onCellClick?.(worldPos);
  }, [mapConfig.cellSize, filteredData, eventHandlers]);

  // Remove viewport controls since map is now fixed
  // No zoom, pan, or viewport manipulation needed

  return (
    <div 
      ref={containerRef}
      className={cn("relative bg-white border rounded-lg overflow-hidden", className)}
      style={{ width: canvasWidth, height: canvasHeight }}
    >
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="block cursor-pointer"
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      />

      <MapRenderer
        canvas={canvasRef.current}
        data={filteredData}
        config={mapConfig}
        viewport={{ zoom: 1, panX: 0, panY: 0 }} // Fixed viewport
        theme={mapTheme}
        selectedEntity={selectedEntity}
        hoveredPosition={hoveredPosition}
      />

      {showControls && (
        <div className="absolute top-2 right-2">
          <MapFilters
            filters={mapFilters}
            data={data}
            onFiltersChange={() => {}} // Simplified - filters can be managed externally
          />
        </div>
      )}

      {showTooltips && selectedEntity && tooltipPosition && (
        <EntityTooltip
          entity={selectedEntity}
          position={tooltipPosition}
          onClose={() => setSelectedEntity(null)}
        />
      )}
    </div>
  );
}