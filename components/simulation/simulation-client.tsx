/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { SimulationHeader } from "@/components/simulation/simulation-header"
import { SimulationControls } from "@/components/simulation/simulation-controls"
import { SimulationSelection } from "@/components/simulation/simulation-selection"
import SimulationVisualizer from "@/components/simulation/simulation-visualizer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SimulationDataView } from "@/components/simulation/simulation-data-view"
import { SimulationVehiclesView } from "@/components/simulation/simulation-vehicles-view"
import { SimulationOrdersView } from "@/components/simulation/simulation-orders-view"
import { useState } from "react"

export default function SimulationPageClient() {
  const [simulationStarted, setSimulationStarted] = useState(false)
  const [simulationType, setSimulationType] = useState<string | null>(null)
  const [simulationData, setSimulationData] = useState<any>(null)

  const handleStartSimulation = (type: string, data: any) => {
    setSimulationType(type)
    setSimulationData(data)
    setSimulationStarted(true)
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {!simulationStarted ? (
        <SimulationSelection onStartSimulation={handleStartSimulation} />
      ) : (
        <div className="grid grid-cols-12 gap-4">
          {/* Panel de control */}
          <div className="col-span-12 lg:col-span-3">
            <SimulationControls simulationData={simulationData} />
          </div>

          {/* Panel principal */}
          <div className="col-span-12 lg:col-span-9 space-y-4">
            <SimulationVisualizer />
          </div>
        </div>
      )}
    </div>
  )
}
