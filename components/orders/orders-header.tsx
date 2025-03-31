import { Button } from "@/components/ui/button"
import { Plus, FileDown, FileUp } from "lucide-react"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { CreateOrderDialog } from "@/components/orders/create-order-dialog" 
export function OrdersHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">Manage and track customer orders</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <DatePickerWithRange />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <FileDown className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <FileUp className="h-4 w-4" />
          </Button>
          <CreateOrderDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </CreateOrderDialog>
        </div>
      </div>
    </div>
  )
}

