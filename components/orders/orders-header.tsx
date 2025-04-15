import { Button } from "@/components/ui/button"
import { Plus, FileDown, FileUp } from "lucide-react"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { CreateOrderDialog } from "@/components/orders/create-order-dialog" 
export function OrdersHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
        <p className="text-muted-foreground">Gestiona y rastrea los pedidos de clientes</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <CreateOrderDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Pedido
            </Button>
          </CreateOrderDialog>
        </div>
      </div>
    </div>
  )
}

