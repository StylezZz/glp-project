import { Metadata } from "next";
import { RoutePlanning } from "@/components/routes/route-planning";

export const metadata: Metadata = {
  title: "Routes | GLP Distribution Logistics",
  description: "Plan and optimize delivery routes",
};

export default function RoutesPage() {
  return <RoutePlanning />;
}
