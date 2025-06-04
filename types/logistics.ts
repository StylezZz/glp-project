export type TruckState = 'operational' | 'maintenance' | 'broken';

export interface Truck{
    id: number;
    x: number;
    y: number;
    state: TruckState;
    direction: number; // 0: up, 1: right, 2: down, 3: left
    speed: number; // Speed in units per second
    lastMoved: number; // Timestamp of the last movement
    path: { x: number; y: number }[]; // Path coordinates
}

export interface GridCell{
    x: number;
    y: number;
    blocked: boolean; // Indicates if the cell is occupied by a truck
    occupied: boolean; // ID of the truck occupying this cell, if any
}

export interface LogisticsGrid{
    trucks: Truck[];
    blockedCells: GridCell[];
    isRunning: boolean; // Indicates if the simulation is running
}