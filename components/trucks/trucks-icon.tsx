"use client"

import { memo } from "react"
import type { Truck } from "@/types/logistics"

interface TruckIconProps {
  truck: Truck
  x: number
  y: number
  size: number
  isSelected?: boolean
}

export const TruckIcon = memo(function TruckIcon({ truck, x, y, size, isSelected = false }: TruckIconProps) {
  const getColor = () => {
    switch (truck.state) {
      case "operational":
        return "#10b981" // green-500
      case "maintenance":
        return "#f59e0b" // yellow-500
      case "broken":
        return "#dc2626" // red-600
      default:
        return "#6b7280" // gray-500
    }
  }

  const getRotation = () => {
    return truck.direction * 90
  }
  return (
    <g transform={`translate(${x + size / 2}, ${y + size / 2})`} className="cursor-pointer">
      {/* Selection highlight */}
      {isSelected && (
        <circle
          r={size * 0.55}
          fill="transparent"
          stroke="#2563eb"
          strokeWidth={2}
          strokeDasharray="4,2"
          className="animate-pulse"
        />
      )}
      
      <g transform={`rotate(${getRotation()})`}>
        {/* Truck body */}
        <rect
          x={-size * 0.3}
          y={-size * 0.4}
          width={size * 0.6}
          height={size * 0.8}
          fill={getColor()}
          stroke={isSelected ? "#2563eb" : "#ffffff"}
          strokeWidth={isSelected ? 2 : 1}
          rx={2}
        />

        {/* Truck cab */}
        <rect
          x={-size * 0.2}
          y={-size * 0.4}
          width={size * 0.4}
          height={size * 0.3}
          fill={getColor()}
          stroke={isSelected ? "#2563eb" : "#ffffff"}
          strokeWidth={isSelected ? 2 : 1}
          rx={1}
        />

        {/* Truck ID */}
        <text x={0} y={size * 0.1} textAnchor="middle" fontSize={size * 0.4} fill="white" fontWeight="bold">
          {truck.id}
        </text>
      </g>

      {/* Status indicator */}
      {truck.state !== "operational" && (
        <circle
          cx={size * 0.3}
          cy={-size * 0.3}
          r={size * 0.15}
          fill={truck.state === "maintenance" ? "#f59e0b" : "#dc2626"}
          stroke="#ffffff"
          strokeWidth={1}
        />
      )}
      
      {/* Add fuel indicator if it's too low */}
      {truck.fuel !== undefined && truck.fuel < 20 && (
        <circle
          cx={size * -0.3}
          cy={-size * 0.3}
          r={size * 0.15}
          fill="#dc2626"
          stroke="#ffffff"
          strokeWidth={1}
          className={truck.fuel < 10 ? "animate-pulse" : ""}
        >
          <title>Nivel crítico de combustible</title>
        </circle>
      )}
    </g>
  )
})
