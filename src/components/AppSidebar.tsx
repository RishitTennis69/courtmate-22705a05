
import {
  LayoutDashboard,
  Users,
  Search,
  Trophy,
  MessageSquare,
  LogOut,
  Settings,
} from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import NotificationCenter from "./NotificationCenter";
import { Badge } from "@/components/ui/badge"

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut, user } = useAuth()
  const [userProfile, setUserProfile] = useState<{
    full_name: string | null
    profile_image_url: string | null
    current_rating: number | null
  } | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("full_name, profile_image_url, current_rating")
          .eq("id", user.id)
          .single()

        if (error) {
          console.error("Error fetching profile:", error)
        } else {
          setUserProfile(data)
        }
      }
    }

    fetchProfile()
  }, [user])

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      title: "Find Players",
      icon: Search,
      path: "/find-players",
    },
    {
      title: "Matches",
      icon: Trophy,
      path: "/matches",
    },
    {
      title: "Messages",
      icon: MessageSquare,
      path: "/messages",
    },
    {
      title: "Circles",
      icon: Users,
      path: "/circles",
    },
  ]

  const adminItems = [
    {
      title: "Admin Panel",
      icon: Settings,
      path: "/admin",
    },
  ]

  const handleSignOut = async () => {
    await signOut()
    navigate("/")
  }

  return (
    <Sidebar className="border-r bg-gradient-to-b from-slate-50 to-white">
      <SidebarHeader className="border-b bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-gray-900 tracking-tight">CourtMate</span>
            <Badge variant="secondary" className="text-xs bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 font-medium border-emerald-200/50 w-fit">
              Tennis Community
            </Badge>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild className="group">
                    <Link 
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                        location.pathname === item.path 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25' 
                          : 'text-gray-700 hover:bg-gray-100 hover:text-emerald-600'
                      }`}
                    >
                      <item.icon className={`h-5 w-5 transition-transform duration-200 ${
                        location.pathname === item.path ? 'scale-110' : 'group-hover:scale-105'
                      }`} />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Admin
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild className="group">
                    <Link 
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                        location.pathname === item.path 
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/25' 
                          : 'text-gray-700 hover:bg-gray-100 hover:text-purple-600'
                      }`}
                    >
                      <item.icon className={`h-5 w-5 transition-transform duration-200 ${
                        location.pathname === item.path ? 'scale-110' : 'group-hover:scale-105'
                      }`} />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t bg-white/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-emerald-200">
              <AvatarImage src={userProfile?.profile_image_url} />
              <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold">
                {userProfile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">{userProfile?.full_name || 'User'}</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-600">Rating:</span>
                <Badge variant="outline" className="text-xs px-2 py-0">
                  {userProfile?.current_rating || 'N/A'}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSignOut}
              className="text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
