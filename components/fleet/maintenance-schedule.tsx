"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wrench, AlertTriangle, CalendarIcon } from "lucide-react"

export function MaintenanceSchedule() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  // Maintenance events for the calendar
  const maintenanceEvents = [
    { date: new Date(), trucks: ["TRK-005"], type: "Preventive" },
    { date: new Date(new Date().setDate(new Date().getDate() + 5)), trucks: ["TRK-008"], type: "Corrective" },
    { date: new Date(new Date().setDate(new Date().getDate() + 12)), trucks: ["TRK-003"], type: "Preventive" },
    { date: new Date(new Date().setDate(new Date().getDate() + 18)), trucks: ["TRK-007"], type: "Preventive" },
    { date: new Date(new Date().setDate(new Date().getDate() + 25)), trucks: ["TRK-010"], type: "Preventive" },
  ]

  // Function to check if a date has maintenance events
  const hasMaintenanceEvent = (day: Date) => {
    return maintenanceEvents.some(
      (event) =>
        event.date.getDate() === day.getDate() &&
        event.date.getMonth() === day.getMonth() &&
        event.date.getFullYear() === day.getFullYear(),
    )
  }

  // Get events for the selected date
  const getEventsForDate = (selectedDate: Date) => {
    return maintenanceEvents.filter(
      (event) =>
        event.date.getDate() === selectedDate.getDate() &&
        event.date.getMonth() === selectedDate.getMonth() &&
        event.date.getFullYear() === selectedDate.getFullYear(),
    )
  }

  const selectedDateEvents = date ? getEventsForDate(date) : []

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Maintenance Schedule</CardTitle>
            <CardDescription>Upcoming truck maintenance</CardDescription>
          </div>
          <Wrench className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="calendar">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          </TabsList>
          <TabsContent value="calendar" className="p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              modifiers={{
                maintenance: (day) => hasMaintenanceEvent(day),
              }}
              modifiersStyles={{
                maintenance: {
                  fontWeight: "bold",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  color: "rgb(239, 68, 68)",
                  borderRadius: "50%",
                },
              }}
            />

            <div className="mt-4">
              <h3 className="text-sm font-medium">
                {date
                  ? date.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "No date selected"}
              </h3>

              {selectedDateEvents.length > 0 ? (
                <div className="mt-2 space-y-2">
                  {selectedDateEvents.map((event, index) => (
                    <div key={index} className="rounded-md border p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={event.type === "Preventive" ? "outline" : "destructive"}>{event.type}</Badge>
                          <span className="font-medium">{event.trucks.join(", ")}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">No maintenance scheduled for this date.</p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="upcoming" className="p-4 space-y-4">
            <div className="rounded-md border p-3 bg-red-50 dark:bg-red-950">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <div className="font-medium text-red-600 dark:text-red-400">Today</div>
              </div>
              <div className="mt-2 pl-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">TRK-005</div>
                    <div className="text-sm text-muted-foreground">Preventive Maintenance</div>
                  </div>
                  <Badge>Scheduled</Badge>
                </div>
              </div>
            </div>

            <div className="rounded-md border p-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <div className="font-medium">In 5 days</div>
              </div>
              <div className="mt-2 pl-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">TRK-008</div>
                    <div className="text-sm text-muted-foreground">Corrective Maintenance</div>
                  </div>
                  <Badge variant="outline">Pending</Badge>
                </div>
              </div>
            </div>

            <div className="rounded-md border p-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <div className="font-medium">In 12 days</div>
              </div>
              <div className="mt-2 pl-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">TRK-003</div>
                    <div className="text-sm text-muted-foreground">Preventive Maintenance</div>
                  </div>
                  <Badge variant="outline">Pending</Badge>
                </div>
              </div>
            </div>

            <div className="rounded-md border p-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <div className="font-medium">In 18 days</div>
              </div>
              <div className="mt-2 pl-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">TRK-007</div>
                    <div className="text-sm text-muted-foreground">Preventive Maintenance</div>
                  </div>
                  <Badge variant="outline">Pending</Badge>
                </div>
              </div>
            </div>

            <div className="rounded-md border p-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <div className="font-medium">In 25 days</div>
              </div>
              <div className="mt-2 pl-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">TRK-010</div>
                    <div className="text-sm text-muted-foreground">Preventive Maintenance</div>
                  </div>
                  <Badge variant="outline">Pending</Badge>
                </div>
              </div>
            </div>

            <Button className="w-full" variant="outline">
              Schedule New Maintenance
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

