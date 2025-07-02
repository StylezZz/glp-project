/* wrapper para LogisticsMapGrid con soporte para datos de simulación */

import React, { useEffect } from 'react';
import LogisticsMapGridOriginal from './LogisticsMapGrid';

interface Order {
  id: string;
  origin: { x: number; y: number; name: string };
  destination: { x: number; y: number; name: string };
  quantity: number;
  priority: string;
  status: string;
  createdAt: number;
  assignedVehicle: string | null;
  revenue: number;
  timeWindow: { start: number; end: number };
}

interface SimulationDataProps {
  simulationData?: {
    type: string;
    date?: string;
    orders?: Order[];
    originalOrders?: Order[];
    dataSource?: string;
    totalOrders?: number;
  } | null;
}

const LogisticsMapGridWrapper = ({ simulationData }: SimulationDataProps) => {
  useEffect(() => {
    if (simulationData) {
      console.log('🎯 SimulationData received in wrapper:', simulationData);
      
      // Si tenemos datos reales, mostrar información detallada
      if (simulationData.dataSource === 'database' && simulationData.orders) {
        console.log(`📊 Loading ${simulationData.orders.length} real orders from ${simulationData.date}`);
        console.log('📋 Sample order:', simulationData.orders[0]);
        
        // Mostrar resumen de datos
        const orderSummary = {
          totalOrders: simulationData.orders.length,
          dateRange: simulationData.date,
          dataSource: simulationData.dataSource,
          firstOrder: simulationData.orders[0]?.id,
          lastOrder: simulationData.orders[simulationData.orders.length - 1]?.id
        };
        console.log('📈 Order Summary:', orderSummary);
      }
    } else {
      console.log('⚡ No simulation data provided, using default random generation');
    }
  }, [simulationData]);

  // Mostrar información en pantalla si tenemos datos reales
  const hasRealData = simulationData?.dataSource === 'database' && simulationData?.orders;

  return (
    <div className="relative h-full w-full">
      {hasRealData && (
        <div className="absolute top-4 right-4 z-10 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg">
          <div className="text-sm font-medium">
            📊 Datos Reales Cargados
          </div>
          <div className="text-xs">
            {simulationData.orders?.length} pedidos - {simulationData.date}
          </div>
        </div>
      )}
      <LogisticsMapGridOriginal />
    </div>
  );
};

export default LogisticsMapGridWrapper;
