'use client';

import { useState } from 'react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Copy,
  Trash2, 
  MoreHorizontal,
  FileText,
  BookOpen,
  Download,
  Share,
  Star,
  Calendar,
  User,
  Filter,
} from 'lucide-react';
import { TEMPLATE_CATEGORIES } from '@/lib/constants';

// Mock template data
const mockTemplates = [
  {
    id: '1',
    name: 'Civil Case Petition Template',
    category: 'petition',
    type: 'civil-case',
    description: 'Standard template for filing civil case petitions in district courts',
    content: `BEFORE THE HON'BLE DISTRICT JUDGE
[COURT NAME]

Civil Suit No. _____ of 20__

Between:
[PLAINTIFF NAME]
S/o [FATHER NAME]
R/o [ADDRESS]
                                                    ...Plaintiff

Versus

[DEFENDANT NAME]
S/o [FATHER NAME]
R/o [ADDRESS]
                                                    ...Defendant

PETITION UNDER SECTION [SECTION] OF [ACT]

TO,
THE HON'BLE DISTRICT JUDGE,
[COURT NAME]

The humble petition of the Petitioner above named most respectfully showeth:

1. That [CASE DETAILS]

2. That [FACTS OF THE CASE]

PRAYER:
In the premises, it is most respectfully prayed that this Hon'ble Court may be pleased to:

a) [RELIEF SOUGHT]
b) [ADDITIONAL RELIEF]

And for such other relief as this Hon'ble Court may deem fit and proper in the circumstances of the case.

Date: [DATE]
Place: [PLACE]

                                                    [ADVOCATE NAME]
                                                    Advocate for Petitioner`,
    variables: [
      { name: 'COURT_NAME', label: 'Court Name', type: 'text', required: true },
      { name: 'PLAINTIFF_NAME', label: 'Plaintiff Name', type: 'text', required: true },
      { name: 'DEFENDANT_NAME', label: 'Defendant Name', type: 'text', required: true },
      { name: 'CASE_DETAILS', label: 'Case Details', type: 'textarea', required: true },
      { name: 'RELIEF_SOUGHT', label: 'Relief Sought', type: 'textarea', required: true }
    ],
    createdBy: 'Sarah Johnson',
    isActive: true,
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-12-01'),
    usageCount: 15
  },
  {
    id: '2',
    name: 'Commercial Contract Agreement',
    category: 'contract',
    type: 'commercial-contract',
    description: 'Template for commercial service agreements and contracts',
    content: `COMMERCIAL SERVICE AGREEMENT

This Agreement is entered into on [DATE] between:

PARTY A: [COMPANY_A_NAME]
Address: [COMPANY_A_ADDRESS]
("Service Provider")

PARTY B: [COMPANY_B_NAME]
Address: [COMPANY_B_ADDRESS]
("Client")

WHEREAS, the Service Provider agrees to provide [SERVICES] to the Client;

NOW, THEREFORE, the parties agree as follows:

1. SERVICES
The Service Provider shall provide [SERVICE_DESCRIPTION]

2. TERM
This Agreement shall commence on [START_DATE] and continue until [END_DATE]

3. COMPENSATION
The Client agrees to pay [AMOUNT] for the services rendered.

4. PAYMENT TERMS
Payment shall be made [PAYMENT_TERMS]

IN WITNESS WHEREOF, the parties have executed this Agreement.

[COMPANY_A_NAME]                    [COMPANY_B_NAME]

_________________                   _________________
Signature                          Signature

Date: [DATE]                       Date: [DATE]`,
    variables: [
      { name: 'COMPANY_A_NAME', label: 'Service Provider Name', type: 'text', required: true },
      { name: 'COMPANY_B_NAME', label: 'Client Name', type: 'text', required: true },
      { name: 'SERVICES', label: 'Services Description', type: 'textarea', required: true },
      { name: 'AMOUNT', label: 'Contract Amount', type: 'text', required: true },
      { name: 'START_DATE', label: 'Start Date', type: 'date', required: true },
      { name: 'END_DATE', label: 'End Date', type: 'date', required: true }
    ],
    createdBy: 'Michael Chen',
    isActive: true,
    createdAt: new Date('2024-10-15'),
    updatedAt: new Date('2024-11-20'),
    usageCount: 8
  },
  {
    id: '3',
    name: 'Legal Notice Template',
    category: 'notice',
    type: 'legal-notice',
    description: 'Standard legal notice template for various legal matters',
    content: `LEGAL NOTICE

TO: [RECIPIENT_NAME]
Address: [RECIPIENT_ADDRESS]

NOTICE UNDER SECTION [SECTION] OF [ACT]

Sir/Madam,

I, [SENDER_NAME], through my advocate [ADVOCATE_NAME], do hereby serve upon you this Legal Notice and state as under:

1. That [FACTS_OF_CASE]

2. That you are hereby called upon to [DEMAND]

3. That if you fail to comply with the above demand within [NOTICE_PERIOD] days from the receipt of this notice, my client shall be constrained to initiate appropriate legal proceedings against you.

TAKE NOTICE that if you fail to comply with the demand made herein above within the stipulated time, my client will be left with no alternative but to approach the competent Court of Law for appropriate relief.

Date: [DATE]
Place: [PLACE]

                                                    [ADVOCATE_NAME]
                                                    Advocate for [SENDER_NAME]`,
    variables: [
      { name: 'RECIPIENT_NAME', label: 'Recipient Name', type: 'text', required: true },
      { name: 'SENDER_NAME', label: 'Sender Name', type: 'text', required: true },
      { name: 'ADVOCATE_NAME', label: 'Advocate Name', type: 'text', required: true },
      { name: 'FACTS_OF_CASE', label: 'Facts of Case', type: 'textarea', required: true },
      { name: 'DEMAND', label: 'Demand/Relief', type: 'textarea', required: true },
      { name: 'NOTICE_PERIOD', label: 'Notice Period (days)', type: 'number', required: true }
    ],
    createdBy: 'Sarah Johnson',
    isActive: true,
    createdAt: new Date('2024-09-20'),
    updatedAt: new Date('2024-11-15'),
    usageCount: 22
  }
];

