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
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { getCaseById, updateCase, UpdateCaseData, Case } from '@/lib/api/cases';
import { getAllClients } from '@/lib/api/clients';
import { getUsers } from '@/lib/api/users';
import { CASE_STATUS, CASE_TYPES, PRIORITY_LEVELS } from '@/lib/constants';
import Link from 'next/link';

interface Client {
  id: string;
  clientId: string;
  name: string;
  phone: string;
}

interface Lawyer {
  id: string;
  name: string;
  email: string;
}

export default function EditCasePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const caseId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [originalCase, setOriginalCase] = useState<Case | null>(null);
  
  const [formData, setFormData] = useState<UpdateCaseData>({
    title: '',
    type: 'CIVIL',
    status: 'PENDING',
    clientId: '',
    assignedLawyerId: '',
    court: '',
    filingDate: '',
    nextHearing: '',
    description: '',
    plaintiff: [],
    defendant: [],
    priority: 'MEDIUM',
    tags: [],
  });

  const [plaintiffInput, setPlaintiffInput] = useState('');
  const [defendantInput, setDefendantInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (!user || !caseId) return;

    const fetchData = async () => {
      try {
        setLoadingData(true);
        
        // Fetch case details, clients, and lawyers
        const [caseResponse, clientsData, usersData] = await Promise.all([
          getCaseById(caseId),
          getAllClients({ limit: 1000, isActive: true }),
          getUsers({ role: 'LAWYER', limit: 1000, isActive: 'true' }),
        ]);

        const caseData = caseResponse.case;
        setOriginalCase(caseData);

        setClients(clientsData.clients.map(c => ({
          id: c.id,
          clientId: c.clientId,
          name: c.name,
          phone: c.phone,
        })));

        setLawyers(usersData.users.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
        })));

        // Populate form with existing data
        setFormData({
          title: caseData.title,
          type: caseData.type,
          status: caseData.status,
          clientId: caseData.clientId,
          assignedLawyerId: caseData.assignedLawyerId || '',
          court: caseData.court,
          filingDate: caseData.filingDate.split('T')[0],
          nextHearing: caseData.nextHearing ? caseData.nextHearing.split('T')[0] : '',
          description: caseData.description || '',
          plaintiff: caseData.plaintiff || [],
          defendant: caseData.defendant || [],
          priority: caseData.priority,
          tags: caseData.tags || [],
        });
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Failed to load case data',
        });
        router.push('/cases');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [user, caseId, toast, router]);

  const handleChange = (field: keyof UpdateCaseData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addPlaintiff = () => {
    if (plaintiffInput.trim()) {
      setFormData(prev => ({
        ...prev,
        plaintiff: [...(prev.plaintiff || []), plaintiffInput.trim()],
      }));
      setPlaintiffInput('');
    }
  };

  const removePlaintiff = (index: number) => {
    setFormData(prev => ({
      ...prev,
      plaintiff: prev.plaintiff?.filter((_, i) => i !== index) || [],
    }));
  };

  const addDefendant = () => {
    if (defendantInput.trim()) {
      setFormData(prev => ({
        ...prev,
        defendant: [...(prev.defendant || []), defendantInput.trim()],
      }));
      setDefendantInput('');
    }
  };

  const removeDefendant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      defendant: prev.defendant?.filter((_, i) => i !== index) || [],
    }));
  };

  const addTag = () => {
    if (tagInput.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.clientId || !formData.court || !formData.filingDate) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in all required fields',
      });
      return;
    }

    try {
      setLoading(true);

      // Prepare data for submission
      const submitData: UpdateCaseData = {
        ...formData,
        assignedLawyerId: formData.assignedLawyerId || undefined,
        nextHearing: formData.nextHearing || undefined,
        description: formData.description || undefined,
      };

      await updateCase(caseId, submitData);

      toast({
        title: 'Success',
        description: 'Case updated successfully',
      });

      router.push(`/cases/${caseId}`);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update case',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  if (loadingData) {
    return (
      <MainLayout title="Edit Case">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </MainLayout>
    );
  }

  if (!originalCase) return null;

  return (
    <MainLayout title="Edit Case">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/cases/${caseId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Case
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Case</h2>
            <p className="text-gray-600">{originalCase.caseNumber}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Case Information</CardTitle>
              <CardDescription>Update the case details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Case Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Enter case title"
                  required
                />
              </div>

              {/* Type and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Case Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => handleChange('type', value)}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CASE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value.toUpperCase()}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleChange('status', value)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CASE_STATUS.map((status) => (
                        <SelectItem key={status.value} value={status.value.toUpperCase().replace('-', '_')}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Client and Lawyer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientId">
                    Client <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={formData.clientId} 
                    onValueChange={(value) => handleChange('clientId', value)}
                  >
                    <SelectTrigger id="clientId">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name} ({client.clientId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignedLawyerId">Assigned Lawyer</Label>
                  <Select 
                    value={formData.assignedLawyerId || 'NONE'} 
                    onValueChange={(value) => handleChange('assignedLawyerId', value === 'NONE' ? '' : value)}
                  >
                    <SelectTrigger id="assignedLawyerId">
                      <SelectValue placeholder="Select lawyer (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">No Assignment</SelectItem>
                      {lawyers.map((lawyer) => (
                        <SelectItem key={lawyer.id} value={lawyer.id}>
                          {lawyer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Court */}
              <div className="space-y-2">
                <Label htmlFor="court">
                  Court <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="court"
                  value={formData.court}
                  onChange={(e) => handleChange('court', e.target.value)}
                  placeholder="e.g., Supreme Court of India, Delhi High Court"
                  required
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="filingDate">
                    Filing Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="filingDate"
                    type="date"
                    value={(formData.filingDate as string) || ''}
                    onChange={(e) => handleChange('filingDate', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nextHearing">Next Hearing Date</Label>
                  <Input
                    id="nextHearing"
                    type="date"
                    value={(formData.nextHearing as string) || ''}
                    onChange={(e) => handleChange('nextHearing', e.target.value)}
                  />
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority">Priority Level</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => handleChange('priority', value)}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_LEVELS.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value.toUpperCase()}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Enter case description and details"
                  rows={4}
                />
              </div>

              {/* Plaintiff */}
              <div className="space-y-2">
                <Label>Plaintiff(s)</Label>
                <div className="flex gap-2">
                  <Input
                    value={plaintiffInput}
                    onChange={(e) => setPlaintiffInput(e.target.value)}
                    placeholder="Enter plaintiff name"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPlaintiff())}
                  />
                  <Button type="button" onClick={addPlaintiff} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.plaintiff && formData.plaintiff.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.plaintiff.map((p, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        <span>{p}</span>
                        <button
                          type="button"
                          onClick={() => removePlaintiff(index)}
                          className="hover:bg-blue-200 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Defendant */}
              <div className="space-y-2">
                <Label>Defendant(s)</Label>
                <div className="flex gap-2">
                  <Input
                    value={defendantInput}
                    onChange={(e) => setDefendantInput(e.target.value)}
                    placeholder="Enter defendant name"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDefendant())}
                  />
                  <Button type="button" onClick={addDefendant} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.defendant && formData.defendant.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.defendant.map((d, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm"
                      >
                        <span>{d}</span>
                        <button
                          type="button"
                          onClick={() => removeDefendant(index)}
                          className="hover:bg-red-200 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Enter tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="hover:bg-gray-200 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-4">
                <Link href={`/cases/${caseId}`}>
                  <Button type="button" variant="outline" disabled={loading}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Case'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </MainLayout>
  );
}
