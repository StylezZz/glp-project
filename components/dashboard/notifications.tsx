import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Bell, AlertTriangle, Info, Truck, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Notifications() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>System alerts and updates</CardDescription>
        </div>
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Truck Breakdown</AlertTitle>
          <AlertDescription>
            TRK-008 reported engine failure in Sector D-3. Maintenance team dispatched.
          </AlertDescription>
        </Alert>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Tank Level Warning</AlertTitle>
          <AlertDescription>Tank 2 is below 70% capacity. Consider adjusting delivery schedule.</AlertDescription>
        </Alert>
        <Alert>
          <Calendar className="h-4 w-4" />
          <AlertTitle>Scheduled Maintenance</AlertTitle>
          <AlertDescription>TRK-003 is due for preventive maintenance tomorrow.</AlertDescription>
        </Alert>
        <Alert>
          <Truck className="h-4 w-4" />
          <AlertTitle>Route Optimization</AlertTitle>
          <AlertDescription>New route plan available for afternoon deliveries.</AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

