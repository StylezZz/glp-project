import type { Metadata } from "next";
import SimulationPageClient from "@/components/simulation/simulation-client";

export const metadata: Metadata = {
  title: "Simulation | GLP Distribution Logistics",
  description: "Run simulations for GLP distribution operations",
};

export default function SimulationPage() {
  return <SimulationPageClient/>
}
