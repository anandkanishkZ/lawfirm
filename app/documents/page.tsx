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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Upload, 
  Search, 
  Download, 
  Eye, 
  Trash2, 
  MoreHorizontal,
  FileText,
  File,
  Image,
  Archive,
  Calendar,
  User,
  Briefcase,
  Filter,
  FolderOpen,
  Share,
} from 'lucide-react';
import { DOCUMENT_TYPES } from '@/lib/constants';

// Mock document data
const mockDocuments = [
  {
    id: '1',
    name: 'Property Survey Report.pdf',
    type: 'PDF',
    size: 2048576, // 2MB
    uploadedBy: 'Sarah Johnson',
    uploadedAt: new Date('2024-12-01'),
    caseId: '1',
    caseName: 'Smith vs. Johnson Property Dispute',
    category: 'Evidence',
    url: '#'
  },
  {
    id: '2',
    name: 'Contract Agreement.docx',
    type: 'DOCX',
    size: 1024000, // 1MB
    uploadedBy: 'Michael Chen',
    uploadedAt: new Date('2024-12-05'),
    caseId: '2',
    caseName: 'TechCorp Commercial Contract Review',
    category: 'Contract',
    url: '#'
  },
  {
    id: '3',
    name: 'Client KYC Documents.zip',
    type: 'ZIP',
    size: 5242880, // 5MB
    uploadedBy: 'Staff Member',
    uploadedAt: new Date('2024-12-03'),
    clientId: '1',
    clientName: 'John Smith',
    category: 'KYC',
    url: '#'
  },
  {
    id: '4',
    name: 'Court Notice.pdf',
    type: 'PDF',
    size: 512000, // 512KB
    uploadedBy: 'Sarah Johnson',
    uploadedAt: new Date('2024-12-10'),
    caseId: '1',
    caseName: 'Smith vs. Johnson Property Dispute',
    category: 'Court Documents',
    url: '#'
  },
  {
    id: '5',
    name: 'Evidence Photos.zip',
    type: 'ZIP',
    size: 10485760, // 10MB
    uploadedBy: 'Michael Chen',
    uploadedAt: new Date('2024-12-08'),
    caseId: '3',
    caseName: 'Wilson Family Custody Case',
    category: 'Evidence',
    url: '#'
  }
];

export default function DocumentsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  if (!user) return null;

  const filteredDocuments = mockDocuments.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (doc.caseName && doc.caseName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (doc.clientName && doc.clientName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return <FileText className="h-5 w-5 text-red-600" />;
      case 'doc':
      case 'docx': return <FileText className="h-5 w-5 text-blue-600" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return <Image className="h-5 w-5 text-green-600" />;
      case 'zip':
      case 'rar': return <Archive className="h-5 w-5 text-purple-600" />;
      default: return <File className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const canUploadDocument = ['admin', 'lawyer', 'staff'].includes(user.role);
  const canDeleteDocument = ['admin', 'lawyer'].includes(user.role);

  const categories = ['Evidence', 'Contract', 'KYC', 'Court Documents', 'Legal Notice', 'Agreement'];

  return (
    <MainLayout title="Documents">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
            <p className="text-gray-600">Manage and organize all case-related documents</p>
          </div>
          {canUploadDocument && (
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Upload Document</DialogTitle>
                  <DialogDescription>
                    Upload a new document to the system
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="file" className="text-right">
                      File
                    </Label>
                    <Input id="file" type="file" className="col-span-3" />
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
                        {categories.map((category) => (
                          <SelectItem key={category} value={category.toLowerCase()}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="case" className="text-right">
                      Related Case
                    </Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select case (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Smith vs. Johnson Property Dispute</SelectItem>
                        <SelectItem value="2">TechCorp Commercial Contract Review</SelectItem>
                        <SelectItem value="3">Wilson Family Custody Case</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsUploadDialogOpen(false)}>
                    Upload
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All File Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All File Types</SelectItem>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Document Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Documents</p>
                  <p className="text-2xl font-bold text-gray-900">{mockDocuments.length}</p>
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
                  <p className="text-sm font-medium text-gray-600">PDF Documents</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockDocuments.filter(d => d.type === 'PDF').length}
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-full">
                  <FileText className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Evidence Files</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockDocuments.filter(d => d.category === 'Evidence').length}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <FolderOpen className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Size</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatFileSize(mockDocuments.reduce((total, doc) => total + doc.size, 0))}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-full">
                  <Archive className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filteredDocuments.length} {filteredDocuments.length === 1 ? 'Document' : 'Documents'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Related To</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {getFileIcon(document.type)}
                          <div>
                            <div className="font-medium text-gray-900">{document.name}</div>
                            <Badge variant="outline" className="mt-1">
                              {document.type}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{document.category}</Badge>
                      </TableCell>
                      <TableCell>
                        {document.caseId ? (
                          <div className="flex items-center space-x-1">
                            <Briefcase className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{document.caseName}</span>
                          </div>
                        ) : document.clientId ? (
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{document.clientName}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">General</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{document.uploadedBy}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {formatFileSize(document.size)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(document.uploadedAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share className="mr-2 h-4 w-4" />
                              Share
                            </DropdownMenuItem>
                            {canDeleteDocument && (
                              <DropdownMenuItem className="text-red-600">
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