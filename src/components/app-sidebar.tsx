"use client"

import * as React from "react"
import {
  LayoutDashboardIcon,
  User,
  LogOutIcon,
  Dumbbell,
  BookOpen,
  Languages,
  Library,
  PenLine,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { signOut, useSession } from "next-auth/react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    // Dashboard
    {
      title: "Overview",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
      isSection: false,
    },
    // Learning Activities
    {
      title: "Reading",
      url: "/readings",
      icon: BookOpen,
      isSection: false,
    },
    {
      title: "Writing",
      url: "/writing",
      icon: PenLine,
      isSection: false,
    },
    {
      title: "Drills",
      url: "/conjugation-drills",
      icon: Dumbbell,
      isSection: false,
    },
    {
      title: "Conjugation",
      url: "/dashboard/conjugation",
      icon: Languages,
      isSection: false,
    },
    // Personal Content
    {
      title: "My Lists",
      url: "/lists",
      icon: Library,
      isSection: false,
    },
    // Settings
    {
      title: "Account",
      url: "/account",
      icon: User,
      isSection: false,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()

  const user = {
    name: session?.user?.name || "User",
    email: session?.user?.email || "user@example.com",
    avatar: session?.user?.image || "",
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="pb-4">
        <NavUser user={user} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <LogOutIcon />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
