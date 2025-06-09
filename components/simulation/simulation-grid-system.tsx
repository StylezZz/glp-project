"use client"

import { memo, useState } from "react"
import type { Truck } from "@/types/logistics"
import { TruckIcon } from "../trucks/trucks-icon"
import { Target as TargetIcon } from "lucide-react"

interface Depot {
  x: number;
  y: number;
  type: 'refueling' | 'maintenance';
}

interface GridSystemProps {
  trucks: Truck[]
  blockedCells: Set<string>
  onCellClick: (x: number, y: number) => void
  onTruckSelect?: (truckId: number) => void
  onSetDestination?: (x: number, y: number) => void
  selectedTruckId?: number
  depots?: Depot[]
  isSimulation?: boolean // Added to indicate simulation mode
}

export const SimulationGridSystem = memo(function SimulationGridSystem({ 
  trucks, 
  blockedCells, 
  onCellClick, 
  onTruckSelect, 
  onSetDestination,
  selectedTruckId,
  depots = [
    // Default refueling stations
    { x: 10, y: 5, type: 'refueling' },
    { x: 40, y: 25, type: 'refueling' },
    // Default maintenance depots
    { x: 5, y: 20, type: 'maintenance' },
    { x: 35, y: 5, type: 'maintenance' }
  ],
  isSimulation = true
}: GridSystemProps) {
  const gridWidth = 50
  const gridHeight = 30
  const cellSize = 16
  const [placingMode, setPlacingMode] = useState<'block' | 'destination' | null>('block')
  const [zoom, setZoom] = useState(1)

  // Create a map for quick truck lookup
  const truckMap = new Map<string, Truck>()
  trucks.forEach((truck) => {
    truckMap.set(`${truck.x}-${truck.y}`, truck)
  })

  const handleCellClick = (x: number, y: number) => {
    if (placingMode === 'destination' && selectedTruckId && onSetDestination) {
      onSetDestination(x, y)
      setPlacingMode('block')
    } else {
      onCellClick(x, y)
    }
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5))

  const selectedTruck = trucks.find(t => t.id === selectedTruckId)

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 overflow-hidden">
      <div className="flex space-x-2 mb-3">
        {selectedTruckId && (
          <button
            onClick={() => setPlacingMode('destination')}
            className={`px-3 py-1 text-xs rounded-md flex items-center ${
              placingMode === 'destination' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
            }`}
          >
            <TargetIcon size={12} className="mr-1" /> Establecer Destino
          </button>
        )}
      </div>

      <div className="relative border-2 border-slate-200 rounded-lg overflow-hidden" style={{ height: '65vh' }}>
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
          <button 
            className="p-2 bg-white rounded-full shadow text-slate-700" 
            onClick={handleZoomIn}
          >
            +
          </button>
          <button 
            className="p-2 bg-white rounded-full shadow text-slate-700" 
            onClick={handleZoomOut}
          >
            -
          </button>
        </div>

        <div 
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: '0 0',
            width: gridWidth * cellSize,
            height: gridHeight * cellSize,
            overflow: 'auto'
          }}
        >
          <svg
            width={gridWidth * cellSize}
            height={gridHeight * cellSize}
            className="block"
          >
            {/* Grid lines */}
            <defs>
              <pattern id="simulation-grid" width={cellSize} height={cellSize} patternUnits="userSpaceOnUse">
                <path d={`M ${cellSize} 0 L 0 0 0 ${cellSize}`} fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
              </pattern>
            </defs>

            <rect width="100%" height="100%" fill="url(#simulation-grid)" />

            {/* Path visualization for all trucks */}
            {trucks.map((truck) => (
              truck.path && truck.path.length > 0 ? (
                <g key={`path-${truck.id}`}>
                  {truck.path.map((point, i) => (
                    <circle
                      key={`path-point-${truck.id}-${i}`}
                      cx={(point.x * cellSize) + (cellSize / 2)}
                      cy={(point.y * cellSize) + (cellSize / 2)}
                      r={2}
                      fill={truck.id === selectedTruckId ? "#3b82f6" : "#9ca3af"}
                      opacity={0.5}
                    />
                  ))}
                  
                  {/* Line connecting path points */}
                  <path
                    d={`M${(truck.x * cellSize) + (cellSize / 2)},${(truck.y * cellSize) + (cellSize / 2)} ${truck.path.map(p => `L${(p.x * cellSize) + (cellSize / 2)},${(p.y * cellSize) + (cellSize / 2)}`).join(' ')}`}
                    stroke={truck.id === selectedTruckId ? "#3b82f6" : "#9ca3af"}
                    strokeWidth={1.5}
                    strokeDasharray="2,2"
                    fill="none"
                    opacity={0.6}
                  />
                </g>
              ) : null
            ))}

            {/* Refueling and maintenance depots */}
            {depots.map((depot, index) => (
              <g 
                key={`depot-${depot.type}-${index}`} 
                transform={`translate(${depot.x * cellSize}, ${depot.y * cellSize})`}
              >
                <rect 
                  width={cellSize * 3} 
                  height={cellSize * 3} 
                  fill={depot.type === 'refueling' ? "#3b82f6" : "#8b5cf6"} 
                  fillOpacity={0.2}
                  stroke={depot.type === 'refueling' ? "#2563eb" : "#7c3aed"}
                  strokeWidth={1.5}
                  rx={4}
                />
                {depot.type === 'refueling' ? (
                  <g transform={`translate(${cellSize * 1.5}, ${cellSize * 1.5}) scale(0.04)`}>
                    <path 
                      d="M32 64C32 28.7 60.7 0 96 0h32c35.3 0 64 28.7 64 64v370.3l-60.6 133.3c-4.8 10.6-15.5 17.4-27.2 17.4H351.5c-13.2 0-25-8.8-28.6-21.6l-28.3-99C287 431 256.8 416 224 416s-63 15-70.7 48.4l-28.3 99c-3.7 12.8-15.4 21.6-28.6 21.6H83.8c-11.7 0-22.3-6.9-27.2-17.4L-32 434.3V160c0-17.7 14.3-32 32-32s32 14.3 32 32v82.7c0 17 6.7 33.3 18.7 45.3l51.1 51.1c8.3 8.3 21.3 9.6 31 3.1c12.9-8.6 14.7-26.9 3.7-37.8l-15.2-15.2-32-32c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l32 32 15.2 15.2c37 37 43.9 94.1 16.8 138.8c-14.2 23.5-36.9 41.3-63.5 49.8l4.2 14.7c3.4 12 14.4 20.3 27 20.3c13.7 0 25.5-9.7 28.1-23.2L126.4 368H224h97.6L337.9 454c2.5 13.4 14.3 23.2 28.1 23.2c12.5 0 23.6-8.3 27-20.3l4.2-14.7c-26.6-8.6-49.3-26.3-63.5-49.8c-27.1-44.7-20.2-101.8 16.8-138.8l15.2-15.2 32-32c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3l-32 32-15.2 15.2c-11 11-9.2 29.2 3.7 37.8c9.7 6.4 22.6 5.1 31-3.1l51.1-51.1c12-12 18.7-28.3 18.7-45.3V64zm128-8c13.3 0 24 10.7 24 24v48c0 13.3-10.7 24-24 24s-24-10.7-24-24V80c0-13.3 10.7-24 24-24zm-64 64c13.3 0 24 10.7 24 24v48c0 13.3-10.7 24-24 24s-24-10.7-24-24V144c0-13.3 10.7-24 24-24zm128 0c13.3 0 24 10.7 24 24v48c0 13.3-10.7 24-24 24s-24-10.7-24-24V144c0-13.3 10.7-24 24-24z" 
                      fill="#2563eb"
                    />
                  </g>
                ) : (
                  <g transform={`translate(${cellSize * 1.5}, ${cellSize * 1.5}) scale(0.04)`}>
                    <path 
                      d="M352 320c88.4 0 160-71.6 160-160c0-15.3-2.2-30.1-6.2-44.2c-3.1-10.8-16.4-13.2-24.3-5.3l-76.8 76.8c-3 3-7.1 4.7-11.3 4.7H336c-8.8 0-16-7.2-16-16V118.6c0-4.2 1.7-8.3 4.7-11.3l76.8-76.8c7.9-7.9 5.4-21.2-5.3-24.3C382.1 2.2 367.3 0 352 0C263.6 0 192 71.6 192 160s71.6 160 160 160zm96-136.1c0 13.8 11.2 25 25 25c9.3 0 17.9-5.2 22.3-13.5c3.6-6.8 5.7-14.6 5.7-22.9s-2.1-16-5.7-22.9c-4.3-8.3-12.9-13.5-22.3-13.5c-13.8 0-25 11.2-25 25v22.8zm0 82.1v16c0 21.2 11.2 40.5 29.5 50.9l89.3 51.1C579.7 395.2 592 416.8 592 440.6V488c0 13.3 10.7 24 24 24s24-10.7 24-24V440.6c0-42.4-22.5-81.4-59.1-102.1l-89.3-51.1c-4.1-2.4-6.6-6.7-6.6-11.4v-16c0-13.3-10.7-24-24-24s-24 10.7-24 24zM0 144v16c0 13.3 10.7 24 24 24s24-10.7 24-24V144c0-35.3 28.7-64 64-64h16c13.3 0 24-10.7 24-24s-10.7-24-24-24H112C50.1 32 0 82.1 0 144zM0 368v16c0 61.9 50.1 112 112 112h16c13.3 0 24-10.7 24-24s-10.7-24-24-24H112c-35.3 0-64-28.7-64-64V368c0-13.3-10.7-24-24-24s-24 10.7-24 24zm256 0v16c0 13.3 10.7 24 24 24s24-10.7 24-24V368c0-35.3 28.7-64 64-64h16c13.3 0 24-10.7 24-24s-10.7-24-24-24H368c-61.9 0-112 50.1-112 112zm240-176c-13.3 0-24 10.7-24 24v16c0 13.3 10.7 24 24 24s24-10.7 24-24V216c0-13.3-10.7-24-24-24z" 
                      fill="#7c3aed"
                    />
                  </g>
                )}
                <text
                  x={cellSize * 1.5}
                  y={cellSize * 0.7}
                  fontSize={10}
                  textAnchor="middle"
                  fill={depot.type === 'refueling' ? "#2563eb" : "#7c3aed"}
                  fontWeight="bold"
                >
                  {depot.type === 'refueling' ? 'Combustible' : 'Mantenimiento'}
                </text>
              </g>
            ))}

            {/* Blocked cells */}
            {Array.from(blockedCells).map((cellKey) => {
              const [x, y] = cellKey.split("-").map(Number)
              return (
                <rect
                  key={cellKey}
                  x={x * cellSize}
                  y={y * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill="#ef4444"
                  fillOpacity={0.7}
                  stroke="#dc2626"
                  strokeWidth={1}
                  className="cursor-pointer hover:fill-opacity-90 transition-all"
                  onClick={() => handleCellClick(x, y)}
                />
              )
            })}

            {/* Clickable cells for adding blocks or setting destinations */}
            {Array.from({ length: gridWidth * gridHeight }, (_, i) => {
              const x = i % gridWidth
              const y = Math.floor(i / gridWidth)
              const cellKey = `${x}-${y}`

              if (blockedCells.has(cellKey)) {
                return null
              }

              return (
                <rect
                  key={cellKey}
                  x={x * cellSize}
                  y={y * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill="transparent"
                  className={`cursor-pointer ${
                    placingMode === 'destination' 
                      ? 'hover:fill-blue-300 hover:fill-opacity-50' 
                      : 'hover:fill-blue-100 hover:fill-opacity-50'
                  } transition-all`}
                  onClick={() => handleCellClick(x, y)}
                />
              )
            })}

            {/* Trucks */}
            {trucks.map((truck) => (
              <g key={`truck-${truck.id}`} onClick={() => onTruckSelect && onTruckSelect(truck.id)}>
                <TruckIcon 
                  truck={truck} 
                  x={truck.x * cellSize} 
                  y={truck.y * cellSize} 
                  size={cellSize} 
                  isSelected={truck.id === selectedTruckId}
                />
                {/* Fuel and maintenance indicators */}
                {truck.fuel !== undefined && (
                  <g transform={`translate(${truck.x * cellSize}, ${(truck.y + 1) * cellSize - 4})`}>
                    <rect 
                      x={0} 
                      y={0} 
                      width={cellSize} 
                      height={3} 
                      fill="#e5e7eb" 
                      rx={1} 
                    />
                    <rect 
                      x={0} 
                      y={0} 
                      width={(truck.fuel / 100) * cellSize} 
                      height={3} 
                      fill={truck.fuel > 30 ? "#10b981" : "#ef4444"} 
                      rx={1} 
                    />
                  </g>
                )}
              </g>
            ))}

            {/* Destination marker if in placing mode */}
            {placingMode === 'destination' && selectedTruck && (
              <g 
                className="animate-pulse" 
                transform={`translate(${selectedTruck.x * cellSize + cellSize/2}, ${selectedTruck.y * cellSize + cellSize/2})`}
              >
                <circle r={cellSize/2} fill="blue" fillOpacity={0.3} stroke="blue" strokeWidth={1} />
                <circle r={2} fill="blue" />
              </g>
            )}
          </svg>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Áreas bloqueadas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Camiones operativos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>En mantenimiento</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 rounded"></div>
          <span>Averiados</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>Estación combustible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500 rounded"></div>
          <span>Estación mantenimiento</span>
        </div>
      </div>
    </div>
  )
})
