
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import MobileBottomNav from "./MobileBottomNav"

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile()

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {!isMobile && <AppSidebar />}
        <SidebarInset className="flex-1">
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>
        {isMobile && <MobileBottomNav />}
      </div>
    </SidebarProvider>
  )
}
