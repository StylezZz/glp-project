/* eslint-disable @typescript-eslint/no-explicit-any */
// components/map/EntityTooltip.tsx

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  X, 
  Truck, 
  Factory, 
  Fuel, 
  Users, 
  MapPin,
  Clock,
  AlertTriangle,
  Wrench,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { 
  Vehicle, 
  Plant, 
  Tank, 
  Client, 
  RefuelStation, 
  Blockage, 
  Breakdown,
  Maintenance 
} from '@/types/map';

interface EntityTooltipProps {
  entity: any;
  position: { x: number; y: number };
  onClose: () => void;
}

export function EntityTooltip({ entity, position, onClose }: EntityTooltipProps) {
  const [tooltipPosition, setTooltipPosition] = React.useState(position);

  React.useEffect(() => {
    // Adjust tooltip position to keep it within viewport
    const tooltip = document.getElementById('entity-tooltip');
    if (!tooltip) return;

    const rect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let { x, y } = position;

    // Adjust horizontal position
    if (x + rect.width > viewportWidth - 20) {
      x = viewportWidth - rect.width - 20;
    }
    if (x < 20) {
      x = 20;
    }

    // Adjust vertical position
    if (y + rect.height > viewportHeight - 20) {
      y = position.y - rect.height - 20;
    }
    if (y < 20) {
      y = 20;
    }

    setTooltipPosition({ x, y });
  }, [position]);

  const renderContent = () => {
    // Determine entity type and render appropriate content
    if ('fuelLevel' in entity) {
      return <VehicleTooltip vehicle={entity as Vehicle} />;
    }
    if ('productionRate' in entity) {
      return <PlantTooltip plant={entity as Plant} />;
    }
    if ('capacity' in entity && 'currentLevel' in entity) {
      return <TankTooltip tank={entity as Tank} />;
    }
    if ('demand' in entity) {
      return <ClientTooltip client={entity as Client} />;
    }
    if ('fuelCapacity' in entity) {
      return <RefuelStationTooltip station={entity as RefuelStation} />;
    }
    if ('severity' in entity && 'from' in entity) {
      return <BlockageTooltip blockage={entity as Blockage} />;
    }
    if ('vehicleId' in entity && 'type' in entity) {
      return <BreakdownTooltip breakdown={entity as Breakdown} />;
    }
    if ('vehicleId' in entity && 'scheduledDate' in entity) {
      return <MaintenanceTooltip maintenance={entity as Maintenance} />;
    }

    return <GenericTooltip entity={entity} />;
  };

  return (
    <Card 
      id="entity-tooltip"
      className="absolute z-50 w-80 max-w-sm shadow-lg border"
      style={{
        left: tooltipPosition.x,
        top: tooltipPosition.y,
      }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center space-x-2">
            {getEntityIcon(entity)}
            <span>{entity.name || entity.id}</span>
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={onClose}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {renderContent()}
      </CardContent>
    </Card>
  );
}

function VehicleTooltip({ vehicle }: { vehicle: Vehicle }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivering': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      case 'broken': return 'bg-red-100 text-red-800';
      case 'refueling': return 'bg-yellow-100 text-yellow-800';
      case 'idle': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Badge className={getStatusColor(vehicle.status)}>
          {vehicle.status.replace('_', ' ').toUpperCase()}
        </Badge>
        <span className="text-sm text-muted-foreground">{vehicle.type}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-muted-foreground">GLP Capacity:</span>
          <div className="font-medium">{vehicle.glpCapacity} m³</div>
        </div>
        <div>
          <span className="text-muted-foreground">Current Load:</span>
          <div className="font-medium">{vehicle.currentLoad} m³</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-muted-foreground">Gross Weight:</span>
          <div className="font-medium">{vehicle.grossWeight} Ton</div>
        </div>
        <div>
          <span className="text-muted-foreground">GLP Weight:</span>
          <div className="font-medium">{vehicle.glpWeight} Ton</div>
        </div>
      </div>

      <div>
        <span className="text-muted-foreground">Combined Weight:</span>
        <div className="font-medium">{vehicle.combinedWeight} Ton</div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">Fuel Level:</span>
          <span className="font-medium">{vehicle.fuelLevel}%</span>
        </div>
        <Progress 
          value={vehicle.fuelLevel} 
          className={`h-2 ${vehicle.fuelLevel < 30 ? 'bg-red-100' : 'bg-green-100'}`}
        />
      </div>

      {vehicle.driver && (
        <div>
          <span className="text-muted-foreground text-sm">Driver:</span>
          <div className="font-medium">{vehicle.driver}</div>
        </div>
      )}

      {vehicle.route && (
        <div>
          <span className="text-muted-foreground text-sm">Route:</span>
          <div className="font-medium">
            {vehicle.route.type} - {vehicle.route.distance}km
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        Position: ({vehicle.position.x}, {vehicle.position.y})
      </div>
    </div>
  );
}

function PlantTooltip({ plant }: { plant: Plant }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-3">
      <Badge className={getStatusColor(plant.status)}>
        {plant.status.toUpperCase()}
      </Badge>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-muted-foreground">Capacity:</span>
          <div className="font-medium">{plant.capacity} m³</div>
        </div>
        <div>
          <span className="text-muted-foreground">Current Level:</span>
          <div className="font-medium">{plant.currentLevel} m³</div>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">Storage Level:</span>
          <span className="font-medium">{Math.round((plant.currentLevel / plant.capacity) * 100)}%</span>
        </div>
        <Progress 
          value={(plant.currentLevel / plant.capacity) * 100} 
          className="h-2"
        />
      </div>

      <div>
        <span className="text-muted-foreground text-sm">Production Rate:</span>
        <div className="font-medium flex items-center space-x-1">
          <TrendingUp className="h-3 w-3" />
          <span>{plant.productionRate} m³/hour</span>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        Position: ({plant.position.x}, {plant.position.y})
      </div>
    </div>
  );
}

function TankTooltip({ tank }: { tank: Tank }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const levelPercentage = (tank.currentLevel / tank.capacity) * 100;

  return (
    <div className="space-y-3">
      <Badge className={getStatusColor(tank.status)}>
        {tank.status.toUpperCase()}
      </Badge>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-muted-foreground">Capacity:</span>
          <div className="font-medium">{tank.capacity} m³</div>
        </div>
        <div>
          <span className="text-muted-foreground">Current Level:</span>
          <div className="font-medium">{tank.currentLevel} m³</div>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">Fill Level:</span>
          <span className="font-medium">{Math.round(levelPercentage)}%</span>
        </div>
        <Progress 
          value={levelPercentage} 
          className={`h-2 ${levelPercentage < 20 ? 'bg-red-100' : 'bg-blue-100'}`}
        />
      </div>

      <div>
        <span className="text-muted-foreground text-sm">Refill Rate:</span>
        <div className="font-medium">{tank.refillRate} m³/hour</div>
      </div>

      {tank.lastRefill && (
        <div>
          <span className="text-muted-foreground text-sm">Last Refill:</span>
          <div className="font-medium flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{new Date(tank.lastRefill).toLocaleDateString()}</span>
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        Position: ({tank.position.x}, {tank.position.y})
      </div>
    </div>
  );
}

function ClientTooltip({ client }: { client: Client }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'served': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <Badge className={getStatusColor(client.status)}>
          {client.status.toUpperCase()}
        </Badge>
        <Badge className={getPriorityColor(client.priority)}>
          {client.priority.toUpperCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-muted-foreground">Demand:</span>
          <div className="font-medium">{client.demand} m³</div>
        </div>
        <div>
          <span className="text-muted-foreground">Type:</span>
          <div className="font-medium">{client.contractType}</div>
        </div>
      </div>

      {client.lastDelivery && (
        <div>
          <span className="text-muted-foreground text-sm">Last Delivery:</span>
          <div className="font-medium flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(client.lastDelivery).toLocaleDateString()}</span>
          </div>
        </div>
      )}

      {client.nextDelivery && (
        <div>
          <span className="text-muted-foreground text-sm">Next Delivery:</span>
          <div className="font-medium flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(client.nextDelivery).toLocaleDateString()}</span>
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        Position: ({client.position.x}, {client.position.y})
      </div>
    </div>
  );
}

function RefuelStationTooltip({ station }: { station: RefuelStation }) {
  return (
    <div className="space-y-3">
      <Badge className={station.status === 'operational' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
        {station.status.toUpperCase()}
      </Badge>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-muted-foreground">Fuel Capacity:</span>
          <div className="font-medium">{station.fuelCapacity} L</div>
        </div>
        <div>
          <span className="text-muted-foreground">Current Level:</span>
          <div className="font-medium">{station.currentFuelLevel} L</div>
        </div>
      </div>

      <div>
        <span className="text-muted-foreground text-sm">Service Time:</span>
        <div className="font-medium">{station.serviceTime} minutes</div>
      </div>

      <div className="text-xs text-muted-foreground">
        Position: ({station.position.x}, {station.position.y})
      </div>
    </div>
  );
}

function BlockageTooltip({ blockage }: { blockage: Blockage }) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-3">
      <Badge className={getSeverityColor(blockage.severity)}>
        {blockage.severity.toUpperCase()} SEVERITY
      </Badge>

      <div>
        <span className="text-muted-foreground text-sm">Reason:</span>
        <div className="font-medium">{blockage.reason}</div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-muted-foreground">Duration:</span>
          <div className="font-medium">{blockage.estimatedDuration} min</div>
        </div>
        <div>
          <span className="text-muted-foreground">Started:</span>
          <div className="font-medium">{blockage.startTime}</div>
        </div>
      </div>

      <div>
        <span className="text-muted-foreground text-sm">Affected Routes:</span>
        <div className="font-medium">{blockage.affectedRoutes.length} routes</div>
      </div>

      <div className="text-xs text-muted-foreground">
        From: ({blockage.from.x}, {blockage.from.y}) To: ({blockage.to.x}, {blockage.to.y})
      </div>
    </div>
  );
}

function BreakdownTooltip({ breakdown }: { breakdown: Breakdown }) {
  return (
    <div className="space-y-3">
      <Badge className="bg-red-100 text-red-800">
        {breakdown.severity.toUpperCase()} BREAKDOWN
      </Badge>

      <div>
        <span className="text-muted-foreground text-sm">Vehicle:</span>
        <div className="font-medium">{breakdown.vehicleId}</div>
      </div>

      <div>
        <span className="text-muted-foreground text-sm">Type:</span>
        <div className="font-medium">{breakdown.type}</div>
      </div>

      <div>
        <span className="text-muted-foreground text-sm">Description:</span>
        <div className="font-medium">{breakdown.description}</div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-muted-foreground">Repair Time:</span>
          <div className="font-medium">{breakdown.estimatedRepairTime} min</div>
        </div>
        <div>
          <span className="text-muted-foreground">Status:</span>
          <div className="font-medium">{breakdown.status}</div>
        </div>
      </div>
    </div>
  );
}

function MaintenanceTooltip({ maintenance }: { maintenance: Maintenance }) {
  return (
    <div className="space-y-3">
      <Badge className="bg-blue-100 text-blue-800">
        {maintenance.type.toUpperCase()} MAINTENANCE
      </Badge>

      <div>
        <span className="text-muted-foreground text-sm">Vehicle:</span>
        <div className="font-medium">{maintenance.vehicleId}</div>
      </div>

      <div>
        <span className="text-muted-foreground text-sm">Description:</span>
        <div className="font-medium">{maintenance.description}</div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-muted-foreground">Scheduled:</span>
          <div className="font-medium">{new Date(maintenance.scheduledDate).toLocaleDateString()}</div>
        </div>
        <div>
          <span className="text-muted-foreground">Duration:</span>
          <div className="font-medium">{maintenance.estimatedDuration}h</div>
        </div>
      </div>

      {maintenance.technicianAssigned && (
        <div>
          <span className="text-muted-foreground text-sm">Technician:</span>
          <div className="font-medium">{maintenance.technicianAssigned}</div>
        </div>
      )}
    </div>
  );
}

function GenericTooltip({ entity }: { entity: any }) {
  return (
    <div className="space-y-2">
      <div className="text-sm">
        <span className="text-muted-foreground">ID:</span>
        <span className="font-medium ml-1">{entity.id}</span>
      </div>
      
      {entity.status && (
        <div className="text-sm">
          <span className="text-muted-foreground">Status:</span>
          <span className="font-medium ml-1">{entity.status}</span>
        </div>
      )}
      
      {entity.position && (
        <div className="text-xs text-muted-foreground">
          Position: ({entity.position.x}, {entity.position.y})
        </div>
      )}
    </div>
  );
}

function getEntityIcon(entity: any) {
  if ('fuelLevel' in entity) return <Truck className="h-4 w-4" />;
  if ('productionRate' in entity) return <Factory className="h-4 w-4" />;
  if ('capacity' in entity && 'currentLevel' in entity) return <Fuel className="h-4 w-4" />;
  if ('demand' in entity) return <Users className="h-4 w-4" />;
  if ('fuelCapacity' in entity) return <Fuel className="h-4 w-4" />;
  if ('severity' in entity && 'from' in entity) return <AlertTriangle className="h-4 w-4" />;
  if ('vehicleId' in entity && 'type' in entity) return <AlertTriangle className="h-4 w-4" />;
  if ('vehicleId' in entity && 'scheduledDate' in entity) return <Wrench className="h-4 w-4" />;
  return <MapPin className="h-4 w-4" />;
}