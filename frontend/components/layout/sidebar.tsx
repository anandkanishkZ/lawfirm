'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  FileText,
  Users,
  Calendar,
  DollarSign,
  CheckSquare,
  Bell,
  Upload,
  Settings,
  Scale,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Briefcase,
  Clock,
  BookOpen,
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

const getMenuItems = (role: string) => {
  const commonItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Notifications', href: '/notifications', icon: Bell },
  ];

  const roleSpecificItems = {
    admin: [
      { name: 'Cases', href: '/cases', icon: Briefcase },
      { name: 'Clients', href: '/clients', icon: Users },
      { name: 'Hearings', href: '/hearings', icon: Clock },
      { name: 'Documents', href: '/documents', icon: FileText },
      { name: 'Templates', href: '/templates', icon: BookOpen },
      { name: 'Billing', href: '/billing', icon: DollarSign },
      { name: 'Users', href: '/users', icon: User },
      { name: 'Settings', href: '/settings', icon: Settings },
    ],
    lawyer: [
      { name: 'My Cases', href: '/cases', icon: Briefcase },
      { name: 'Clients', href: '/clients', icon: Users },
      { name: 'Hearings', href: '/hearings', icon: Clock },
      { name: 'Documents', href: '/documents', icon: FileText },
      { name: 'Templates', href: '/templates', icon: BookOpen },
      { name: 'Billing', href: '/billing', icon: DollarSign },
    ],
    staff: [
      { name: 'Cases', href: '/cases', icon: Briefcase },
      { name: 'Clients', href: '/clients', icon: Users },
      { name: 'Documents', href: '/documents', icon: FileText },
      { name: 'File Upload', href: '/upload', icon: Upload },
    ],
    client: [
      { name: 'My Cases', href: '/cases', icon: Briefcase },
      { name: 'Documents', href: '/documents', icon: FileText },
      { name: 'Invoices', href: '/billing', icon: DollarSign },
    ],
  };

  return [...commonItems, ...(roleSpecificItems[role as keyof typeof roleSpecificItems] || [])];
};

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const menuItems = getMenuItems(user.role);

  return (
    <div
      className={cn(
        "flex flex-col bg-card border-r border-border transition-all duration-300 shadow-sm",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary rounded-lg">
              <Scale className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-lg font-bold text-foreground">LawFirm</span>
              <p className="text-xs text-muted-foreground">Management System</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0 hover:bg-accent"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start transition-colors",
                  collapsed && "justify-center px-2",
                  isActive 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm" 
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {!collapsed && <span className="ml-3">{item.name}</span>}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          onClick={logout}
          className={cn(
            "w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </div>
  );
}