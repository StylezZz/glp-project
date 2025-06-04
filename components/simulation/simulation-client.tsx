/* eslint-disable @typescript-eslint/no-explicit-any */
// components/simulation/simulation-client.tsx

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Settings, 
  BarChart3, 
  Map as MapIcon,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { SimulationSelection } from './simulation-selection';
import { SimulationControls } from './simulation-controls';
import SimulationVisualizer from './simulation-visualizer';
import { SimulationResults } from './simulation-results';
import { toast } from 'sonner';

type SimulationState = 'selection' | 'running' | 'completed' | 'error';

interface SimulationData {
  type: string;
  files: {
    pedidos?: string;
    bloqueos?: string;
    averias?: string;
  };
  config?: {
    startDate?: string;
    duration?: number;
    speed?: number;
  };
}

export default function SimulationPageClient() {
  const [simulationState, setSimulationState] = useState<SimulationState>('selection');
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null);
  const [activeTab, setActiveTab] = useState('map');
  const [simulationResults, setSimulationResults] = useState<any>(null);

  const handleStartSimulation = async (type: string, data: any) => {
    try {
      setSimulationData({ type, files: data });
      setSimulationState('running');
      setActiveTab('map');
      
      toast.success(`Simulación ${getSimulationTypeLabel(type)} iniciada`);
      
      // Mock simulation completion after 30 seconds for demo
      setTimeout(() => {
        setSimulationResults({
          type,
          duration: '00:00:30',
          completedOrders: 157,
          delayedOrders: 23,
          efficiency: 87,
          fuelConsumption: 2500,
          vehiclesUsed: 15,
          totalVehicles: 20,
        });
        setSimulationState('completed');
        toast.success('Simulación completada');
      }, 30000);
      
    } catch (error) {
      console.error('Error starting simulation:', error);
      setSimulationState('error');
      toast.error('Error al iniciar la simulación');
    }
  };

  const handleResetSimulation = () => {
    setSimulationState('selection');
    setSimulationData(null);
    setSimulationResults(null);
    setActiveTab('map');
  };

  const getSimulationTypeLabel = (type: string) => {
    switch (type) {
      case 'daily': return 'Operación Día a Día';
      case 'weekly': return 'Simulación Semanal';
      case 'collapse': return 'Simulación Colapso';
      default: return 'Simulación';
    }
  };

  const getStateColor = (state: SimulationState) => {
    switch (state) {
      case 'selection': return 'bg-blue-100 text-blue-800';
      case 'running': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStateIcon = (state: SimulationState) => {
    switch (state) {
      case 'selection': return <Settings className="h-4 w-4" />;
      case 'running': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getStateLabel = (state: SimulationState) => {
    switch (state) {
      case 'selection': return 'Configuración';
      case 'running': return 'En ejecución';
      case 'completed': return 'Completada';
      case 'error': return 'Error';
      default: return 'Desconocido';
    }
  };

  if (simulationState === 'selection') {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Simulación de Logística GLP</h1>
          <p className="text-muted-foreground mt-2">
            Configure y ejecute simulaciones para optimizar las operaciones de distribución
          </p>
        </div>
        
        <SimulationSelection onStartSimulation={handleStartSimulation} />
      </div>
    );
  }

  if (simulationState === 'error') {
    return (
      <div className="container mx-auto p-4">
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Ha ocurrido un error durante la simulación. Por favor, intente nuevamente.
          </AlertDescription>
        </Alert>
        
        <Button onClick={handleResetSimulation}>
          Volver a configuración
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {simulationData ? getSimulationTypeLabel(simulationData.type) : 'Simulación'}
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor en tiempo real del progreso de la simulación
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge className={getStateColor(simulationState)}>
              {getStateIcon(simulationState)}
              <span className="ml-1">{getStateLabel(simulationState)}</span>
            </Badge>
            
            <Button 
              variant="outline" 
              onClick={handleResetSimulation}
              disabled={simulationState === 'running'}
            >
              Nueva Simulación
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Quick Stats */}
        {simulationState === 'running' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tiempo transcurrido</p>
                    <p className="text-2xl font-bold">00:15:32</p>
                  </div>
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pedidos procesados</p>
                    <p className="text-2xl font-bold">89</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Vehículos activos</p>
                    <p className="text-2xl font-bold">12/15</p>
                  </div>
                  <Play className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Eficiencia</p>
                    <p className="text-2xl font-bold">94%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="map" className="flex items-center space-x-2">
              <MapIcon className="h-4 w-4" />
              <span>Mapa en Tiempo Real</span>
            </TabsTrigger>
            <TabsTrigger value="controls" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Controles</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Resultados</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="mt-6">
            <SimulationVisualizer />
          </TabsContent>

          <TabsContent value="controls" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <SimulationControls simulationData={simulationData} />
              </div>
              
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuración de Simulación</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Archivos cargados</h4>
                        <div className="space-y-2">
                          {simulationData?.files.pedidos && (
                            <div className="flex items-center justify-between p-2 bg-muted rounded">
                              <span className="text-sm">📄 {simulationData.files.pedidos}</span>
                              <Badge variant="outline">Pedidos</Badge>
                            </div>
                          )}
                          {simulationData?.files.bloqueos && (
                            <div className="flex items-center justify-between p-2 bg-muted rounded">
                              <span className="text-sm">📄 {simulationData.files.bloqueos}</span>
                              <Badge variant="outline">Bloqueos</Badge>
                            </div>
                          )}
                          {simulationData?.files.averias && (
                            <div className="flex items-center justify-between p-2 bg-muted rounded">
                              <span className="text-sm">📄 {simulationData.files.averias}</span>
                              <Badge variant="outline">Averías</Badge>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Parámetros</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Tipo:</span>
                            <span className="ml-2 font-medium">
                              {simulationData ? getSimulationTypeLabel(simulationData.type) : 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Velocidad:</span>
                            <span className="ml-2 font-medium">1x</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results" className="mt-6">
            {simulationState === 'completed' && simulationResults ? (
              <SimulationResults results={simulationResults} />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Resultados no disponibles</h3>
                  <p className="text-muted-foreground">
                    {simulationState === 'running' 
                      ? 'Los resultados se mostrarán cuando la simulación termine.'
                      : 'Ejecute una simulación para ver los resultados.'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}