export default function TemplatesPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);

  if (!user) return null;

  const filteredTemplates = mockTemplates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.createdBy.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'contract': return 'bg-blue-100 text-blue-800';
      case 'notice': return 'bg-orange-100 text-orange-800';
      case 'petition': return 'bg-green-100 text-green-800';
      case 'application': return 'bg-purple-100 text-purple-800';
      case 'agreement': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const canCreateTemplate = ['admin', 'lawyer'].includes(user.role);
  const canEditTemplate = ['admin', 'lawyer'].includes(user.role);
  const canDeleteTemplate = user.role === 'admin';

  return (
    <MainLayout title="Templates">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Document Templates</h2>
            <p className="text-gray-600">Create and manage legal document templates</p>
          </div>
          {canCreateTemplate && (
            <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Template
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Template</DialogTitle>
                  <DialogDescription>
                    Create a new document template with dynamic variables
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input id="name" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Category
                    </Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEMPLATE_CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea id="description" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="content" className="text-right">
                      Content
                    </Label>
                    <Textarea 
                      id="content" 
                      className="col-span-3 min-h-[200px]" 
                      placeholder="Enter template content with variables like [VARIABLE_NAME]"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsTemplateDialogOpen(false)}>
                    Create Template
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {TEMPLATE_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Template Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Templates</p>
                  <p className="text-2xl font-bold text-gray-900">{mockTemplates.length}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Templates</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockTemplates.filter(t => t.isActive).length}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Most Used</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.max(...mockTemplates.map(t => t.usageCount))}
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-full">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Usage</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockTemplates.reduce((total, t) => total + t.usageCount, 0)}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-full">
                  <Copy className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="mt-2">{template.description}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setSelectedTemplate(template);
                        setIsPreviewDialogOpen(true);
                      }}>
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="mr-2 h-4 w-4" />
                        Use Template
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </DropdownMenuItem>
                      {canEditTemplate && (
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        <Share className="mr-2 h-4 w-4" />
                        Share
                      </DropdownMenuItem>
                      {canDeleteTemplate && (
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className={getCategoryColor(template.category)}>
                      {TEMPLATE_CATEGORIES.find(c => c.value === template.category)?.label}
                    </Badge>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Star className="h-3 w-3" />
                      <span>{template.usageCount} uses</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center space-x-1 mb-1">
                      <User className="h-3 w-3" />
                      <span>Created by {template.createdBy}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Updated {formatDate(template.updatedAt)}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setIsPreviewDialogOpen(true);
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Copy className="mr-2 h-4 w-4" />
                      Use
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Preview Dialog */}
        <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>{selectedTemplate?.name}</DialogTitle>
              <DialogDescription>
                Template preview with variable placeholders
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[60vh]">
              <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg">
                {selectedTemplate?.content}
              </pre>
            </div>
            <div className="flex justify-between">
              <div className="text-sm text-gray-600">
                Variables: {selectedTemplate?.variables.length || 0}
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
                  Close
                </Button>
                <Button>
                  <Copy className="mr-2 h-4 w-4" />
                  Use Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}