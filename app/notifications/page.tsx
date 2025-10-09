'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Bell, 
  BellOff,
  Check,
  CheckCheck,
  MoreHorizontal,
  Calendar,
  CheckSquare,
  DollarSign,
  Briefcase,
  Settings,
  Trash2,
  Eye,
  Filter,
  AlertCircle,
} from 'lucide-react';
import { mockNotifications } from '@/lib/mock-data';
import Link from 'next/link';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  if (!user) return null;

  const filteredNotifications = mockNotifications.filter((notification) => {
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'read' && notification.isRead) ||
                         (statusFilter === 'unread' && !notification.isRead);
    
    return matchesType && matchesStatus;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'hearing': return <Calendar className="h-5 w-5 text-red-600" />;
      case 'task': return <CheckSquare className="h-5 w-5 text-blue-600" />;
      case 'payment': return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'case': return <Briefcase className="h-5 w-5 text-purple-600" />;
      case 'system': return <Settings className="h-5 w-5 text-gray-600" />;
      default: return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'hearing': return 'bg-red-50 border-red-200';
      case 'task': return 'bg-blue-50 border-blue-200';
      case 'payment': return 'bg-green-50 border-green-200';
      case 'case': return 'bg-purple-50 border-purple-200';
      case 'system': return 'bg-gray-50 border-gray-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return new Intl.DateTimeFormat('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
    }
  };

  const unreadCount = mockNotifications.filter(n => !n.isRead).length;

  return (
    <MainLayout title="Notifications">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
            <p className="text-gray-600">Stay updated with important alerts and reminders</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark All Read
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="hearing">Hearings</SelectItem>
                  <SelectItem value="task">Tasks</SelectItem>
                  <SelectItem value="payment">Payments</SelectItem>
                  <SelectItem value="case">Cases</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <Bell className="h-3 w-3" />
                  <span>{unreadCount} Unread</span>
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                  <p className="text-2xl font-bold text-gray-900">{mockNotifications.length}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <Bell className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unread</p>
                  <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-full">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hearing Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockNotifications.filter(n => n.type === 'hearing').length}
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded-full">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Task Reminders</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockNotifications.filter(n => n.type === 'task').length}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <CheckSquare className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filteredNotifications.length} {filteredNotifications.length === 1 ? 'Notification' : 'Notifications'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-colors hover:bg-gray-50 ${
                    notification.isRead ? 'bg-white' : 'bg-blue-50 border-blue-200'
                  } ${getNotificationColor(notification.type)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className={`font-medium ${notification.isRead ? 'text-gray-900' : 'text-gray-900 font-semibold'}`}>
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline" className="capitalize">
                            {notification.type}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(notification.createdAt)}
                          </span>
                          {notification.relatedTo && (
                            <Link
                              href={`/${notification.relatedTo.type}s/${notification.relatedTo.id}`}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              View {notification.relatedTo.type}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!notification.isRead && (
                        <Button variant="ghost" size="sm">
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!notification.isRead ? (
                            <DropdownMenuItem>
                              <Check className="mr-2 h-4 w-4" />
                              Mark as Read
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem>
                              <BellOff className="mr-2 h-4 w-4" />
                              Mark as Unread
                            </DropdownMenuItem>
                          )}
                          {notification.relatedTo && (
                            <Link href={`/${notification.relatedTo.type}s/${notification.relatedTo.id}`}>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Related
                              </DropdownMenuItem>
                            </Link>
                          )}
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
              {filteredNotifications.length === 0 && (
                <div className="text-center py-12">
                  <Bell className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You're all caught up! No notifications match your current filters.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}