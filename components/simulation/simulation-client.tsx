/* components/simulation/simulation-client.tsx */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { SimulationSelection } from './simulation-selection';
import { toast } from 'sonner';
import LogisticsMapGrid from './LogisticsMapGridWrapper';

type SimulationState = 'selection' | 'running' | 'completed' | 'error';

export default function SimulationPageClient() {
  const [simulationState, setSimulationState] = useState<SimulationState>('selection');
  const [simulationData, setSimulationData] = useState<{
    type: string;
    date?: string;
    orders?: any[];
    originalOrders?: any[];
    dataSource?: string;
    totalOrders?: number;
  } | null>(null);

  const handleStartSimulation = async (type: string, data: any) => {
    try {
      console.log('Starting simulation with data:', { type, data });
      
      setSimulationData(data);
      setSimulationState('running');
      
      toast.success(`Simulación ${type} iniciada con ${data.totalOrders || 0} pedidos`);
      
    } catch (error) {
      console.error('Error starting simulation:', error);
      setSimulationState('error');
      toast.error('Error al iniciar la simulación');
    }
  };  const handleResetSimulation = () => {
    setSimulationState('selection');
    setSimulationData(null);
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
  }  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header Compacto */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Simulación en Ejecución</h1>
            {simulationData && (
              <p className="text-sm text-muted-foreground">
                {simulationData.type} - {simulationData.date || 'Sin fecha'} 
                {simulationData.totalOrders && ` - ${simulationData.totalOrders} pedidos`}
              </p>
            )}
          </div>
          <Button variant="outline" onClick={handleResetSimulation}>
            <Settings className="mr-2 h-4 w-4" />
            Nueva Simulación
          </Button>
        </div>
      </div>
      
      <div className="flex-1 flex">
        {/* Mapa Principal - LogisticsMapGrid ocupa todo el espacio disponible */}
        <div className="flex-1">
          <LogisticsMapGrid simulationData={simulationData} />
        </div>
      </div>
    </div>
  );
}