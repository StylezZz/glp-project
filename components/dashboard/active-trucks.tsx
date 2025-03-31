"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Truck } from "lucide-react"
import Link from "next/link"

const trucks = [
  {
    id: "TRK-001",
    driver: "John Smith",
    capacity: "20m³",
    status: "En Route",
    location: "Sector A-5",
  },
  {
    id: "TRK-002",
    driver: "Maria Garcia",
    capacity: "15m³",
    status: "Loading",
    location: "Main Plant",
  },
  {
    id: "TRK-003",
    driver: "Robert Chen",
    capacity: "25m³",
    status: "Delivering",
    location: "Sector C-2",
  },
  {
    id: "TRK-004",
    driver: "Sarah Johnson",
    capacity: "10m³",
    status: "Returning",
    location: "Sector B-7",
  },
  {
    id: "TRK-005",
    driver: "David Kim",
    capacity: "18m³",
    status: "Maintenance",
    location: "Depot",
  },
]

export function ActiveTrucks() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Active Fleet</CardTitle>
          <CardDescription>Current truck status</CardDescription>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="/fleet">
            <Truck className="mr-2 h-4 w-4" />
            Manage Fleet
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-5 text-xs font-medium text-muted-foreground">
            <div>Truck ID</div>
            <div>Driver</div>
            <div>Capacity</div>
            <div>Status</div>
            <div>Location</div>
          </div>
          <div className="space-y-2">
            {trucks.map((truck) => (
              <div key={truck.id} className="grid grid-cols-5 items-center py-2 text-sm">
                <div className="font-medium">{truck.id}</div>
                <div>{truck.driver}</div>
                <div>{truck.capacity}</div>
                <div>
                  <Badge
                    variant={
                      truck.status === "En Route"
                        ? "default"
                        : truck.status === "Loading"
                          ? "secondary"
                          : truck.status === "Delivering"
                            ? "outline"
                            : truck.status === "Returning"
                              ? "secondary"
                              : "destructive"
                    }
                  >
                    {truck.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {truck.location}
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/fleet">View All Trucks</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

