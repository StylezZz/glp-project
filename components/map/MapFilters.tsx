/* eslint-disable @typescript-eslint/no-explicit-any */
// components/map/MapFilters.tsx

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  Filter, 
  RotateCcw, 
  Truck, 
  Factory, 
  Fuel, 
  Users, 
  MapPin,
  AlertTriangle,
  Wrench,
  Settings2
} from 'lucide-react';
import { MapFilters as MapFiltersType, Vehicle, MapState } from '@/types/map';

interface MapFiltersProps {
  filters: MapFiltersType;
  data: MapState;
  onFiltersChange: (filters: MapFiltersType) => void;
  className?: string;
}

export function MapFilters({ filters, data, onFiltersChange, className }: MapFiltersProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const updateFilter = <K extends keyof MapFiltersType>(
    key: K, 
    value: MapFiltersType[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFiltersChange({
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
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (!filters.showVehicles) count++;
    if (!filters.showPlants) count++;
    if (!filters.showTanks) count++;
    if (!filters.showClients) count++;
    if (!filters.showRefuelStations) count++;
    if (!filters.showRoutes) count++;
    if (!filters.showBlockages) count++;
    if (!filters.showBreakdowns) count++;
    if (!filters.showMaintenances) count++;
    if (filters.vehicleTypes.length < 3) count++;
    if (filters.vehicleStatuses.length < 6) count++;
    if (filters.routeTypes.length < 4) count++;
    if (filters.blockageSeverities.length < 4) count++;
    return count;
  };

  const toggleVehicleType = (type: Vehicle['type']) => {
    const newTypes = filters.vehicleTypes.includes(type)
      ? filters.vehicleTypes.filter(t => t !== type)
      : [...filters.vehicleTypes, type];
    updateFilter('vehicleTypes', newTypes);
  };

  const toggleVehicleStatus = (status: Vehicle['status']) => {
    const newStatuses = filters.vehicleStatuses.includes(status)
      ? filters.vehicleStatuses.filter(s => s !== status)
      : [...filters.vehicleStatuses, status];
    updateFilter('vehicleStatuses', newStatuses);
  };

  const toggleRouteType = (type: any) => {
    const newTypes = filters.routeTypes.includes(type)
      ? filters.routeTypes.filter(t => t !== type)
      : [...filters.routeTypes, type];
    updateFilter('routeTypes', newTypes);
  };

  const toggleBlockageSeverity = (severity: any) => {
    const newSeverities = filters.blockageSeverities.includes(severity)
      ? filters.blockageSeverities.filter(s => s !== severity)
      : [...filters.blockageSeverities, severity];
    updateFilter('blockageSeverities', newSeverities);
  };

  const getEntityCounts = () => {
    return {
      vehicles: data.vehicles?.length || 0,
      plants: data.plants?.length || 0,
      tanks: data.tanks?.length || 0,
      clients: data.clients?.length || 0,
      refuelStations: data.refuelStations?.length || 0,
      routes: data.routes?.length || 0,
      blockages: data.blockages?.length || 0,
      breakdowns: data.breakdowns?.length || 0,
      maintenances: data.maintenances?.length || 0,
    };
  };

  const counts = getEntityCounts();
  const activeFilters = getActiveFilterCount();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`relative ${className}`}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilters > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs"
            >
              {activeFilters}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Map Filters</span>
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </SheetTitle>
          <SheetDescription>
            Customize which elements are visible on the map
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Main Layers */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <Settings2 className="h-4 w-4 mr-2" />
                Main Layers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FilterToggle
                id="vehicles"
                icon={<Truck className="h-4 w-4" />}
                label="Vehicles"
                count={counts.vehicles}
                checked={filters.showVehicles}
                onCheckedChange={(checked) => updateFilter('showVehicles', checked)}
              />
              
              <FilterToggle
                id="plants"
                icon={<Factory className="h-4 w-4" />}
                label="Plants"
                count={counts.plants}
                checked={filters.showPlants}
                onCheckedChange={(checked) => updateFilter('showPlants', checked)}
              />
              
              <FilterToggle
                id="tanks"
                icon={<Fuel className="h-4 w-4" />}
                label="Tanks"
                count={counts.tanks}
                checked={filters.showTanks}
                onCheckedChange={(checked) => updateFilter('showTanks', checked)}
              />
              
              <FilterToggle
                id="clients"
                icon={<Users className="h-4 w-4" />}
                label="Clients"
                count={counts.clients}
                checked={filters.showClients}
                onCheckedChange={(checked) => updateFilter('showClients', checked)}
              />
              
              <FilterToggle
                id="refuel-stations"
                icon={<Fuel className="h-4 w-4" />}
                label="Refuel Stations"
                count={counts.refuelStations}
                checked={filters.showRefuelStations}
                onCheckedChange={(checked) => updateFilter('showRefuelStations', checked)}
              />
              
              <FilterToggle
                id="routes"
                icon={<MapPin className="h-4 w-4" />}
                label="Routes"
                count={counts.routes}
                checked={filters.showRoutes}
                onCheckedChange={(checked) => updateFilter('showRoutes', checked)}
              />
            </CardContent>
          </Card>

          {/* Status Layers */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Status Indicators
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FilterToggle
                id="blockages"
                icon={<AlertTriangle className="h-4 w-4" />}
                label="Blockages"
                count={counts.blockages}
                checked={filters.showBlockages}
                onCheckedChange={(checked) => updateFilter('showBlockages', checked)}
              />
              
              <FilterToggle
                id="breakdowns"
                icon={<AlertTriangle className="h-4 w-4" />}
                label="Breakdowns"
                count={counts.breakdowns}
                checked={filters.showBreakdowns}
                onCheckedChange={(checked) => updateFilter('showBreakdowns', checked)}
              />
              
              <FilterToggle
                id="maintenances"
                icon={<Wrench className="h-4 w-4" />}
                label="Maintenances"
                count={counts.maintenances}
                checked={filters.showMaintenances}
                onCheckedChange={(checked) => updateFilter('showMaintenances', checked)}
              />
            </CardContent>
          </Card>

          {/* Vehicle Filters */}
          {filters.showVehicles && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Vehicle Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Vehicle Types</Label>
                  <div className="flex flex-wrap gap-2">
                    {(['TA', 'TB', 'TC', 'TD'] as const).map(type => (
                      <Badge
                        key={type}
                        variant={filters.vehicleTypes.includes(type) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleVehicleType(type)}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium mb-2 block">Vehicle Status</Label>
                  <div className="flex flex-wrap gap-2">
                    {(['idle', 'delivering', 'returning', 'maintenance', 'refueling', 'broken'] as const).map(status => (
                      <Badge
                        key={status}
                        variant={filters.vehicleStatuses.includes(status) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleVehicleStatus(status)}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Route Filters */}
          {filters.showRoutes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Route Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Route Types</Label>
                  <div className="flex flex-wrap gap-2">
                    {(['supply', 'delivery', 'return', 'maintenance'] as const).map(type => (
                      <Badge
                        key={type}
                        variant={filters.routeTypes.includes(type) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleRouteType(type)}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Blockage Filters */}
          {filters.showBlockages && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Blockage Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Severity Levels</Label>
                  <div className="flex flex-wrap gap-2">
                    {(['low', 'medium', 'high', 'critical'] as const).map(severity => (
                      <Badge
                        key={severity}
                        variant={filters.blockageSeverities.includes(severity) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleBlockageSeverity(severity)}
                      >
                        {severity.charAt(0).toUpperCase() + severity.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Presets */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Presets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onFiltersChange({
                  ...filters,
                  showVehicles: true,
                  showRoutes: true,
                  showBlockages: true,
                  showBreakdowns: true,
                  showPlants: false,
                  showTanks: false,
                  showClients: false,
                  showRefuelStations: false,
                  showMaintenances: false,
                })}
              >
                Operations View
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onFiltersChange({
                  ...filters,
                  showVehicles: false,
                  showRoutes: false,
                  showBlockages: false,
                  showBreakdowns: false,
                  showPlants: true,
                  showTanks: true,
                  showClients: true,
                  showRefuelStations: true,
                  showMaintenances: false,
                })}
              >
                Infrastructure View
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onFiltersChange({
                  ...filters,
                  showVehicles: true,
                  showRoutes: false,
                  showBlockages: true,
                  showBreakdowns: true,
                  showPlants: false,
                  showTanks: false,
                  showClients: false,
                  showRefuelStations: false,
                  showMaintenances: true,
                })}
              >
                Issues View
              </Button>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface FilterToggleProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  count: number;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function FilterToggle({ 
  id, 
  icon, 
  label, 
  count, 
  checked, 
  onCheckedChange 
}: FilterToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Switch
          id={id}
          checked={checked}
          onCheckedChange={onCheckedChange}
        />
        <Label 
          htmlFor={id} 
          className="flex items-center space-x-2 cursor-pointer"
        >
          {icon}
          <span>{label}</span>
        </Label>
      </div>
      <Badge variant="outline" className="text-xs">
        {count}
      </Badge>
    </div>
  );
}