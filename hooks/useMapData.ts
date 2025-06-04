import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  MapState, 
  ApiResponse, 
  MapDataResponse, 
  SimulationStatus,
  Vehicle,
  Order,
  Blockage,
  Breakdown,
  Maintenance
} from '@/types/map';
import { validateMapData } from '@/lib/mapUtils';

interface UseMapDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealTime?: boolean;
  onError?: (error: Error) => void;
  onDataUpdate?: (data: MapState) => void;
}

interface UseMapDataReturn {
  // Data
  mapData: MapState | null;
  simulationStatus: SimulationStatus | null;
  
  // State
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Actions
  refreshData: () => Promise<void>;
  updateVehicle: (vehicleId: string, updates: Partial<Vehicle>) => Promise<void>;
  createOrder: (order: Omit<Order, 'id'>) => Promise<void>;
  updateOrder: (orderId: string, updates: Partial<Order>) => Promise<void>;
  createBlockage: (blockage: Omit<Blockage, 'id'>) => Promise<void>;
  resolveBlockage: (blockageId: string) => Promise<void>;
  reportBreakdown: (breakdown: Omit<Breakdown, 'id'>) => Promise<void>;
  scheduleMaintenace: (maintenance: Omit<Maintenance, 'id'>) => Promise<void>;
  
  // Simulation controls
  startSimulation: () => Promise<void>;
  pauseSimulation: () => Promise<void>;
  stopSimulation: () => Promise<void>;
  setSimulationSpeed: (speed: number) => Promise<void>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export function useMapData(options: UseMapDataOptions = {}): UseMapDataReturn {
  const {
    autoRefresh = true,
    refreshInterval = 5000,
    enableRealTime = false,
    onError,
    onDataUpdate
  } = options;

  // State
  const [mapData, setMapData] = useState<MapState | null>(null);
  const [simulationStatus, setSimulationStatus] = useState<SimulationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Refs
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // API functions
  const apiCall = useCallback(async <T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        signal: abortControllerRef.current.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'API request failed');
      }

      return result.data;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Request was cancelled');
      }
      throw err;
    }
  }, []);

  // Fetch map data
  const fetchMapData = useCallback(async (): Promise<MapState> => {
    const data = await apiCall<MapDataResponse>('/map/data');
    
    const mapState: MapState = {
      vehicles: data.vehicles || [],
      plants: data.plants || [],
      tanks: data.tanks || [],
      clients: data.clients || [],
      refuelStations: data.refuelStations || [],
      routes: data.routes || [],
      blockages: data.blockages || [],
      breakdowns: data.breakdowns || [],
      maintenances: data.maintenances || [],
      orders: data.orders || [],
      lastUpdated: new Date().toISOString(),
    };

    if (!validateMapData(mapState)) {
      throw new Error('Invalid map data received from server');
    }

    return mapState;
  }, [apiCall]);

  // Fetch simulation status
  const fetchSimulationStatus = useCallback(async (): Promise<SimulationStatus> => {
    return await apiCall<SimulationStatus>('/simulation/status');
  }, [apiCall]);

  // Main refresh function
  const refreshData = useCallback(async (): Promise<void> => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      setError(null);

      const [newMapData, newSimulationStatus] = await Promise.all([
        fetchMapData(),
        fetchSimulationStatus(),
      ]);

      setMapData(newMapData);
      setSimulationStatus(newSimulationStatus);
      setLastUpdated(new Date());

      onDataUpdate?.(newMapData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, fetchMapData, fetchSimulationStatus, onDataUpdate, onError]);

  // Vehicle operations
  const updateVehicle = useCallback(async (
    vehicleId: string, 
    updates: Partial<Vehicle>
  ): Promise<void> => {
    await apiCall(`/vehicles/${vehicleId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    await refreshData();
  }, [apiCall, refreshData]);

  // Order operations
  const createOrder = useCallback(async (
    order: Omit<Order, 'id'>
  ): Promise<void> => {
    await apiCall('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
    await refreshData();
  }, [apiCall, refreshData]);

  const updateOrder = useCallback(async (
    orderId: string, 
    updates: Partial<Order>
  ): Promise<void> => {
    await apiCall(`/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    await refreshData();
  }, [apiCall, refreshData]);

  // Blockage operations
  const createBlockage = useCallback(async (
    blockage: Omit<Blockage, 'id'>
  ): Promise<void> => {
    await apiCall('/blockages', {
      method: 'POST',
      body: JSON.stringify(blockage),
    });
    await refreshData();
  }, [apiCall, refreshData]);

  const resolveBlockage = useCallback(async (blockageId: string): Promise<void> => {
    await apiCall(`/blockages/${blockageId}/resolve`, {
      method: 'POST',
    });
    await refreshData();
  }, [apiCall, refreshData]);

  // Breakdown operations
  const reportBreakdown = useCallback(async (
    breakdown: Omit<Breakdown, 'id'>
  ): Promise<void> => {
    await apiCall('/breakdowns', {
      method: 'POST',
      body: JSON.stringify(breakdown),
    });
    await refreshData();
  }, [apiCall, refreshData]);

  // Maintenance operations
  const scheduleMaintenace = useCallback(async (
    maintenance: Omit<Maintenance, 'id'>
  ): Promise<void> => {
    await apiCall('/maintenances', {
      method: 'POST',
      body: JSON.stringify(maintenance),
    });
    await refreshData();
  }, [apiCall, refreshData]);

  // Simulation controls
  const startSimulation = useCallback(async (): Promise<void> => {
    await apiCall('/simulation/start', { method: 'POST' });
    await refreshData();
  }, [apiCall, refreshData]);

  const pauseSimulation = useCallback(async (): Promise<void> => {
    await apiCall('/simulation/pause', { method: 'POST' });
    await refreshData();
  }, [apiCall, refreshData]);

  const stopSimulation = useCallback(async (): Promise<void> => {
    await apiCall('/simulation/stop', { method: 'POST' });
    await refreshData();
  }, [apiCall, refreshData]);

  const setSimulationSpeed = useCallback(async (speed: number): Promise<void> => {
    await apiCall('/simulation/speed', {
      method: 'POST',
      body: JSON.stringify({ speed }),
    });
    await refreshData();
  }, [apiCall, refreshData]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!enableRealTime) return;

    const wsUrl = `${API_BASE_URL.replace(/^http/, 'ws')}/ws/map`;
    websocketRef.current = new WebSocket(wsUrl);

    websocketRef.current.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);
        
        if (update.type === 'map_update' && validateMapData(update.data)) {
          setMapData(update.data);
          setLastUpdated(new Date());
          onDataUpdate?.(update.data);
        } else if (update.type === 'simulation_status') {
          setSimulationStatus(update.data);
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    websocketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Real-time connection failed');
    };

    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, [enableRealTime, onDataUpdate]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || enableRealTime) return;

    refreshIntervalRef.current = setInterval(() => {
      refreshData();
    }, refreshInterval);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, enableRealTime, refreshInterval, refreshData]);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // Data
    mapData,
    simulationStatus,
    
    // State
    isLoading,
    error,
    lastUpdated,
    
    // Actions
    refreshData,
    updateVehicle,
    createOrder,
    updateOrder,
    createBlockage,
    resolveBlockage,
    reportBreakdown,
    scheduleMaintenace,
    
    // Simulation controls
    startSimulation,
    pauseSimulation,
    stopSimulation,
    setSimulationSpeed,
  };
}