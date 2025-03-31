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
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

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

type Order = {
  id: string
  customer: string
  location: string
  volume: string
  deadline: string
  status: "Pending" | "Assigned" | "In Progress" | "Completed" | "Cancelled"
  createdAt: string
}

const data: Order[] = [
  {
    id: "ORD-1234",
    customer: "Acme Corp",
    location: "Sector A-5 (3.2km)",
    volume: "15m³",
    deadline: "Today, 14:30",
    status: "In Progress",
    createdAt: "2 hours ago",
  },
  {
    id: "ORD-1235",
    customer: "TechSolutions Inc",
    location: "Sector B-3 (5.7km)",
    volume: "8m³",
    deadline: "Today, 16:00",
    status: "Pending",
    createdAt: "3 hours ago",
  },
  {
    id: "ORD-1236",
    customer: "Global Industries",
    location: "Sector C-7 (8.1km)",
    volume: "22m³",
    deadline: "Today, 17:45",
    status: "Assigned",
    createdAt: "5 hours ago",
  },
  {
    id: "ORD-1237",
    customer: "City Hospital",
    location: "Sector A-1 (2.3km)",
    volume: "12m³",
    deadline: "Tomorrow, 09:00",
    status: "Pending",
    createdAt: "Yesterday",
  },
  {
    id: "ORD-1238",
    customer: "Metro Hotel",
    location: "Sector D-4 (6.5km)",
    volume: "7m³",
    deadline: "Tomorrow, 11:30",
    status: "Pending",
    createdAt: "Yesterday",
  },
  {
    id: "ORD-1239",
    customer: "Sunshine Resorts",
    location: "Sector E-2 (12.8km)",
    volume: "18m³",
    deadline: "Tomorrow, 14:00",
    status: "Pending",
    createdAt: "Yesterday",
  },
  {
    id: "ORD-1240",
    customer: "Central University",
    location: "Sector B-6 (4.9km)",
    volume: "10m³",
    deadline: "Tomorrow, 16:30",
    status: "Pending",
    createdAt: "Yesterday",
  },
  {
    id: "ORD-1241",
    customer: "Greenfield Apartments",
    location: "Sector C-3 (7.2km)",
    volume: "25m³",
    deadline: "In 2 days, 10:00",
    status: "Pending",
    createdAt: "2 days ago",
  },
  {
    id: "ORD-1242",
    customer: "Riverside Mall",
    location: "Sector D-1 (9.5km)",
    volume: "20m³",
    deadline: "In 2 days, 13:45",
    status: "Pending",
    createdAt: "2 days ago",
  },
  {
    id: "ORD-1243",
    customer: "Mountain View Hotel",
    location: "Sector E-5 (15.3km)",
    volume: "12m³",
    deadline: "In 3 days, 09:30",
    status: "Pending",
    createdAt: "3 days ago",
  },
]

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "customer",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Customer
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "volume",
    header: "Volume",
  },
  {
    accessorKey: "deadline",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Deadline
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge
          variant={
            status === "In Progress"
              ? "default"
              : status === "Pending"
                ? "secondary"
                : status === "Assigned"
                  ? "outline"
                  : status === "Completed"
                    ? "success"
                    : "destructive"
          }
        >
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original

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
            <DropdownMenuItem>Assign truck</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Edit order</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Cancel order</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function OrdersTable() {
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
        <Input
          placeholder="Filter orders..."
          value={(table.getColumn("customer")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("customer")?.setFilterValue(event.target.value)}
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
          Showing {table.getFilteredRowModel().rows.length} of {data.length} orders
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

