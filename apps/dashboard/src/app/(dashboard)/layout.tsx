import * as React from "react"
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { AdminGuard } from "@/providers/auth-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminGuard>
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset className="flex min-h-screen flex-col">
          <DashboardHeader />
          <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-6 md:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AdminGuard>
  )
}
