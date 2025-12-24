'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Phone,
  Mail,
  MapPin,
  Building,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { getAllClients, deleteClient, getClientStats, type Client, type ClientStats } from '@/lib/api/clients';

export default function ClientsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(''); // User input (immediate)
  const [searchQuery, setSearchQuery] = useState(''); // Debounced value (delayed)
  const [typeFilter, setTypeFilter] = useState('all');
  const [kycFilter, setKycFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch clients and stats
  const fetchData = async () => {
    try {
      console.log('🚀 Starting fetchData...');
      setLoading(true);
      
      console.log('📞 Calling getAllClients with filters:', {
        page: 1,
        limit: 100,
        search: searchQuery || undefined,
        clientType: typeFilter !== 'all' ? typeFilter.toUpperCase() : undefined,
        kycStatus: kycFilter !== 'all' ? kycFilter.toUpperCase() : undefined,
      });
      
      const [clientsData, statsData] = await Promise.all([
        getAllClients({
          page: 1,
          limit: 100,
          search: searchQuery || undefined,
          clientType: typeFilter !== 'all' ? typeFilter.toUpperCase() : undefined,
          kycStatus: kycFilter !== 'all' ? kycFilter.toUpperCase() : undefined,
        }),
        getClientStats()
      ]);
      
      console.log('✅ Clients fetched:', clientsData);
      console.log('📊 Clients array:', clientsData.clients);
      console.log('📈 Clients count:', clientsData.clients?.length);
      console.log('📊 Stats fetched:', statsData);
      
      setClients(clientsData.clients);
      setStats(statsData.stats);
      
      console.log('💾 State updated - clients:', clientsData.clients?.length);
    } catch (error: any) {
      console.error('❌ Error fetching clients:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch clients',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      console.log('✅ fetchData complete');
    }
  };

  // Debounce search input (500ms delay)
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(debounceTimer); // Cleanup on every keystroke
  }, [searchInput]);

  // Load data on mount and when filters change
  useEffect(() => {
    if (user) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, typeFilter, kycFilter, user]);

  // Early return AFTER all hooks
  if (!user) return null;

  // Handle delete
  const handleDelete = async () => {
    if (!clientToDelete) return;
    
    try {
      setDeleting(true);
      await deleteClient(clientToDelete);
      
      toast({
        title: 'Success',
        description: 'Client deleted successfully',
      });
      
      setDeleteDialogOpen(false);
      setClientToDelete(null);
      fetchData(); // Refresh data
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete client',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const getKycStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'VERIFIED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'UNDER_REVIEW': return 'bg-blue-100 text-blue-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'INCOMPLETE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getKycStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'VERIFIED': return <CheckCircle className="h-4 w-4" />;
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'UNDER_REVIEW': return <AlertCircle className="h-4 w-4" />;
      case 'REJECTED': return <XCircle className="h-4 w-4" />;
      case 'INCOMPLETE': return <Clock className="h-4 w-4" />;
      default: return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const canCreateClient = ['admin', 'lawyer'].includes(user.role);
  const canEditClient = ['admin', 'lawyer'].includes(user.role);
  const canDeleteClient = user.role === 'admin';

  return (
    <MainLayout title="Clients">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Clients</h2>
            <p className="text-gray-600">Manage client information and relationships</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchData} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {canCreateClient && (
              <Link href="/clients/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Client
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search clients..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="trust">Trust</SelectItem>
                  <SelectItem value="society">Society</SelectItem>
                </SelectContent>
              </Select>
              <Select value={kycFilter} onValueChange={setKycFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All KYC Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All KYC Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="incomplete">Incomplete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Client Statistics */}
        {loading && !stats ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Clients</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Individual Clients</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.individualClients}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-full">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Company Clients</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.companyClients}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-full">
                    <Building className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">KYC Verified</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.verifiedKyc}</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-full">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Clients Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {loading ? 'Loading...' : `${clients.length} ${clients.length === 1 ? 'Client' : 'Clients'}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No clients found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery || typeFilter !== 'all' || kycFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Get started by creating a new client'}
                </p>
                {canCreateClient && !searchQuery && typeFilter === 'all' && kycFilter === 'all' && (
                  <div className="mt-6">
                    <Link href="/clients/new">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Client
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>KYC Status</TableHead>
                      <TableHead>Assigned Lawyer</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>
                                {client.name.split(' ').map((n: string) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-900">{client.name}</div>
                              <div className="text-xs text-gray-500">ID: {client.clientId}</div>
                              {client.companyName && (
                                <div className="text-sm text-gray-600">{client.companyName}</div>
                              )}
                              <div className="text-xs text-gray-500 flex items-center mt-1">
                                <MapPin className="mr-1 h-3 w-3" />
                                {client.city}, {client.state}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {client.email && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Mail className="h-3 w-3 text-gray-400" />
                                <span>{client.email}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-2 text-sm">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span>{client.phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {client.clientType === 'INDIVIDUAL' ? (
                              <><User className="mr-1 h-3 w-3" /> Individual</>
                            ) : client.clientType === 'COMPANY' ? (
                              <><Building className="mr-1 h-3 w-3" /> Company</>
                            ) : (
                              client.clientType.toLowerCase()
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getKycStatusColor(client.kycStatus)}>
                            {getKycStatusIcon(client.kycStatus)}
                            <span className="ml-1 capitalize">{client.kycStatus.toLowerCase().replace('_', ' ')}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {client.assignedLawyer ? (
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {client.assignedLawyer.name.split(' ').map((n: string) => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{client.assignedLawyer.name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              client.priority === 'URGENT' ? 'destructive' : 
                              client.priority === 'HIGH' ? 'default' : 
                              'secondary'
                            }
                          >
                            {client.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {formatDate(client.createdAt)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <Link href={`/clients/${client.id}`}>
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                              </Link>
                              {canEditClient && (
                                <Link href={`/clients/${client.id}/edit`}>
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                </Link>
                              )}
                              {canDeleteClient && (
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => {
                                    setClientToDelete(client.id);
                                    setDeleteDialogOpen(true);
                                  }}
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
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Client</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this client? This action will deactivate the client record.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}