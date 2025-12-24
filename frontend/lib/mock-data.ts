import { Case, Client, Hearing, Invoice, Task, CalendarEvent, Notification, DashboardStats } from '@/types';

export const mockCases: Case[] = [
  {
    id: '1',
    title: 'Smith vs. Johnson Property Dispute',
    caseNumber: 'CS/2024/001',
    type: 'property',
    status: 'active',
    clientId: '1',
    clientName: 'John Smith',
    assignedLawyer: 'Sarah Johnson',
    court: 'District Court - Central Delhi',
    filingDate: new Date('2024-01-15'),
    nextHearing: new Date('2025-01-20'),
    description: 'Property boundary dispute regarding residential plot in Sector 15, Gurgaon',
    documents: [],
    parties: {
      plaintiff: ['John Smith'],
      defendant: ['Robert Johnson', 'Johnson Real Estate Ltd.']
    },
    priority: 'high',
    tags: ['property', 'boundary', 'residential'],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-12-15')
  },
  {
    id: '2',
    title: 'TechCorp Commercial Contract Review',
    caseNumber: 'CS/2024/002',
    type: 'commercial',
    status: 'active',
    clientId: '2',
    clientName: 'TechCorp Industries',
    assignedLawyer: 'Sarah Johnson',
    court: 'Commercial Court',
    filingDate: new Date('2024-02-01'),
    nextHearing: new Date('2025-01-25'),
    description: 'Review and negotiation of software licensing agreement',
    documents: [],
    parties: {
      plaintiff: ['TechCorp Industries'],
      defendant: ['GlobalSoft Solutions']
    },
    priority: 'medium',
    tags: ['commercial', 'contract', 'software'],
    createdAt: new Date('2024-01-28'),
    updatedAt: new Date('2024-12-10')
  },
  {
    id: '3',
    title: 'Wilson Family Custody Case',
    caseNumber: 'CS/2024/003',
    type: 'family',
    status: 'pending',
    clientId: '3',
    clientName: 'Emma Wilson',
    assignedLawyer: 'Michael Chen',
    court: 'Family Court',
    filingDate: new Date('2024-03-01'),
    nextHearing: new Date('2025-01-18'),
    description: 'Child custody and support case',
    documents: [],
    parties: {
      plaintiff: ['Emma Wilson'],
      defendant: ['David Wilson']
    },
    priority: 'high',
    tags: ['family', 'custody', 'support'],
    createdAt: new Date('2024-02-25'),
    updatedAt: new Date('2024-12-12')
  }
];

export const mockClients: Client[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+91-9876543210',
    address: '123 Main Street, Gurgaon, Haryana 122001',
    panNumber: 'ABCDE1234F',
    aadharNumber: '1234-5678-9012',
    type: 'individual',
    kycStatus: 'verified',
    kycDocuments: [],
    cases: ['1'],
    assignedLawyer: 'Sarah Johnson',
    createdAt: new Date('2024-01-05')
  },
  {
    id: '2',
    name: 'TechCorp Industries',
    email: 'legal@techcorp.com',
    phone: '+91-9876543211',
    address: '456 Business Park, Mumbai, Maharashtra 400001',
    panNumber: 'ABCDE1234G',
    gstNumber: '29ABCDE1234F1Z5',
    companyName: 'TechCorp Industries Pvt. Ltd.',
    type: 'company',
    kycStatus: 'verified',
    kycDocuments: [],
    cases: ['2'],
    assignedLawyer: 'Sarah Johnson',
    createdAt: new Date('2024-01-20')
  },
  {
    id: '3',
    name: 'Emma Wilson',
    email: 'emma.wilson@email.com',
    phone: '+91-9876543212',
    address: '789 Residential Colony, Delhi 110001',
    panNumber: 'ABCDE1234H',
    aadharNumber: '1234-5678-9013',
    type: 'individual',
    kycStatus: 'pending',
    kycDocuments: [],
    cases: ['3'],
    assignedLawyer: 'Michael Chen',
    createdAt: new Date('2024-02-15')
  }
];

export const mockHearings: Hearing[] = [
  {
    id: '1',
    caseId: '1',
    caseTitle: 'Smith vs. Johnson Property Dispute',
    date: new Date('2025-01-20'),
    time: '10:30 AM',
    court: 'District Court - Central Delhi',
    judge: 'Justice Sharma',
    type: 'hearing',
    status: 'scheduled',
    reminders: true,
    assignedLawyer: 'Sarah Johnson',
    notes: 'Prepare property documents and boundary survey report',
    createdAt: new Date('2024-12-01')
  },
  {
    id: '2',
    caseId: '2',
    caseTitle: 'TechCorp Commercial Contract Review',
    date: new Date('2025-01-25'),
    time: '2:00 PM',
    court: 'Commercial Court',
    judge: 'Justice Patel',
    type: 'hearing',
    status: 'scheduled',
    reminders: true,
    assignedLawyer: 'Sarah Johnson',
    notes: 'Review revised contract terms',
    createdAt: new Date('2024-12-05')
  },
  {
    id: '3',
    caseId: '3',
    caseTitle: 'Wilson Family Custody Case',
    date: new Date('2025-01-18'),
    time: '11:00 AM',
    court: 'Family Court',
    judge: 'Justice Kumar',
    type: 'hearing',
    status: 'scheduled',
    reminders: true,
    assignedLawyer: 'Michael Chen',
    notes: 'Mediation session scheduled',
    createdAt: new Date('2024-12-03')
  }
];

