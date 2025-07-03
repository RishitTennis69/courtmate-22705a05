
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Users, Trophy, MessageSquare, UserPlus, Settings } from 'lucide-react';

export default function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/find-players', icon: UserPlus, label: 'Find' },
    { path: '/matches', icon: Trophy, label: 'Matches' },
    { path: '/messages', icon: MessageSquare, label: 'Messages' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Button
            key={path}
            variant={location.pathname === path ? "default" : "ghost"}
            size="sm"
            onClick={() => navigate(path)}
            className="flex flex-col gap-1 h-auto py-2 px-3"
          >
            <Icon className="h-4 w-4" />
            <span className="text-xs">{label}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
}
