import type { Metadata } from "next"
import { SimulationHeader } from "@/components/simulation/simulation-header"
import { SimulationControls } from "@/components/simulation/simulation-controls"
import { SimulationVisualizer } from "@/components/simulation/simulation-visualizer"
import { SimulationResults } from "@/components/simulation/simulation-results"

export const metadata: Metadata = {
  title: "Simulation | GLP Distribution Logistics",
  description: "Run simulations for GLP distribution operations",
}

export default function SimulationPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <SimulationHeader />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <SimulationControls />
        <div className="lg:col-span-3">
          <SimulationVisualizer />
        </div>
      </div>
      <SimulationResults />
    </div>
  )
}

