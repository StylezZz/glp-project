import { Button } from "@/components/ui/button"
import { FileDown, Share, RefreshCw } from "lucide-react"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"

export function AnalyticsHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Performance metrics and operational insights</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <DatePickerWithRange />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Share className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <FileDown className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

