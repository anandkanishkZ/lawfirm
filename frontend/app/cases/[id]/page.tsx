'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  User,
  Building,
  Scale,
  FileText,
  Clock,
  AlertCircle,
  Tag,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { getCaseById, deleteCase, Case } from '@/lib/api/cases';
import { CASE_STATUS, CASE_TYPES, PRIORITY_LEVELS } from '@/lib/constants';
import Link from 'next/link';

export default function CaseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const caseId = params.id as string;

  useEffect(() => {
    if (!user || !caseId) return;

    const fetchCase = async () => {
      try {
        setLoading(true);
        const response = await getCaseById(caseId);
        setCaseData(response.case);
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Failed to fetch case details',
        });
        router.push('/cases');
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [user, caseId, toast, router]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteCase(caseId);
      
      toast({
        title: 'Success',
        description: 'Case deleted successfully',
      });

      router.push('/cases');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete case',
      });
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase().replace('_', '-');
    return CASE_STATUS.find(s => s.value === normalizedStatus)?.color || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const normalizedPriority = priority.toLowerCase();
    return PRIORITY_LEVELS.find(p => p.value === normalizedPriority)?.color || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-IN', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const canEdit = ['admin', 'lawyer'].includes(user?.role || '');
  const canDelete = user?.role === 'admin';

  if (!user) return null;

  if (loading) {
    return (
      <MainLayout title="Case Details">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </MainLayout>
    );
  }

  if (!caseData) {
    return null;
  }

  return (
    <MainLayout title="Case Details">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/cases">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cases
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{caseData.title}</h2>
              <p className="text-gray-600">{caseData.caseNumber}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {canEdit && (
              <Link href={`/cases/${caseId}/edit`}>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
            )}
            {canDelete && (
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-3">
          <Badge className={getStatusColor(caseData.status)}>
            {caseData.status.toLowerCase().replace('_', ' ')}
          </Badge>
          <Badge variant="outline">
            {CASE_TYPES.find(t => t.value === caseData.type.toLowerCase())?.label || caseData.type}
          </Badge>
          <Badge className={getPriorityColor(caseData.priority)}>
            {caseData.priority.toLowerCase()} priority
          </Badge>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Information */}
            <Card>
              <CardHeader>
                <CardTitle>Case Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3">
                    <Building className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Court</p>
                      <p className="text-base text-gray-900">{caseData.court}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Filing Date</p>
                      <p className="text-base text-gray-900">{formatDate(caseData.filingDate)}</p>
                    </div>
                  </div>

                  {caseData.nextHearing && (
                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Next Hearing</p>
                        <p className="text-base text-gray-900">{formatDate(caseData.nextHearing)}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start space-x-3">
                    <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Case Number</p>
                      <p className="text-base text-gray-900 font-mono">{caseData.caseNumber}</p>
                    </div>
                  </div>
                </div>

                {caseData.description && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
                      <p className="text-base text-gray-900 whitespace-pre-wrap">{caseData.description}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Parties Involved */}
            <Card>
              <CardHeader>
                <CardTitle>Parties Involved</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {caseData.plaintiff && caseData.plaintiff.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Plaintiff(s)</p>
                    <div className="space-y-2">
                      {caseData.plaintiff.map((p, index) => (
                        <div key={index} className="flex items-center space-x-2 text-gray-900">
                          <Scale className="h-4 w-4 text-blue-600" />
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {caseData.defendant && caseData.defendant.length > 0 && (
                  <div>
                    <Separator className="my-4" />
                    <p className="text-sm font-medium text-gray-500 mb-2">Defendant(s)</p>
                    <div className="space-y-2">
                      {caseData.defendant.map((d, index) => (
                        <div key={index} className="flex items-center space-x-2 text-gray-900">
                          <Scale className="h-4 w-4 text-red-600" />
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            {caseData.tags && caseData.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {caseData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - People & Meta */}
          <div className="space-y-6">
            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle>Client</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {caseData.clientName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-gray-900 truncate">
                      {caseData.clientName}
                    </p>
                    {caseData.client && (
                      <div className="mt-2 space-y-1.5">
                        {caseData.client.email && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Mail className="h-3.5 w-3.5" />
                            <span className="truncate">{caseData.client.email}</span>
                          </div>
                        )}
                        {caseData.client.phone && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{caseData.client.phone}</span>
                          </div>
                        )}
                        {caseData.client.city && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{caseData.client.city}, {caseData.client.state}</span>
                          </div>
                        )}
                      </div>
                    )}
                    <Link href={`/clients/${caseData.clientId}`}>
                      <Button variant="link" size="sm" className="h-auto p-0 mt-2">
                        View Client Profile →
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assigned Lawyer */}
            {caseData.assignedLawyer && caseData.assignedLawyerUser && (
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Lawyer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-green-100 text-green-700">
                        {caseData.assignedLawyer.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-gray-900 truncate">
                        {caseData.assignedLawyer}
                      </p>
                      <div className="mt-2 space-y-1.5">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="h-3.5 w-3.5" />
                          <span className="truncate">{caseData.assignedLawyerUser.email}</span>
                        </div>
                        <Badge variant="outline" className="mt-2">
                          {caseData.assignedLawyerUser.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Case Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Created On</p>
                  <p className="text-sm text-gray-900">{formatDate(caseData.createdAt)}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Updated</p>
                  <p className="text-sm text-gray-900">{formatDate(caseData.updatedAt)}</p>
                </div>
                {caseData.createdBy && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Created By</p>
                      <p className="text-sm text-gray-900">{caseData.createdBy.name}</p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {caseData.createdBy.role}
                      </Badge>
                    </div>
                  </>
                )}
                <Separator />
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge className={`mt-1 ${caseData.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {caseData.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the case "{caseData.title}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