export const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    clientId: '1',
    clientName: 'John Smith',
    caseId: '1',
    caseTitle: 'Smith vs. Johnson Property Dispute',
    amount: 25000,
    dueDate: new Date('2025-01-31'),
    status: 'sent',
    items: [
      {
        id: '1',
        description: 'Legal consultation and case preparation',
        quantity: 1,
        rate: 20000,
        amount: 20000
      },
      {
        id: '2',
        description: 'Document review and filing',
        quantity: 1,
        rate: 5000,
        amount: 5000
      }
    ],
    taxAmount: 4500,
    totalAmount: 29500,
    createdAt: new Date('2024-12-01')
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    clientId: '2',
    clientName: 'TechCorp Industries',
    caseId: '2',
    caseTitle: 'TechCorp Commercial Contract Review',
    amount: 50000,
    dueDate: new Date('2025-02-15'),
    status: 'draft',
    items: [
      {
        id: '1',
        description: 'Contract review and negotiation',
        quantity: 1,
        rate: 50000,
        amount: 50000
      }
    ],
    taxAmount: 9000,
    totalAmount: 59000,
    createdAt: new Date('2024-12-10')
  }
];

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Prepare property survey report',
    description: 'Collect and organize property survey documents for Smith vs. Johnson case',
    assignedTo: 'staff-1',
    assignedBy: 'Sarah Johnson',
    priority: 'high',
    status: 'in-progress',
    dueDate: new Date('2025-01-18'),
    caseId: '1',
    tags: ['property', 'survey', 'documents'],
    createdAt: new Date('2024-12-01')
  },
  {
    id: '2',
    title: 'Review contract amendments',
    description: 'Review and analyze proposed amendments to TechCorp licensing agreement',
    assignedTo: 'Sarah Johnson',
    assignedBy: 'Admin User',
    priority: 'medium',
    status: 'pending',
    dueDate: new Date('2025-01-22'),
    caseId: '2',
    tags: ['contract', 'review', 'commercial'],
    createdAt: new Date('2024-12-05')
  },
  {
    id: '3',
    title: 'Prepare custody evaluation report',
    description: 'Compile child custody evaluation documents for Wilson family case',
    assignedTo: 'Michael Chen',
    assignedBy: 'Admin User',
    priority: 'high',
    status: 'pending',
    dueDate: new Date('2025-01-16'),
    caseId: '3',
    tags: ['family', 'custody', 'evaluation'],
    createdAt: new Date('2024-12-03')
  }
];

export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Smith vs. Johnson - Property Hearing',
    date: new Date('2025-01-20'),
    time: '10:30 AM',
    type: 'hearing',
    description: 'Property boundary dispute hearing',
    relatedTo: {
      type: 'case',
      id: '1',
      name: 'Smith vs. Johnson Property Dispute'
    },
    attendees: ['Sarah Johnson', 'John Smith'],
    location: 'District Court - Central Delhi',
    createdAt: new Date('2024-12-01')
  },
  {
    id: '2',
    title: 'Client Meeting - TechCorp',
    date: new Date('2025-01-17'),
    time: '3:00 PM',
    type: 'meeting',
    description: 'Contract review discussion',
    relatedTo: {
      type: 'case',
      id: '2',
      name: 'TechCorp Commercial Contract Review'
    },
    attendees: ['Sarah Johnson'],
    location: 'Law Firm Office',
    createdAt: new Date('2024-12-05')
  },
  {
    id: '3',
    title: 'Task Deadline - Property Survey',
    date: new Date('2025-01-18'),
    type: 'deadline',
    description: 'Property survey report due',
    relatedTo: {
      type: 'task',
      id: '1',
      name: 'Prepare property survey report'
    },
    createdAt: new Date('2024-12-01')
  }
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '2',
    title: 'Upcoming Hearing Reminder',
    message: 'You have a hearing scheduled for Smith vs. Johnson case on Jan 20, 2025 at 10:30 AM',
    type: 'hearing',
    isRead: false,
    relatedTo: {
      type: 'hearing',
      id: '1'
    },
    createdAt: new Date('2025-01-15')
  },
  {
    id: '2',
    userId: '2',
    title: 'Task Assignment',
    message: 'New task assigned: Review contract amendments for TechCorp case',
    type: 'task',
    isRead: false,
    relatedTo: {
      type: 'task',
      id: '2'
    },
    createdAt: new Date('2025-01-14')
  },
  {
    id: '3',
    userId: '1',
    title: 'Payment Reminder',
    message: 'Invoice INV-2024-001 for John Smith is due on Jan 31, 2025',
    type: 'payment',
    isRead: true,
    relatedTo: {
      type: 'invoice',
      id: '1'
    },
    createdAt: new Date('2025-01-13')
  }
];

export const mockDashboardStats: DashboardStats = {
  totalCases: 15,
  activeCases: 8,
  hearingsToday: 2,
  upcomingHearings: 5,
  pendingTasks: 7,
  totalClients: 12,
  pendingPayments: 3,
  totalRevenue: 450000,
  recentCases: mockCases.slice(0, 3),
  upcomingEvents: mockCalendarEvents.slice(0, 3),
  recentNotifications: mockNotifications.slice(0, 3)
};