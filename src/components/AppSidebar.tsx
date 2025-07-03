import {
  LayoutDashboard,
  Users,
  Search,
  Trophy,
  MessageSquare,
  LogOut,
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
} from "@/components/ui/sidebar"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar-group"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import NotificationCenter from "./NotificationCenter";

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

  const handleSignOut = async () => {
    await signOut()
    navigate("/")
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Trophy className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">TennisConnect</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        location.pathname === item.path 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userProfile?.profile_image_url} />
              <AvatarFallback>
                {userProfile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{userProfile?.full_name || 'User'}</span>
              <span className="text-xs text-muted-foreground">
                Rating: {userProfile?.current_rating || 'N/A'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
