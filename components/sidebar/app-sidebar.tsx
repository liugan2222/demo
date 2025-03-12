"use client"

import * as React from "react"

import { Database, House, 
  // ListChecks, 
  Package, ShoppingCart, 
  // SquareCheckBig, 
  User, UserRoundCog } from "lucide-react"

import { NavMain } from "@/components/sidebar/nav-main"
import { NavUser } from "@/components/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/sidebar/ui/sidebar"

import { useAppContext } from "@/contexts/AppContext"


// This is sample data.
const baseData = {
  user: {
    name: "admin",
    // email: "admin",
    role: "admin",
    avatar: User,
  },
  navMain: [
    {
      title: "Home",
      url: "/dashboard",
      icon: House,
      permissionId: 'dashboard',
      // isActive: true,
    },
    // {
    //   title: "Requests",
    //   url: "/requests",
    //   icon: SquareCheckBig,
    //   pendingNum: 4,
    // },
    {
      title: "Database",
      url: "/database",
      icon: Database,
      items: [
        {
          title: "Vendors",
          url: "/database/vendors",
          permissionId: 'Vendors_Read'
        },
        {
          title: "Items",
          url: "/database/items",
          permissionId: 'Items_Read'
        },
        {
          title: "Warehouses",
          url: "/database/warehouses",
          permissionId: 'Warehouses_Read'
        },
        {
          title: "Locations",
          url: "/database/locations",
          permissionId: 'Locations_Read'
        },
      ],
    },
    {
      title: "Procurement",
      url: "/procurement",
      icon: ShoppingCart,
      permissionId: 'Procurement_Read'
    },
    {
      title: "Receiving",
      url: "/receiving",
      icon: Package,
      permissionId: 'Receiving_Read'
    },
    // {
    //   title: "QA",
    //   url: "/qa",
    //   icon: ListChecks,
    //   permissionId: 'QA_Read'
    // },
    {
      title: "Admin",
      url: "/admin",
      icon: UserRoundCog,
      items: [
        {
          title: "Users",
          url: "/admin/users",
          permissionId: 'Users_Read'
        },
        {
          title: "Roles",
          url: "/admin/roles",
          permissionId: 'Roles_Read'
        },
        // {
        //   title: "Logbook",
        //   url: "/admin/logbook",
        // },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const [isLoading, setIsLoading] = React.useState(true)
  const { userPermissions, userInfo } = useAppContext()

  // 处理用户信息显示
  const displayUser = React.useMemo(() => {
    if (userInfo?.username === "admin") {
      return baseData.user
    }
    
    const groups = userInfo?.groups || []
    const role = groups
      .map((g: any) => g.groupName)
      .filter(Boolean)
      .join(", ")

    return {
      name: userInfo?.username || "Guest",
      role: role || "No Role",
      avatar: baseData.user.avatar
    }
  }, [userInfo])

  // 动态生成导航菜单
  const filterNavItems = (items: any[]): any[] => {
    return items.filter(item => {
      // 如果是dashboard路由，直接保留
      if (item.url === "/dashboard") return true;
  
      // 检查当前菜单项的permissionId是否在用户权限列表中
      const hasPermission = item.permissionId ? userPermissions.includes(item.permissionId) : true;
  
      // 如果有子菜单，递归过滤子菜单
      if (item.items) {
        const filteredSubItems = filterNavItems(item.items);
        // 如果过滤后的子菜单为空，说明没有子菜单被保留，当前菜单项也不应该被保留
        if (filteredSubItems.length === 0) {
          return false;
        }
        // 如果有子菜单被保留，当前菜单项也被保留
        item.items = filteredSubItems;
        return true;
      }
  
      // 如果没有子菜单，直接根据权限判断是否保留
      return hasPermission;
    });
  };

  // 判断是否是admin用户
  const isAdmin = userInfo?.username === "admin"
  const dynamicNavMain = isAdmin ? baseData.navMain : filterNavItems(baseData.navMain)


  React.useEffect(() => {
    // 确保用户信息加载完成
    if (userInfo !== null) {
      setIsLoading(false)
    }
  }, [userInfo])

  if (isLoading) {
    return <div className="h-screen bg-background">Loading ...</div>
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavUser user={displayUser} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={dynamicNavMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
