'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { getClientById, deleteClient, type Client } from '@/lib/api/clients';
import { ActivityTimeline, type ActivityEvent } from '@/components/clients/activity-timeline';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  FileText,
  Building2,
  Calendar,
  Shield,
  AlertCircle,
  Flag,
  Printer,
  Share2,
  Download
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function ViewClientPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [client, setClient] = useState<Client | null>(null);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);

  const clientId = params?.id as string;

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        const response = await getClientById(clientId);
        setClient(response.client);
        
        // Generate activity timeline from client data
        const generatedActivities: ActivityEvent[] = [
          {
            id: '1',
            type: 'created',
            title: 'Client Created',
            description: `Client profile was created in the system`,
            timestamp: new Date(response.client.createdAt),
            user: 'System',
          },
        ];

        if (response.client.updatedAt !== response.client.createdAt) {
          generatedActivities.push({
            id: '2',
            type: 'updated',
            title: 'Profile Updated',
            description: 'Client information was modified',
            timestamp: new Date(response.client.updatedAt),
            user: 'System',
          });
        }

        if (response.client.kycStatus === 'VERIFIED') {
          generatedActivities.push({
            id: '3',
            type: 'status_change',
            title: 'KYC Verified',
            description: 'All identity documents have been verified',
            timestamp: new Date(response.client.updatedAt),
            user: 'Compliance Team',
            metadata: { status: 'Verified' },
          });
        }

        // Sort by timestamp descending (newest first)
        generatedActivities.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setActivities(generatedActivities);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to fetch client',
          variant: 'destructive',
        });
        router.push('/clients');
      } finally {
        setLoading(false);
      }
    };

    if (clientId && user) {
      fetchClient();
    }
  }, [clientId, user]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteClient(clientId);
      
      toast({
        title: 'Success',
        description: 'Client deleted successfully',
      });
      
      router.push('/clients');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete client',
        variant: 'destructive',
      });
      setDeleting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `Client: ${client?.name}`,
        text: `View client details for ${client?.name}`,
        url: shareUrl,
      }).catch(() => {
        navigator.clipboard.writeText(shareUrl);
        toast({
          title: 'Link Copied',
          description: 'Client link copied to clipboard',
        });
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Link Copied',
        description: 'Client link copied to clipboard',
      });
    }
  };

  const handleDownload = () => {
    const dataStr = JSON.stringify(client, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `client-${client?.clientId}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast({
      title: 'Downloaded',
      description: 'Client data downloaded as JSON',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED': return 'bg-green-100 text-green-800';
      case 'UNDER_REVIEW': return 'bg-blue-100 text-blue-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'INCOMPLETE': return 'bg-yellow-100 text-yellow-800';
      case 'PENDING': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <MainLayout title="Client Details">
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner />
        </div>
      </MainLayout>
    );
  }

  if (!client) {
    return (
      <MainLayout title="Client Not Found">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Client Not Found</h2>
          <Link href="/clients">
            <Button className="mt-4">Back to Clients</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Client Details">
      <div className="space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-gray-900">{client.name}</h2>
              <Badge variant="outline" className="font-mono">
                {client.clientId}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getPriorityColor(client.priority)}>
                <Flag className="mr-1 h-3 w-3" />
                {client.priority}
              </Badge>
              <Badge className={getKYCStatusColor(client.kycStatus)}>
                <Shield className="mr-1 h-3 w-3" />
                KYC: {client.kycStatus.replace('_', ' ')}
              </Badge>
              <Badge variant="outline">
                {client.clientType}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="no-print">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare} className="no-print">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload} className="no-print">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Link href="/clients">
              <Button variant="outline" className="no-print">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            {user && ['admin', 'lawyer'].includes(user.role) && (
              <>
                <Link href={`/clients/${clientId}/edit`}>
                  <Button variant="outline" className="no-print">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="no-print">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the client &quot;{client.name}&quot; and all associated data.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleting}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {deleting ? 'Deleting...' : 'Delete Client'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="identity">Identity Documents</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {client.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{client.email}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{client.phone}</p>
                    </div>
                  </div>

                  {client.alternatePhone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Alternate Phone</p>
                        <p className="font-medium">{client.alternatePhone}</p>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{client.address}</p>
                      <p className="text-sm text-gray-600">
                        {client.city}, {client.state} {client.pincode}
                      </p>
                      <p className="text-sm text-gray-600">{client.country}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company Information (if applicable) */}
              {client.clientType !== 'INDIVIDUAL' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Company Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {client.companyName && (
                      <div>
                        <p className="text-sm text-gray-500">Company Name</p>
                        <p className="font-medium">{client.companyName}</p>
                      </div>
                    )}
                    
                    {client.companyType && (
                      <div>
                        <p className="text-sm text-gray-500">Company Type</p>
                        <p className="font-medium">{client.companyType}</p>
                      </div>
                    )}

                    {client.cinNumber && (
                      <div>
                        <p className="text-sm text-gray-500">Registration Number</p>
                        <p className="font-medium font-mono">{client.cinNumber}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm text-gray-500">Entity Type</p>
                      <Badge variant="outline">{client.clientType}</Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Client ID</p>
                    <p className="font-medium font-mono">{client.clientId}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Created At</p>
                    <p className="font-medium">
                      {format(new Date(client.createdAt), 'PPP')}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium">
                      {format(new Date(client.updatedAt), 'PPP')}
                    </p>
                  </div>

                  {client.assignedLawyerId && (
                    <div>
                      <p className="text-sm text-gray-500">Assigned Lawyer</p>
                      <Badge variant="outline">ID: {client.assignedLawyerId}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Notes */}
              {client.notes && (
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">{client.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Identity Documents Tab */}
          <TabsContent value="identity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Identity Documents (Nepal)
                </CardTitle>
                <CardDescription>
                  Registered identity documents for verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">PAN Number</p>
                    <p className="text-lg font-mono">
                      {client.panNumber || <span className="text-gray-400">Not provided</span>}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Citizenship Number</p>
                    <p className="text-lg font-mono">
                      {client.citizenshipNo || <span className="text-gray-400">Not provided</span>}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">National ID</p>
                    <p className="text-lg font-mono">
                      {client.nationalId || <span className="text-gray-400">Not provided</span>}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Passport Number</p>
                    <p className="text-lg font-mono">
                      {client.passportNo || <span className="text-gray-400">Not provided</span>}
                    </p>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">KYC Status: {client.kycStatus.replace('_', ' ')}</p>
                      <p className="text-sm text-blue-700 mt-1">
                        {client.kycStatus === 'VERIFIED' && 'All identity documents have been verified.'}
                        {client.kycStatus === 'UNDER_REVIEW' && 'Documents are currently under review.'}
                        {client.kycStatus === 'PENDING' && 'Awaiting document submission.'}
                        {client.kycStatus === 'INCOMPLETE' && 'Some documents are missing or incomplete.'}
                        {client.kycStatus === 'REJECTED' && 'Documents have been rejected. Please review and resubmit.'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <ActivityTimeline events={activities} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
