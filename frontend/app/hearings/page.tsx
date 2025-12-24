'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Calendar,
  Clock,
  MapPin,
  User,
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { HEARING_TYPES } from '@/lib/constants';
import { getHearings, getHearingStats, deleteHearing, Hearing, HearingStats } from '@/lib/api/hearings';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function HearingsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [stats, setStats] = useState<HearingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchHearings = async () => {
    try {
      setLoading(true);
      const response = await getHearings({ limit: 1000 });
      setHearings(response.hearings);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch hearings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await getHearingStats();
      setStats(statsData);
    } catch (error: any) {
      console.error('Failed to fetch hearing stats:', error);
    }
  };

  useEffect(() => {
    fetchHearings();
    fetchStats();
  }, []);

  if (!user) return null;

  const handleDelete = async (hearingId: string) => {
    if (!confirm('Are you sure you want to delete this hearing?')) return;

    try {
      setDeleting(hearingId);
      await deleteHearing(hearingId);
      toast({
        title: 'Success',
        description: 'Hearing deleted successfully',
      });
      fetchHearings();
      fetchStats();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete hearing',
        variant: 'destructive',
      });
    } finally {
      setDeleting(null);
    }
  };

  const filteredHearings = hearings.filter((hearing) => {
    const matchesSearch = hearing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         hearing.court.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         hearing.caseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (hearing.judge && hearing.judge.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || hearing.status.toLowerCase() === statusFilter;
    const matchesType = typeFilter === 'all' || hearing.type.toLowerCase() === typeFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const today = new Date();
      const hearingDate = new Date(hearing.hearingDate);
      
      switch (dateFilter) {
        case 'today':
          matchesDate = hearingDate.toDateString() === today.toDateString();
          break;
        case 'week':
          const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          matchesDate = hearingDate >= today && hearingDate <= weekFromNow;
          break;
        case 'month':
          const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
          matchesDate = hearingDate >= today && hearingDate <= monthFromNow;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'postponed': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'postponed': return <AlertCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const formatTime = (time: string) => {
    return time;
  };

  const canCreateHearing = ['admin', 'lawyer'].includes(user.role);
  const canEditHearing = ['admin', 'lawyer'].includes(user.role);
  const canDeleteHearing = user.role === 'admin';

  if (loading) {
    return (
      <MainLayout title="Hearings">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading hearings...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Hearings">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Court Hearings</h2>
            <p className="text-gray-600">Manage and track all court hearings and schedules</p>
          </div>
          {canCreateHearing && (
            <Link href="/hearings/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Schedule Hearing
              </Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search hearings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="postponed">Postponed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {HEARING_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Dates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Hearing Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Hearings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalHearings || 0}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Scheduled</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.scheduledHearings || 0}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.upcomingHearings || 0}
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded-full">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.completedHearings || 0}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-full">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hearings Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filteredHearings.length} {filteredHearings.length === 1 ? 'Hearing' : 'Hearings'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case & Court</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Judge</TableHead>
                    <TableHead>Lawyer</TableHead>
                    <TableHead>Reminders</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHearings.map((hearing) => (
                    <TableRow key={hearing.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{hearing.caseName}</div>
                          <div className="text-sm text-gray-600 flex items-center mt-1">
                            <MapPin className="mr-1 h-3 w-3" />
                            {hearing.court}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900 flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                            {formatDate(new Date(hearing.hearingDate))}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center mt-1">
                            <Clock className="mr-2 h-4 w-4 text-gray-400" />
                            {formatTime(hearing.startTime)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {HEARING_TYPES.find(t => t.value === hearing.type)?.label || hearing.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(hearing.status.toLowerCase())}>
                          {getStatusIcon(hearing.status.toLowerCase())}
                          <span className="ml-1 capitalize">{hearing.status.toLowerCase()}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{hearing.judge || 'Not assigned'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">{hearing.lawyerName}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Bell className={`h-4 w-4 ${hearing.reminderSent ? 'text-green-600' : 'text-gray-400'}`} />
                          <span className="text-sm">
                            {hearing.reminderSent ? 'Sent' : 'Pending'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={deleting === hearing.id}>
                              {deleting === hearing.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link href={`/hearings/${hearing.id}`}>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                            </Link>
                            {canEditHearing && (
                              <Link href={`/hearings/${hearing.id}/edit`}>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                              </Link>
                            )}
                            {canDeleteHearing && (
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDelete(hearing.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}