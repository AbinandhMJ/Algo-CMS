export type InternalRole = 'admin' | 'member';

export interface User {
  id: string;
  name: string;
  email: string;
  role: InternalRole;
  avatarInitials: string;
}

export interface Client {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  phone: string;
  createdAt: string;
  portalAccessKey: string;
}

export interface ClientUser {
  id: string;
  clientId: string;
  email: string;
  name: string;
}

export type ProposalStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

export interface ProposalLineItem {
  id: string;
  label: string;
  amount: number;
  quantity?: number;
  unitPrice?: number;
}

export interface Proposal {
  id: string;
  clientId: string;
  title: string;
  description: string;
  lineItems: ProposalLineItem[];
  totalAmount: number;
  status: ProposalStatus;
  sentAt?: string;
  respondedAt?: string;
  responseReason?: string;
  convertedProjectId?: string | null;
  expiresAt?: string;
  createdAt: string;
}

export type ProjectStatus = 'active' | 'paused' | 'completed';

export interface Project {
  id: string;
  clientId: string;
  proposalId?: string | null;
  name: string;
  status: ProjectStatus;
  createdAt: string;
  budget: number;
  description?: string;
  targetDate?: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  dueDate: string;
  createdAt: string;
}

export type MilestoneStatus = 'pending' | 'submitted' | 'approved' | 'changes_requested';

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: string;
  status: MilestoneStatus;
  reviewNotes?: string;
  approvedByClientUserId?: string | null;
  approvedAt?: string | null;
  calendarEventId?: string;
  createdAt: string;
}

export type ProjectFileCategory =
  | 'brand_asset'
  | 'specification'
  | 'architecture'
  | 'feedback_screenshot'
  | 'deliverable'
  | 'contract'
  | 'other';

export interface ProjectFile {
  id: string;
  projectId: string;
  taskId?: string | null;
  milestoneId?: string | null;
  name: string;
  sizeBytes: number;
  mimeType: string;
  url: string;
  category?: ProjectFileCategory;
  uploadedBy?: string;
  uploadedByUserId?: string | null;
  uploadedByClientUserId?: string | null;
  uploadedByName: string;
  uploadedAt: string;
  driveFileId?: string;
  driveWebViewLink?: string;
}

export interface ProjectComment {
  id: string;
  projectId: string;
  taskId?: string | null;
  milestoneId?: string | null;
  authorType: 'internal' | 'client';
  authorUserId?: string | null;
  authorClientUserId?: string | null;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  projectId: string;
  type:
    | 'proposal_accepted'
    | 'project_created'
    | 'task_status_changed'
    | 'milestone_submitted'
    | 'milestone_approved'
    | 'milestone_changes_requested'
    | 'file_uploaded'
    | 'comment_added'
    | 'invoice_generated'
    | 'invoice_paid'
    | 'workspace_synced'
    | 'support_issue_raised';
  payload: {
    title: string;
    description: string;
    actorName: string;
    extraDetails?: string;
  };
  createdAt: string;
}

export type SupportIssueCategory =
  | 'feature_scope'
  | 'technical_blocker'
  | 'billing_query'
  | 'milestone_clarification'
  | 'general_support';

export type SupportIssueStatus = 'open' | 'in_review' | 'resolved';
export type SupportIssueUrgency = 'normal' | 'urgent' | 'blocker';

export interface SupportIssue {
  id: string;
  clientId: string;
  projectId: string;
  clientUserId: string;
  clientUserName: string;
  subject: string;
  category: SupportIssueCategory;
  urgency: SupportIssueUrgency;
  description: string;
  status: SupportIssueStatus;
  createdAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  projectId?: string | null;
  lineItems: ProposalLineItem[];
  totalAmount: number;
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  discountAmount?: number;
  notes?: string;
  currency?: string;
  status: InvoiceStatus;
  dueDate: string;
  issuedDate: string;
  razorpayPaymentLinkId?: string;
  paidAt?: string | null;
}

export interface AppNotification {
  id: string;
  recipientId: string;
  recipientType: 'internal' | 'client';
  title: string;
  body: string;
  type: 'proposal' | 'milestone' | 'invoice' | 'project' | 'system' | 'support';
  read: boolean;
  createdAt: string;
  linkTab?: string;
  targetId?: string;
}

export interface GoogleWorkspaceState {
  isConnected: boolean;
  userEmail: string | null;
  userName: string | null;
  accessToken: string | null;
  lastCalendarSync?: string;
  lastDriveSync?: string;
  lastSheetsSync?: string;
  calendarEventsCount: number;
  driveFilesCount: number;
  sheetsExportUrl?: string;
}
