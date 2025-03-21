"use client"

import {
  ChevronsUpDown,
  LogOut,
  // User,
  type LucideIcon
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/sidebar/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/sidebar/ui/sidebar"

import {
  Avatar,
  // AvatarFallback,
  AvatarImage,
} from "@radix-ui/react-avatar"


import { useRouter } from 'next/navigation'
import { useAppContext } from "@/contexts/AppContext"
import { IMAGE_PATHS  } from "@/contexts/images"

const DEFAULT_AVATAR = IMAGE_PATHS.DEFAULT_AVATAR;

export function NavUser({
  user,
}: {
  user: {
    name: string
    // email: string
    role: string
    avatar?: LucideIcon
  }
}) {
  const { isMobile } = useSidebar()

  const router = useRouter()
  const { setIsLoggedIn, setUserPermissions, setUserInfo } = useAppContext()

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userPermissions')
    localStorage.removeItem('userInfo')
    
    // Clear user data from context
    setIsLoggedIn(false)
    setUserPermissions([])
    setUserInfo(null)

    // Clear CSRF token cookie
    document.cookie = 'x-csrf-token=; Path=/;'

    // Redirect to login page
    router.push('/login')
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {/* <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {user.avatar && <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"> <user.avatar strokeWidth={2} className="h-16 w-16 rounded-lg"/> </div> }
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.role}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton> */}

            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
             
              <Avatar className="h-8 w-8 rounded-lg shrink-0">
                <AvatarImage src={DEFAULT_AVATAR} alt={user.name} />
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.role}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                {user.avatar && <user.avatar className="h-8 w-8 rounded-lg"/>}
                {/* <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar> */}
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.role}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
