'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getHearingById, updateHearing, UpdateHearingData } from '@/lib/api/hearings';
import { getAllCases, Case } from '@/lib/api/cases';
import { toast } from '@/hooks/use-toast';
import { HEARING_TYPES } from '@/lib/constants';

interface CaseOption {
  id: string;
  caseNumber: string;
  title: string;
}

const HEARING_STATUSES = [
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'POSTPONED', label: 'Postponed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function EditHearingPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [cases, setCases] = useState<CaseOption[]>([]);

  const hearingId = params.id as string;

  const [formData, setFormData] = useState<UpdateHearingData>({
    caseId: '',
    title: '',
    type: 'PRELIMINARY',
    status: 'SCHEDULED',
    hearingDate: '',
    startTime: '',
    endTime: '',
    court: '',
    courtroom: '',
    judge: '',
    notes: '',
    outcome: '',
    nextHearingDate: '',
  });

  useEffect(() => {
    fetchData();
  }, [hearingId]);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [hearingData, casesResponse] = await Promise.all([
        getHearingById(hearingId),
        getAllCases({ page: 1, limit: 1000 }),
      ]);

      setCases(
        casesResponse.cases.map((c: Case) => ({
          id: c.id,
          caseNumber: c.caseNumber,
          title: c.title,
        }))
      );

      // Format dates for input fields
      const hearingDate = hearingData.hearingDate ? new Date(hearingData.hearingDate).toISOString().split('T')[0] : '';
      const nextHearingDate = hearingData.nextHearingDate ? new Date(hearingData.nextHearingDate).toISOString().split('T')[0] : '';

      setFormData({
        caseId: hearingData.caseId,
        title: hearingData.title,
        type: hearingData.type,
        status: hearingData.status,
        hearingDate,
        startTime: hearingData.startTime || '',
        endTime: hearingData.endTime || '',
        court: hearingData.court,
        courtroom: hearingData.courtroom || '',
        judge: hearingData.judge || '',
        notes: hearingData.notes || '',
        outcome: hearingData.outcome || '',
        nextHearingDate,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch hearing data',
        variant: 'destructive',
      });
      router.push('/hearings');
    } finally {
      setLoadingData(false);
    }
  };

  if (!user) return null;

  const handleChange = (field: keyof UpdateHearingData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.hearingDate || !formData.startTime || !formData.court) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields (Title, Date, Start Time, Court)',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await updateHearing(hearingId, formData);
      toast({
        title: 'Success',
        description: 'Hearing updated successfully',
      });
      router.push(`/hearings/${hearingId}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update hearing',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/hearings/${hearingId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Hearing</h2>
            <p className="text-gray-600">Update hearing details</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Hearing Details</CardTitle>
            <CardDescription>Modify the hearing information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Case Selection */}
              <div className="space-y-2">
                <Label htmlFor="caseId">
                  Case <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.caseId} onValueChange={(value) => handleChange('caseId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a case" />
                  </SelectTrigger>
                  <SelectContent>
                    {cases.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.caseNumber} - {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Hearing Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g., Initial Hearing, Evidence Presentation"
                  required
                />
              </div>

              {/* Type and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Hearing Type</Label>
                  <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HEARING_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HEARING_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hearingDate">
                    Hearing Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="hearingDate"
                    type="date"
                    value={typeof formData.hearingDate === 'string' ? formData.hearingDate : ''}
                    onChange={(e) => handleChange('hearingDate', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime">
                    Start Time <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleChange('startTime', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleChange('endTime', e.target.value)}
                  />
                </div>
              </div>

              {/* Court Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="court">
                    Court <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="court"
                    value={formData.court}
                    onChange={(e) => handleChange('court', e.target.value)}
                    placeholder="e.g., Supreme Court, District Court"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="courtroom">Courtroom</Label>
                  <Input
                    id="courtroom"
                    value={formData.courtroom}
                    onChange={(e) => handleChange('courtroom', e.target.value)}
                    placeholder="e.g., Room 101, Court 3"
                  />
                </div>
              </div>

              {/* Judge */}
              <div className="space-y-2">
                <Label htmlFor="judge">Judge</Label>
                <Input
                  id="judge"
                  value={formData.judge}
                  onChange={(e) => handleChange('judge', e.target.value)}
                  placeholder="e.g., Hon. Justice Smith"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Additional notes or instructions..."
                  rows={3}
                />
              </div>

              {/* Outcome (if completed) */}
              {formData.status === 'COMPLETED' && (
                <div className="space-y-2">
                  <Label htmlFor="outcome">Outcome</Label>
                  <Textarea
                    id="outcome"
                    value={formData.outcome}
                    onChange={(e) => handleChange('outcome', e.target.value)}
                    placeholder="Describe the outcome of the hearing..."
                    rows={3}
                  />
                </div>
              )}

              {/* Next Hearing Date (if postponed) */}
              {formData.status === 'POSTPONED' && (
                <div className="space-y-2">
                  <Label htmlFor="nextHearingDate">Next Hearing Date</Label>
                  <Input
                    id="nextHearingDate"
                    type="date"
                    value={typeof formData.nextHearingDate === 'string' ? formData.nextHearingDate : ''}
                    onChange={(e) => handleChange('nextHearingDate', e.target.value)}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
                <Link href={`/hearings/${hearingId}`}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
