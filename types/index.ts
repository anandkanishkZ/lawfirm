export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'lawyer' | 'staff' | 'client';
  avatar?: string;
  createdAt: Date;
}

export interface Case {
  id: string;
  title: string;
  caseNumber: string;
  type: 'civil' | 'criminal' | 'property' | 'commercial' | 'family' | 'corporate';
  status: 'active' | 'pending' | 'closed' | 'on-hold';
  clientId: string;
  clientName: string;
  assignedLawyer: string;
  court: string;
  filingDate: Date;
  nextHearing?: Date;
  description: string;
  documents: Document[];
  parties: {
    plaintiff: string[];
    defendant: string[];
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  caseId?: string;
  clientId?: string;
}

export interface Hearing {
  id: string;
  caseId: string;
  caseTitle: string;
  date: Date;
  time: string;
  court: string;
  judge: string;
  type: 'hearing' | 'judgment' | 'evidence' | 'argument';
  notes?: string;
  status: 'scheduled' | 'completed' | 'postponed' | 'cancelled';
  reminders: boolean;
  assignedLawyer: string;
  createdAt: Date;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  panNumber?: string;
  aadharNumber?: string;
  gstNumber?: string;
  companyName?: string;
  type: 'individual' | 'company';
  kycStatus: 'pending' | 'verified' | 'rejected';
  kycDocuments: Document[];
  cases: string[];
  assignedLawyer: string;
  createdAt: Date;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  caseId: string;
  caseTitle: string;
  amount: number;
  dueDate: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  taxAmount: number;
  totalAmount: number;
  createdAt: Date;
  paidAt?: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  dueDate: Date;
  caseId?: string;
  clientId?: string;
  tags: string[];
  createdAt: Date;
  completedAt?: Date;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  type: 'hearing' | 'meeting' | 'deadline' | 'task' | 'holiday';
  description?: string;
  relatedTo?: {
    type: 'case' | 'client' | 'task';
    id: string;
    name: string;
  };
  attendees?: string[];
  location?: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'hearing' | 'task' | 'payment' | 'case' | 'system';
  isRead: boolean;
  relatedTo?: {
    type: 'case' | 'client' | 'task' | 'hearing' | 'invoice';
    id: string;
  };
  createdAt: Date;
}

export interface Template {
  id: string;
  name: string;
  category: 'contract' | 'notice' | 'petition' | 'application' | 'agreement';
  type: 'company-registration' | 'civil-case' | 'criminal-case' | 'property-dispute' | 'commercial-contract';
  content: string;
  variables: TemplateVariable[];
  createdBy: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVariable {
  name: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'select' | 'textarea';
  required: boolean;
  options?: string[];
  defaultValue?: string;
}

export interface DashboardStats {
  totalCases: number;
  activeCases: number;
  hearingsToday: number;
  upcomingHearings: number;
  pendingTasks: number;
  totalClients: number;
  pendingPayments: number;
  totalRevenue: number;
  recentCases: Case[];
  upcomingEvents: CalendarEvent[];
  recentNotifications: Notification[];
}