export const CASE_TYPES = [
  { value: 'civil', label: 'Civil Case' },
  { value: 'criminal', label: 'Criminal Case' },
  { value: 'property', label: 'Property Dispute' },
  { value: 'commercial', label: 'Commercial Case' },
  { value: 'family', label: 'Family Law' },
  { value: 'corporate', label: 'Corporate Law' },
] as const;

export const CASE_STATUS = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-800' },
  { value: 'on-hold', label: 'On Hold', color: 'bg-red-100 text-red-800' },
] as const;

export const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
] as const;

export const USER_ROLES = [
  { value: 'admin', label: 'Administrator' },
  { value: 'lawyer', label: 'Lawyer' },
  { value: 'staff', label: 'Staff' },
  { value: 'client', label: 'Client' },
] as const;

export const HEARING_TYPES = [
  { value: 'hearing', label: 'General Hearing' },
  { value: 'judgment', label: 'Judgment' },
  { value: 'evidence', label: 'Evidence Presentation' },
  { value: 'argument', label: 'Final Arguments' },
] as const;

export const INVOICE_STATUS = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  { value: 'sent', label: 'Sent', color: 'bg-blue-100 text-blue-800' },
  { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-800' },
  { value: 'overdue', label: 'Overdue', color: 'bg-red-100 text-red-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-800' },
] as const;

export const TEMPLATE_CATEGORIES = [
  { value: 'contract', label: 'Contracts' },
  { value: 'notice', label: 'Legal Notices' },
  { value: 'petition', label: 'Petitions' },
  { value: 'application', label: 'Applications' },
  { value: 'agreement', label: 'Agreements' },
] as const;

export const DOCUMENT_TYPES = [
  'PDF', 'DOC', 'DOCX', 'TXT', 'JPG', 'PNG', 'JPEG', 'GIF'
] as const;

export const COURTS = [
  'Supreme Court of India',
  'High Court - Delhi',
  'High Court - Mumbai',
  'High Court - Kolkata',
  'High Court - Chennai',
  'District Court - Central Delhi',
  'District Court - South Delhi',
  'District Court - West Delhi',
  'District Court - North Delhi',
  'District Court - East Delhi',
  'Family Court',
  'Consumer Court',
  'Labour Court',
  'Commercial Court',
] as const;

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;

export const WEEKDAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
] as const;