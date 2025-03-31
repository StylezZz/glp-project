"use client"

import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type FleetTruck = {
  id: string
  driver: string
  capacity: string
  status: "Available" | "En Route" | "Loading" | "Delivering" | "Maintenance" | "Breakdown"
  location: string
  fuelLevel: number
  lastMaintenance: string
  nextMaintenance: string
}

const data: FleetTruck[] = [
  {
    id: "TRK-001",
    driver: "John Smith",
    capacity: "20m³",
    status: "En Route",
    location: "Sector A-5",
    fuelLevel: 72,
    lastMaintenance: "15 days ago",
    nextMaintenance: "45 days",
  },
  {
    id: "TRK-002",
    driver: "Maria Garcia",
    capacity: "15m³",
    status: "Loading",
    location: "Main Plant",
    fuelLevel: 95,
    lastMaintenance: "8 days ago",
    nextMaintenance: "52 days",
  },
  {
    id: "TRK-003",
    driver: "Robert Chen",
    capacity: "25m³",
    status: "Delivering",
    location: "Sector C-2",
    fuelLevel: 45,
    lastMaintenance: "22 days ago",
    nextMaintenance: "38 days",
  },
  {
    id: "TRK-004",
    driver: "Sarah Johnson",
    capacity: "10m³",
    status: "Available",
    location: "Depot",
    fuelLevel: 100,
    lastMaintenance: "2 days ago",
    nextMaintenance: "58 days",
  },
  {
    id: "TRK-005",
    driver: "David Kim",
    capacity: "18m³",
    status: "Maintenance",
    location: "Depot",
    fuelLevel: 30,
    lastMaintenance: "60 days ago",
    nextMaintenance: "0 days",
  },
  {
    id: "TRK-006",
    driver: "Lisa Wong",
    capacity: "22m³",
    status: "Available",
    location: "Depot",
    fuelLevel: 88,
    lastMaintenance: "12 days ago",
    nextMaintenance: "48 days",
  },
  {
    id: "TRK-007",
    driver: "Michael Brown",
    capacity: "15m³",
    status: "En Route",
    location: "Sector B-7",
    fuelLevel: 65,
    lastMaintenance: "18 days ago",
    nextMaintenance: "42 days",
  },
  {
    id: "TRK-008",
    driver: "Unassigned",
    capacity: "12m³",
    status: "Breakdown",
    location: "Sector D-3",
    fuelLevel: 20,
    lastMaintenance: "35 days ago",
    nextMaintenance: "25 days",
  },
  {
    id: "TRK-009",
    driver: "James Wilson",
    capacity: "20m³",
    status: "Available",
    location: "Depot",
    fuelLevel: 92,
    lastMaintenance: "5 days ago",
    nextMaintenance: "55 days",
  },
  {
    id: "TRK-010",
    driver: "Emily Davis",
    capacity: "25m³",
    status: "Delivering",
    location: "Sector E-1",
    fuelLevel: 58,
    lastMaintenance: "28 days ago",
    nextMaintenance: "32 days",
  },
]

export const columns: ColumnDef<FleetTruck>[] = [
  {
    accessorKey: "id",
    header: "Truck ID",
    cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "driver",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Driver
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "capacity",
    header: "Capacity",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge
          variant={
            status === "Available"
              ? "outline"
              : status === "En Route"
                ? "default"
                : status === "Loading"
                  ? "secondary"
                  : status === "Delivering"
                    ? "default"
                    : status === "Maintenance"
                      ? "secondary"
                      : "destructive"
          }
        >
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "fuelLevel",
    header: "Fuel",
    cell: ({ row }) => {
      const fuelLevel = row.getValue("fuelLevel") as number
      return (
        <div className="flex items-center gap-2">
          <Progress value={fuelLevel} className="h-2 w-16" />
          <span className="text-xs">{fuelLevel}%</span>
        </div>
      )
    },
  },
  {
    accessorKey: "nextMaintenance",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Next Maintenance
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const truck = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Assign driver</DropdownMenuItem>
            <DropdownMenuItem>Schedule maintenance</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Edit truck</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Remove truck</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function FleetTable() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  })

  return (
    <Card>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-medium">Fleet Inventory</h2>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter trucks..."
            value={(table.getColumn("id")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("id")?.setFilterValue(event.target.value)}
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 p-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {table.getFilteredRowModel().rows.length} of {data.length} trucks
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </Card>
  )
}

