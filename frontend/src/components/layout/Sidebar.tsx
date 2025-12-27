import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings as Cog, 
  ClipboardList, 
  Users, 
  Wrench,
  Calendar,
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  permission?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', permission: 'dashboard.view' },
  { label: 'Equipment', icon: Cog, href: '/equipment', permission: 'equipment.view' },
  { label: 'Requests', icon: ClipboardList, href: '/requests', permission: 'requests.view' },
  { label: 'Kanban Board', icon: Wrench, href: '/kanban', permission: 'requests.view' },
  { label: 'Calendar', icon: Calendar, href: '/calendar', permission: 'requests.view' },
  { label: 'Teams', icon: Users, href: '/teams', permission: 'teams.view' },
];

export function Sidebar() {
  const location = useLocation();
  const { user, logout, hasPermission } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filteredNavItems = navItems.filter(
    item => !item.permission || hasPermission(item.permission)
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-destructive/20 text-destructive';
      case 'MANAGER': return 'bg-primary/20 text-primary';
      case 'TECHNICIAN': return 'bg-success/20 text-success';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!isCollapsed && (
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-sidebar-foreground">GearGuard</span>
            </Link>
          )}
          {isCollapsed && (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary mx-auto">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "sidebar-item",
                  isActive && "sidebar-item-active",
                  isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-sidebar-border p-4">
          {user && (
            <div className={cn("mb-3", isCollapsed && "text-center")}>
              {!isCollapsed ? (
                <>
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">
                    {user.email}
                  </p>
                  <span className={cn(
                    "mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium",
                    getRoleBadgeColor(user.role)
                  )}>
                    {user.role}
                  </span>
                </>
              ) : (
                <div 
                  className={cn(
                    "mx-auto h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium",
                    getRoleBadgeColor(user.role)
                  )}
                  title={`${user.name} (${user.role})`}
                >
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
          )}
          <Button
            variant="ghost"
            onClick={logout}
            className={cn(
              "w-full text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
              isCollapsed && "px-2"
            )}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Sign Out</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
}
