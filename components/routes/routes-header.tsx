import { Button } from "@/components/ui/button"
import { Save, Share, RefreshCw } from "lucide-react"

export function RoutesHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Route Planning</h1>
        <p className="text-muted-foreground">Optimize delivery routes and minimize fuel consumption</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <Share className="mr-2 h-4 w-4" />
          Share
        </Button>
        <Button variant="outline" size="sm">
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
        <Button size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Optimize
        </Button>
      </div>
    </div>
  )
}

