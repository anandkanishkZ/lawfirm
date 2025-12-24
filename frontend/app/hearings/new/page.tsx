'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { ArrowLeft, Calendar, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createHearing, CreateHearingData } from '@/lib/api/hearings';
import { getAllCases, Case } from '@/lib/api/cases';
import { toast } from '@/hooks/use-toast';
import { HEARING_TYPES } from '@/lib/constants';

interface CaseOption {
  id: string;
  caseNumber: string;
  title: string;
}

export default function NewHearingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cases, setCases] = useState<CaseOption[]>([]);
  const [loadingCases, setLoadingCases] = useState(true);

  const [formData, setFormData] = useState<CreateHearingData>({
    caseId: '',
    title: '',
    type: 'PRELIMINARY',
    hearingDate: '',
    startTime: '',
    endTime: '',
    court: '',
    courtroom: '',
    judge: '',
    notes: '',
  });

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setLoadingCases(true);
      const response = await getAllCases({ page: 1, limit: 1000 });
      setCases(
        response.cases.map((c: Case) => ({
          id: c.id,
          caseNumber: c.caseNumber,
          title: c.title,
        }))
      );
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch cases',
        variant: 'destructive',
      });
    } finally {
      setLoadingCases(false);
    }
  };

  if (!user) return null;

  const handleChange = (field: keyof CreateHearingData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.caseId || !formData.title || !formData.hearingDate || !formData.startTime || !formData.court) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields (Case, Title, Date, Start Time, Court)',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      console.log('📤 Form data being sent:', formData);
      await createHearing(formData);
      toast({
        title: 'Success',
        description: 'Hearing scheduled successfully',
      });
      router.push('/hearings');
    } catch (error: any) {
      console.error('❌ Error creating hearing:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create hearing',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/hearings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Schedule New Hearing</h2>
            <p className="text-gray-600">Create a new court hearing entry</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Hearing Details</CardTitle>
            <CardDescription>Enter the details for the new hearing</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Case Selection */}
              <div className="space-y-2">
                <Label htmlFor="caseId">
                  Case <span className="text-red-500">*</span>
                </Label>
                {loadingCases ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading cases...
                  </div>
                ) : (
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
                )}
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

              {/* Type */}
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
                  rows={4}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4">
                <Button type="submit" disabled={loading || loadingCases}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Hearing
                </Button>
                <Link href="/hearings">
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
