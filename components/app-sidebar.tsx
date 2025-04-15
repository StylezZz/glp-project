"use client"

import { BarChart3, Fuel, Home, Map, Settings, Truck, Package, PlayCircle, Bell, ChevronsUpDown, LogOut, User } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { ModeToggle } from "@/components/mode-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { open } = useSidebar()

  const routes = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/",
    },
    {
      title: "Orders",
      icon: Package,
      href: "/orders",
    },
    {
      title: "Fleet",
      icon: Truck,
      href: "/fleet",
    },
    {
      title: "Routes",
      icon: Map,
      href: "/routes",
    },
    {
      title: "Simulation",
      icon: PlayCircle,
      href: "/simulation",
    },
    {
      title: "Analytics",
      icon: BarChart3,
      href: "/analytics",
    },
  ]
  
  const getLinkClassName = (path: string) => {
    const isActive = pathname === path;
    return `flex items-center p-2 rounded-lg ${
      isActive
        ? "text-primary font-medium bg-primary-foreground/20"
        : "text-foreground hover:text-primary hover:bg-muted"
    } ${!open ? "justify-center" : ""}`;
  };

  const getActiveIndicator = (path: string) => {
    if (pathname === path) {
      return (
        <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"></span>
      );
    }
    return null;
  };

  const renderMenuItem = (route: { href: string; icon: any; title: string }) => (
    <SidebarMenuItem key={route.href}>
      <SidebarMenuButton asChild tooltip={route.title}>
        <Link href={route.href} className={getLinkClassName(route.href)}>
          <route.icon className="h-5 w-5" />
          {open && <span className="ml-2">{route.title}</span>}
          {getActiveIndicator(route.href)}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  const handleLogout = () => {
    // Implement logout functionality
    router.push("/login");
  };

  const handleProfileClick = () => {
    router.push("/profile");
  };

  return (
    <Sidebar 
      className={`transition-all duration-300 ease-in-out ${open ? "w-64" : "w-16"}`}
      collapsible="icon"
    >
      <SidebarHeader className="p-4">
        <div className={`flex items-center transition-all duration-300 ease-in-out ${
          open ? "justify-start" : "justify-center"
        }`}>
          <Fuel className="h-6 w-6 text-primary" />
          {open && <span className="ml-2 text-xl font-bold">GLP Logistics</span>}
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {routes.map((route) => renderMenuItem(route))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderMenuItem({
                href: "/notifications",
                icon: Bell,
                title: "Notifications"
              })}
              {renderMenuItem({
                href: "/settings",
                icon: Settings,
                title: "Settings"
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                    <AvatarFallback>OP</AvatarFallback>
                  </Avatar>
                  {open && (
                    <div className="ml-2 grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        Operator
                      </span>
                      <span className="truncate text-xs">Dispatcher</span>
                    </div>
                  )}
                  {open && <ChevronsUpDown className="ml-auto h-4 w-4" />}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                align="start"
                side="top"
                sideOffset={4}
              >
                <DropdownMenuLabel className="text-xs text-muted-foreground">My Account</DropdownMenuLabel>
                <DropdownMenuItem className="gap-2 p-2" onClick={handleProfileClick}>
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 p-2" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="w-full flex justify-center">
              <ModeToggle />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

