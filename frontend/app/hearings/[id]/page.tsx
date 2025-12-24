'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Calendar, Clock, MapPin, User, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getHearingById, deleteHearing, Hearing } from '@/lib/api/hearings';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'SCHEDULED':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'POSTPONED':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'PRELIMINARY':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'EVIDENCE':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
    case 'ARGUMENTS':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'FINAL':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'INTERIM':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'URGENT':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  }
};

export default function HearingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [hearing, setHearing] = useState<Hearing | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const hearingId = params.id as string;

  useEffect(() => {
    if (hearingId) {
      fetchHearing();
    }
  }, [hearingId]);

  const fetchHearing = async () => {
    try {
      setLoading(true);
      const data = await getHearingById(hearingId);
      setHearing(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch hearing details',
        variant: 'destructive',
      });
      router.push('/hearings');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this hearing?')) return;

    try {
      setDeleting(true);
      await deleteHearing(hearingId);
      toast({
        title: 'Success',
        description: 'Hearing deleted successfully',
      });
      router.push('/hearings');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete hearing',
        variant: 'destructive',
      });
      setDeleting(false);
    }
  };

  const canEdit = user.role === 'admin' || user.role === 'lawyer';
  const canDelete = user.role === 'admin';

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </MainLayout>
    );
  }

  if (!hearing) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Hearing not found</h3>
          <Link href="/hearings">
            <Button className="mt-4">Back to Hearings</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/hearings">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{hearing.title}</h2>
              <p className="text-gray-600">{hearing.caseName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && (
              <Link href={`/hearings/${hearingId}/edit`}>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
            )}
            {canDelete && (
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete
              </Button>
            )}
          </div>
        </div>

        {/* Hearing Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hearing Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Badge className={getStatusColor(hearing.status)}>{hearing.status}</Badge>
                  <Badge className={getTypeColor(hearing.type)}>{hearing.type}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Hearing Date</p>
                      <p className="text-base font-medium text-gray-900">
                        {format(new Date(hearing.hearingDate), 'MMMM dd, yyyy')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Time</p>
                      <p className="text-base font-medium text-gray-900">
                        {hearing.startTime}
                        {hearing.endTime && ` - ${hearing.endTime}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Court</p>
                      <p className="text-base font-medium text-gray-900">{hearing.court}</p>
                      {hearing.courtroom && (
                        <p className="text-sm text-gray-600">{hearing.courtroom}</p>
                      )}
                    </div>
                  </div>

                  {hearing.judge && (
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Judge</p>
                        <p className="text-base font-medium text-gray-900">{hearing.judge}</p>
                      </div>
                    </div>
                  )}
                </div>

                {hearing.notes && (
                  <div className="pt-4 border-t">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 mb-1">Notes</p>
                        <p className="text-base text-gray-900 whitespace-pre-wrap">{hearing.notes}</p>
                      </div>
                    </div>
                  </div>
                )}

                {hearing.outcome && (
                  <div className="pt-4 border-t">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 mb-1">Outcome</p>
                        <p className="text-base text-gray-900 whitespace-pre-wrap">{hearing.outcome}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Case Information */}
            {hearing.case && (
              <Card>
                <CardHeader>
                  <CardTitle>Case Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Case Number</p>
                    <p className="text-base font-medium text-gray-900">{hearing.case.caseNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Case Title</p>
                    <p className="text-base font-medium text-gray-900">{hearing.case.title}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <Badge>{hearing.case.status}</Badge>
                  </div>
                  <Link href={`/cases/${hearing.case.id}`}>
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      View Case Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Lawyer Information */}
            {hearing.lawyer && (
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Lawyer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{hearing.lawyer.name}</p>
                      <p className="text-sm text-gray-600">{hearing.lawyer.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-gray-500">Created At</p>
                  <p className="text-gray-900">
                    {format(new Date(hearing.createdAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Last Updated</p>
                  <p className="text-gray-900">
                    {format(new Date(hearing.updatedAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                {hearing.nextHearingDate && (
                  <div>
                    <p className="font-medium text-gray-500">Next Hearing</p>
                    <p className="text-gray-900">
                      {format(new Date(hearing.nextHearingDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
