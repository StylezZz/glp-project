// components/map/MapControls.tsx

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  MapPin, 
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';
import { ViewportState, GridPosition } from '@/types/map';

interface Entity {
  id: string;
  position: GridPosition;
  name?: string;
  status?: string;
}

interface MapControlsProps {
  viewport: ViewportState;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onCenterOn: (position: GridPosition) => void;
  entities: Entity[];
  className?: string;
}

export function MapControls({
  viewport,
  onZoomIn,
  onZoomOut,
  onResetView,
  onCenterOn,
  entities,
  className
}: MapControlsProps) {
  const [selectedEntityId, setSelectedEntityId] = React.useState<string>('');
  const [showFilters, setShowFilters] = React.useState(false);

  const handleEntitySelect = (entityId: string) => {
    const entity = entities.find(e => e.id === entityId);
    if (entity) {
      onCenterOn(entity.position);
      setSelectedEntityId(entityId);
    }
  };

  const formatZoom = (zoom: number) => {
    return `${Math.round(zoom * 100)}%`;
  };

  return (
    <div className={`absolute top-4 left-4 space-y-2 ${className}`}>
      {/* Zoom Controls */}
      <Card className="p-2">
        <div className="flex flex-col space-y-1">
          <Button
            size="sm"
            variant="outline"
            onClick={onZoomIn}
            title="Zoom In (+)"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <div className="text-xs text-center text-muted-foreground py-1">
            {formatZoom(viewport.zoom)}
          </div>
          
          <Button
            size="sm"
            variant="outline"
            onClick={onZoomOut}
            title="Zoom Out (-)"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={onResetView}
            title="Reset View (0)"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Entity Navigation */}
      <Card className="p-3 w-64">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span className="text-sm font-medium">Go to Entity</span>
          </div>
          
          <Select value={selectedEntityId} onValueChange={handleEntitySelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select entity to view" />
            </SelectTrigger>
            <SelectContent>
              {entities.map((entity) => (
                <SelectItem key={entity.id} value={entity.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{entity.name || entity.id}</span>
                    {entity.status && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        {entity.status}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Layer Visibility Controls */}
      <Card className="p-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">Layers</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {showFilters && (
            <div className="space-y-2 border-t pt-2">
              <LayerToggle label="Vehicles" enabled={true} />
              <LayerToggle label="Routes" enabled={true} />
              <LayerToggle label="Blockages" enabled={true} />
              <LayerToggle label="Plants" enabled={true} />
              <LayerToggle label="Tanks" enabled={true} />
              <LayerToggle label="Clients" enabled={true} />
              <LayerToggle label="Fuel Stations" enabled={true} />
            </div>
          )}
        </div>
      </Card>

      {/* Viewport Info */}
      <Card className="p-2">
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Zoom: {formatZoom(viewport.zoom)}</div>
          <div>Pan: {Math.round(viewport.panX)}, {Math.round(viewport.panY)}</div>
          {viewport.centerPosition && (
            <div>
              Center: {Math.round(viewport.centerPosition.x)}, {Math.round(viewport.centerPosition.y)}
            </div>
          )}
        </div>
      </Card>

      {/* Keyboard Shortcuts Help */}
      <Card className="p-3">
        <div className="space-y-1">
          <div className="text-sm font-medium mb-2">Keyboard Shortcuts</div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div><kbd className="text-xs">+</kbd> Zoom In</div>
            <div><kbd className="text-xs">-</kbd> Zoom Out</div>
            <div><kbd className="text-xs">0</kbd> Reset View</div>
            <div><kbd className="text-xs">Drag</kbd> Pan Map</div>
            <div><kbd className="text-xs">Wheel</kbd> Zoom</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

interface LayerToggleProps {
  label: string;
  enabled: boolean;
  onChange?: (enabled: boolean) => void;
}

function LayerToggle({ label, enabled, onChange }: LayerToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <Button
        size="sm"
        variant="ghost"
        className="h-6 w-6 p-0"
        onClick={() => onChange?.(!enabled)}
      >
        {enabled ? (
          <Eye className="h-3 w-3" />
        ) : (
          <EyeOff className="h-3 w-3 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}