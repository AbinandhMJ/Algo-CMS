import {
  User,
  Client,
  ClientUser,
  Proposal,
  Project,
  Task,
  Milestone,
  ProjectFile,
  ProjectComment,
  ActivityEvent,
  Invoice,
  AppNotification,
  GoogleWorkspaceState,
  SupportIssue,
  SupportIssueCategory,
  SupportIssueUrgency,
} from '../types';

const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Devon Vance',
    email: 'devon@algotricz.com',
    role: 'admin',
    avatarInitials: 'DV',
  },
  {
    id: 'user-member-1',
    name: 'Elena Rostova',
    email: 'elena@algotricz.com',
    role: 'member',
    avatarInitials: 'ER',
  },
  {
    id: 'user-member-2',
    name: 'Kenji Sato',
    email: 'kenji@algotricz.com',
    role: 'member',
    avatarInitials: 'KS',
  },
];

const INITIAL_CLIENTS: Client[] = [
  {
    id: 'client-apex',
    companyName: 'Apex Financial Technologies',
    contactName: 'Sarah Jenkins',
    contactEmail: 'sarah.jenkins@apexfin.com',
    phone: '+1 (555) 234-8901',
    createdAt: '2026-07-15T09:30:00Z',
    portalAccessKey: 'APEX-8821-SEC',
  },
  {
    id: 'client-nova',
    companyName: 'Nova Robotics Labs',
    contactName: 'Marcus Vance',
    contactEmail: 'm.vance@novarobotics.io',
    phone: '+1 (555) 871-3320',
    createdAt: '2026-08-01T14:15:00Z',
    portalAccessKey: 'NOVA-4492-SEC',
  },
  {
    id: 'client-solaria',
    companyName: 'Solaria Health Systems',
    contactName: 'Dr. Evelyn Chen',
    contactEmail: 'evelyn.chen@solariahealth.org',
    phone: '+1 (555) 642-9900',
    createdAt: '2026-08-20T11:00:00Z',
    portalAccessKey: 'SOL-1033-SEC',
  },
  {
    id: 'client-aura',
    companyName: 'Aura Clean Energy',
    contactName: 'Nadia Thorne',
    contactEmail: 'nadia@auraclean.com',
    phone: '+1 (555) 390-1122',
    createdAt: '2026-09-03T10:00:00Z',
    portalAccessKey: 'AURA-7714-SEC',
  },
];

const INITIAL_CLIENT_USERS: ClientUser[] = [
  {
    id: 'cu-sarah',
    clientId: 'client-apex',
    email: 'sarah.jenkins@apexfin.com',
    name: 'Sarah Jenkins',
  },
  {
    id: 'cu-marcus',
    clientId: 'client-nova',
    email: 'm.vance@novarobotics.io',
    name: 'Marcus Vance',
  },
  {
    id: 'cu-evelyn',
    clientId: 'client-solaria',
    email: 'evelyn.chen@solariahealth.org',
    name: 'Dr. Evelyn Chen',
  },
  {
    id: 'cu-nadia',
    clientId: 'client-aura',
    email: 'nadia@auraclean.com',
    name: 'Nadia Thorne',
  },
];

const INITIAL_PROPOSALS: Proposal[] = [
  {
    id: 'prop-101',
    clientId: 'client-apex',
    title: 'Automated Reconciliation Engine v2',
    description:
      'Architect and deploy an enterprise-grade automated transaction reconciliation pipeline with real-time audit tracing and anomaly flagging.',
    lineItems: [
      { id: 'li-1', label: 'Architecture & Streaming Pipeline Setup', amount: 12000 },
      { id: 'li-2', label: 'High-Throughput Ingestion Workers', amount: 9500 },
      { id: 'li-3', label: 'Compliance Ledger & Reporting Interface', amount: 6500 },
    ],
    totalAmount: 28000,
    status: 'accepted',
    sentAt: '2026-08-10T10:00:00Z',
    respondedAt: '2026-08-12T16:20:00Z',
    convertedProjectId: 'proj-apex-recon',
    createdAt: '2026-08-08T09:00:00Z',
  },
  {
    id: 'prop-102',
    clientId: 'client-nova',
    title: 'Autonomous Fleet Telemetry Hub',
    description:
      'Centralized edge ingestion cluster and live monitoring console for 200+ autonomous delivery units with sub-second heartbeat telemetry.',
    lineItems: [
      { id: 'li-201', label: 'Edge Agent Protocol Specification', amount: 8000 },
      { id: 'li-202', label: 'MQTT & WebSocket Gateway Cluster', amount: 11000 },
      { id: 'li-203', label: 'Real-Time Map & Battery Health Panel', amount: 7500 },
    ],
    totalAmount: 26500,
    status: 'sent',
    sentAt: '2026-09-01T11:00:00Z',
    createdAt: '2026-08-28T14:00:00Z',
    expiresAt: '2026-09-18T23:59:59Z',
  },
  {
    id: 'prop-103',
    clientId: 'client-solaria',
    title: 'HIPAA Compliant Patient Event Mesh',
    description:
      'Zero-trust integration gateway routing electronic medical record updates securely between regional hospital branches.',
    lineItems: [
      { id: 'li-301', label: 'Zero-Trust Key Management & Audit Rig', amount: 15000 },
      { id: 'li-302', label: 'HL7 / FHIR Data Normalizer Pipeline', amount: 18500 },
    ],
    totalAmount: 33500,
    status: 'draft',
    createdAt: '2026-09-02T16:00:00Z',
  },
];

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-apex-recon',
    clientId: 'client-apex',
    proposalId: 'prop-101',
    name: 'Automated Reconciliation Engine v2',
    status: 'active',
    createdAt: '2026-08-12T16:20:00Z',
    budget: 28000,
    targetDate: '2026-10-31',
    description:
      'High-throughput financial ledger reconciliation with microsecond precision and bank verification webhooks.',
  },
  {
    id: 'proj-manual-infra',
    clientId: 'client-nova',
    proposalId: null, // manually created without proposal per architecture spec
    name: 'Telemetry Edge Gateway Prototyping',
    status: 'active',
    createdAt: '2026-08-15T09:00:00Z',
    budget: 14000,
    targetDate: '2026-10-15',
    description:
      'Direct contract deployment for low-power edge node telemetry collection without prior proposal phase.',
  },
];

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    projectId: 'proj-apex-recon',
    title: 'Implement idempotency checks in Kafka ingestion layer',
    description: 'Ensure double-submitted batch transactions are de-duplicated using SHA-256 header fingerprints.',
    status: 'done',
    priority: 'high',
    assigneeId: 'user-member-1',
    dueDate: '2026-08-25',
    createdAt: '2026-08-13T10:00:00Z',
  },
  {
    id: 'task-2',
    projectId: 'proj-apex-recon',
    title: 'Configure Razorpay webhook signature verification',
    description: 'Verify HMAC SHA256 signatures on all incoming payment completion webhooks.',
    status: 'review',
    priority: 'high',
    assigneeId: 'user-admin',
    dueDate: '2026-09-08',
    createdAt: '2026-08-18T11:30:00Z',
  },
  {
    id: 'task-3',
    projectId: 'proj-apex-recon',
    title: 'Build automated anomaly flagging rules engine',
    description: 'Flag transactions deviating more than 3 sigma from historic rolling 24h baselines.',
    status: 'in_progress',
    priority: 'medium',
    assigneeId: 'user-member-2',
    dueDate: '2026-09-14',
    createdAt: '2026-08-22T08:00:00Z',
  },
  {
    id: 'task-4',
    projectId: 'proj-apex-recon',
    title: 'Execute disaster recovery load simulation',
    description: 'Simulate full region drop and measure ledger restoration recovery point objective.',
    status: 'todo',
    priority: 'low',
    assigneeId: 'user-member-1',
    dueDate: '2026-09-28',
    createdAt: '2026-08-25T14:00:00Z',
  },
  {
    id: 'task-5',
    projectId: 'proj-manual-infra',
    title: 'Benchmark ARM64 binary payload footprint on edge devices',
    description: 'Optimize binary stripping and dynamic library linkages to keep memory under 32MB.',
    status: 'in_progress',
    priority: 'high',
    assigneeId: 'user-member-2',
    dueDate: '2026-09-10',
    createdAt: '2026-08-16T10:00:00Z',
  },
];

const INITIAL_MILESTONES: Milestone[] = [
  {
    id: 'ms-1',
    projectId: 'proj-apex-recon',
    title: 'Milestone 1: Architectural Audit & Schema Freeze',
    description:
      'Formalize data contract, ledger validation schemas, and database indexes with Apex security team.',
    dueDate: '2026-08-24',
    status: 'approved',
    approvedByClientUserId: 'cu-sarah',
    approvedAt: '2026-08-25T14:22:00Z',
    createdAt: '2026-08-12T17:00:00Z',
  },
  {
    id: 'ms-2',
    projectId: 'proj-apex-recon',
    title: 'Milestone 2: Beta Streaming Reconciliation Engine',
    description:
      'Deliver working sandbox environment processing 5,000 synthetic transactions per second with live monitoring.',
    dueDate: '2026-09-15',
    status: 'submitted',
    reviewNotes: 'Sandbox link provisioned at staging.recon.apexfin.algotricz.io. Ready for Sarah to verify.',
    createdAt: '2026-08-12T17:00:00Z',
  },
  {
    id: 'ms-3',
    projectId: 'proj-apex-recon',
    title: 'Milestone 3: Production Cutover & SLA Sign-off',
    description: 'Full zero-downtime traffic cutover with 99.99% availability warranty.',
    dueDate: '2026-10-31',
    status: 'pending',
    createdAt: '2026-08-12T17:00:00Z',
  },
  {
    id: 'ms-4',
    projectId: 'proj-manual-infra',
    title: 'Milestone 1: Edge Daemon Firmware Bundle',
    description: 'Packaged daemon runtime tested against 5 testbed physical robotics controllers.',
    dueDate: '2026-09-22',
    status: 'pending',
    createdAt: '2026-08-15T11:00:00Z',
  },
];

const INITIAL_FILES: ProjectFile[] = [
  {
    id: 'file-1',
    projectId: 'proj-apex-recon',
    milestoneId: 'ms-1',
    name: 'Algotricz_Apex_Reconciliation_Spec_v1.4.pdf',
    sizeBytes: 2450000,
    mimeType: 'application/pdf',
    url: 'https://storage.algotricz.internal/apex/specs/v1.4.pdf',
    uploadedByUserId: 'user-admin',
    uploadedByName: 'Devon Vance (Algotricz)',
    uploadedAt: '2026-08-14T11:20:00Z',
  },
  {
    id: 'file-2',
    projectId: 'proj-apex-recon',
    milestoneId: 'ms-2',
    name: 'Benchmark_Throughput_Results_5000tps.csv',
    sizeBytes: 840000,
    mimeType: 'text/csv',
    url: 'https://storage.algotricz.internal/apex/data/benchmarks.csv',
    uploadedByUserId: 'user-member-1',
    uploadedByName: 'Elena Rostova (Algotricz)',
    uploadedAt: '2026-09-02T16:45:00Z',
  },
  {
    id: 'file-3',
    projectId: 'proj-apex-recon',
    name: 'Apex_Test_Environment_Credentials.enc',
    sizeBytes: 12400,
    mimeType: 'application/octet-stream',
    url: 'https://storage.algotricz.internal/apex/keys/creds.enc',
    uploadedByClientUserId: 'cu-sarah',
    uploadedByName: 'Sarah Jenkins (Apex Financial)',
    uploadedAt: '2026-08-16T10:15:00Z',
  },
];

const INITIAL_COMMENTS: ProjectComment[] = [
  {
    id: 'comm-1',
    projectId: 'proj-apex-recon',
    milestoneId: 'ms-1',
    authorType: 'client',
    authorClientUserId: 'cu-sarah',
    authorName: 'Sarah Jenkins',
    body: 'The architecture doc looks thorough. Our compliance team specifically confirmed the SHA-256 idempotency approach satisfies regulations.',
    createdAt: '2026-08-24T18:10:00Z',
  },
  {
    id: 'comm-2',
    projectId: 'proj-apex-recon',
    milestoneId: 'ms-2',
    authorType: 'internal',
    authorUserId: 'user-admin',
    authorName: 'Devon Vance',
    body: 'Milestone 2 has been submitted for review. You can log into the staging environment with your portal access key.',
    createdAt: '2026-09-02T17:00:00Z',
  },
];

const INITIAL_ACTIVITY: ActivityEvent[] = [
  {
    id: 'act-1',
    projectId: 'proj-apex-recon',
    type: 'proposal_accepted',
    payload: {
      title: 'Proposal Accepted',
      description: 'Automated Reconciliation Engine v2 accepted by Sarah Jenkins.',
      actorName: 'Sarah Jenkins (Client)',
    },
    createdAt: '2026-08-12T16:20:00Z',
  },
  {
    id: 'act-2',
    projectId: 'proj-apex-recon',
    type: 'project_created',
    payload: {
      title: 'Project Initialized',
      description: 'Project converted automatically from proposal prop-101.',
      actorName: 'System Engine',
    },
    createdAt: '2026-08-12T16:20:05Z',
  },
  {
    id: 'act-3',
    projectId: 'proj-apex-recon',
    type: 'milestone_approved',
    payload: {
      title: 'Milestone 1 Approved',
      description: 'Architectural Audit & Schema Freeze signed off.',
      actorName: 'Sarah Jenkins (Client)',
    },
    createdAt: '2026-08-25T14:22:00Z',
  },
  {
    id: 'act-4',
    projectId: 'proj-apex-recon',
    type: 'milestone_submitted',
    payload: {
      title: 'Milestone 2 Submitted',
      description: 'Beta Streaming Reconciliation Engine submitted for client approval.',
      actorName: 'Devon Vance (Algotricz)',
    },
    createdAt: '2026-09-02T16:50:00Z',
  },
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-101',
    invoiceNumber: 'INV-ALG-2026-001',
    clientId: 'client-apex',
    projectId: 'proj-apex-recon',
    lineItems: [
      { id: 'li-1', label: 'Architecture & Streaming Pipeline Setup', amount: 12000 },
      { id: 'li-2', label: 'High-Throughput Ingestion Workers', amount: 9500 },
      { id: 'li-3', label: 'Compliance Ledger & Reporting Interface', amount: 6500 },
    ],
    totalAmount: 28000,
    status: 'paid',
    issuedDate: '2026-08-12',
    dueDate: '2026-08-26',
    razorpayPaymentLinkId: 'plink_Apex_Recon_001',
    paidAt: '2026-08-15T11:00:00Z',
  },
  {
    id: 'inv-102',
    invoiceNumber: 'INV-ALG-2026-002',
    clientId: 'client-nova',
    projectId: 'proj-manual-infra',
    lineItems: [
      { id: 'li-n1', label: 'Telemetry Edge Gateway Prototype - Phase 1 Deposit', amount: 7000 },
      { id: 'li-n2', label: 'Controller Hardware Interface Layer', amount: 7000 },
    ],
    totalAmount: 14000,
    status: 'sent',
    issuedDate: '2026-08-16',
    dueDate: '2026-09-16',
    razorpayPaymentLinkId: 'plink_Nova_Edge_002',
    paidAt: null,
  },
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    recipientId: 'user-admin',
    recipientType: 'internal',
    title: 'Milestone Submitted for Review',
    body: 'Milestone 2 on Automated Reconciliation Engine v2 is awaiting client sign-off.',
    type: 'milestone',
    read: false,
    createdAt: '2026-09-02T16:50:00Z',
  },
  {
    id: 'notif-2',
    recipientId: 'cu-sarah',
    recipientType: 'client',
    title: 'Milestone 2 Ready for Sign-Off',
    body: 'Algotricz has submitted Beta Streaming Reconciliation Engine for your review and approval.',
    type: 'milestone',
    read: false,
    createdAt: '2026-09-02T16:51:00Z',
  },
];

const INITIAL_SUPPORT_ISSUES: SupportIssue[] = [
  {
    id: 'iss-101',
    clientId: 'client-apex',
    projectId: 'proj-apex-recon',
    clientUserId: 'cu-sarah',
    clientUserName: 'Sarah Jenkins',
    subject: 'Request for sandbox mock API keys for staging security audit',
    category: 'technical_blocker',
    urgency: 'urgent',
    description: 'Our internal infosec team requires temporary staging credentials to validate data isolation before the upcoming milestone sign-off.',
    status: 'in_review',
    createdAt: '2026-09-02T11:30:00Z',
  },
  {
    id: 'iss-102',
    clientId: 'client-nova',
    projectId: 'proj-manual-infra',
    clientUserId: 'cu-marcus',
    clientUserName: 'Marcus Vance',
    subject: 'Query on telemetry ingestion frequency limits',
    category: 'milestone_clarification',
    urgency: 'normal',
    description: 'Can we confirm whether edge nodes will default to 500ms heartbeat polling or 1s during battery conservation mode?',
    status: 'open',
    createdAt: '2026-09-03T08:15:00Z',
  },
];

const STORAGE_KEY = 'algotricz_portal_store_v1';
const AUTH_MODE_STORAGE_KEY = 'algotricz_auth_mode';
const AUTH_CLIENT_USER_ID_KEY = 'algotricz_auth_client_user_id';
const AUTH_INTERNAL_USER_ID_KEY = 'algotricz_auth_internal_user_id';

export class PortalStore {
  users: User[];
  clients: Client[];
  clientUsers: ClientUser[];
  proposals: Proposal[];
  projects: Project[];
  tasks: Task[];
  milestones: Milestone[];
  files: ProjectFile[];
  comments: ProjectComment[];
  activity: ActivityEvent[];
  invoices: Invoice[];
  notifications: AppNotification[];
  supportIssues: SupportIssue[];
  googleWorkspace: GoogleWorkspaceState;

  // Session state
  authMode: 'client' | 'internal' | 'unauthenticated' = 'client';
  activeClientUser: ClientUser | null = null;
  activeInternalUser: User | null = null;

  private listeners: Set<() => void> = new Set();

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.users = parsed.users || INITIAL_USERS;
        this.clients = parsed.clients || INITIAL_CLIENTS;
        this.clientUsers = parsed.clientUsers || INITIAL_CLIENT_USERS;
        this.proposals = parsed.proposals || INITIAL_PROPOSALS;
        this.projects = parsed.projects || INITIAL_PROJECTS;
        this.tasks = parsed.tasks || INITIAL_TASKS;
        this.milestones = parsed.milestones || INITIAL_MILESTONES;
        this.files = parsed.files || INITIAL_FILES;
        this.comments = parsed.comments || INITIAL_COMMENTS;
        this.activity = parsed.activity || INITIAL_ACTIVITY;
        this.invoices = parsed.invoices || INITIAL_INVOICES;
        this.notifications = parsed.notifications || INITIAL_NOTIFICATIONS;
        this.supportIssues = parsed.supportIssues || INITIAL_SUPPORT_ISSUES;
        this.googleWorkspace = parsed.googleWorkspace || {
          isConnected: false,
          userEmail: null,
          userName: null,
          accessToken: null,
          calendarEventsCount: 0,
          driveFilesCount: 0,
        };
      } catch (e) {
        this.users = INITIAL_USERS;
        this.clients = INITIAL_CLIENTS;
        this.clientUsers = INITIAL_CLIENT_USERS;
        this.proposals = INITIAL_PROPOSALS;
        this.projects = INITIAL_PROJECTS;
        this.tasks = INITIAL_TASKS;
        this.milestones = INITIAL_MILESTONES;
        this.files = INITIAL_FILES;
        this.comments = INITIAL_COMMENTS;
        this.activity = INITIAL_ACTIVITY;
        this.invoices = INITIAL_INVOICES;
        this.notifications = INITIAL_NOTIFICATIONS;
        this.supportIssues = INITIAL_SUPPORT_ISSUES;
        this.googleWorkspace = {
          isConnected: false,
          userEmail: null,
          userName: null,
          accessToken: null,
          calendarEventsCount: 0,
          driveFilesCount: 0,
        };
      }
    } else {
      this.users = INITIAL_USERS;
      this.clients = INITIAL_CLIENTS;
      this.clientUsers = INITIAL_CLIENT_USERS;
      this.proposals = INITIAL_PROPOSALS;
      this.projects = INITIAL_PROJECTS;
      this.tasks = INITIAL_TASKS;
      this.milestones = INITIAL_MILESTONES;
      this.files = INITIAL_FILES;
      this.comments = INITIAL_COMMENTS;
      this.activity = INITIAL_ACTIVITY;
      this.invoices = INITIAL_INVOICES;
      this.notifications = INITIAL_NOTIFICATIONS;
      this.supportIssues = INITIAL_SUPPORT_ISSUES;
      this.googleWorkspace = {
        isConnected: false,
        userEmail: null,
        userName: null,
        accessToken: null,
        calendarEventsCount: 0,
        driveFilesCount: 0,
      };
    }

    // Restore persisted session
    const savedAuthMode = localStorage.getItem(AUTH_MODE_STORAGE_KEY) as 'client' | 'internal' | null;
    const savedClientUserId = localStorage.getItem(AUTH_CLIENT_USER_ID_KEY);
    const savedInternalUserId = localStorage.getItem(AUTH_INTERNAL_USER_ID_KEY);

    if (savedAuthMode === 'internal' && savedInternalUserId) {
      const u = this.users.find((user) => user.id === savedInternalUserId);
      if (u) {
        this.authMode = 'internal';
        this.activeInternalUser = u;
      } else {
        this.authMode = 'internal';
        this.activeInternalUser = this.users[0];
      }
    } else if (savedAuthMode === 'client' && savedClientUserId) {
      const cu = this.clientUsers.find((user) => user.id === savedClientUserId);
      if (cu) {
        this.authMode = 'client';
        this.activeClientUser = cu;
      } else {
        this.authMode = 'client';
        this.activeClientUser = this.clientUsers[0];
      }
    } else {
      // Default to client mode with first client for immediate seamless preview
      this.authMode = 'client';
      this.activeClientUser = this.clientUsers[0];
    }
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.save();
    this.listeners.forEach((l) => l());
  }

  private save() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          users: this.users,
          clients: this.clients,
          clientUsers: this.clientUsers,
          proposals: this.proposals,
          projects: this.projects,
          tasks: this.tasks,
          milestones: this.milestones,
          files: this.files,
          comments: this.comments,
          activity: this.activity,
          invoices: this.invoices,
          notifications: this.notifications,
          supportIssues: this.supportIssues,
          googleWorkspace: this.googleWorkspace,
        })
      );
    } catch (e) {
      console.error('Storage save error:', e);
    }
  }

  // --- Strict Client-Side Scoping Service Layer ---
  getScopedClientData(clientId: string) {
    const clientUser = this.clientUsers.find((u) => u.clientId === clientId);
    return {
      client: this.clients.find((c) => c.id === clientId) || null,
      clientUser: clientUser || null,
      proposals: this.proposals.filter((p) => p.clientId === clientId),
      projects: this.projects.filter((p) => p.clientId === clientId),
      invoices: this.invoices.filter((inv) => inv.clientId === clientId),
      tasks: this.tasks.filter((t) => {
        const proj = this.projects.find((p) => p.id === t.projectId);
        return proj && proj.clientId === clientId;
      }),
      milestones: this.milestones.filter((m) => {
        const proj = this.projects.find((p) => p.id === m.projectId);
        return proj && proj.clientId === clientId;
      }),
      files: this.files.filter((f) => {
        const proj = this.projects.find((p) => p.id === f.projectId);
        return proj && proj.clientId === clientId;
      }),
      comments: this.comments.filter((c) => {
        const proj = this.projects.find((p) => p.id === c.projectId);
        return proj && proj.clientId === clientId;
      }),
      activity: this.activity.filter((act) => {
        const proj = this.projects.find((p) => p.id === act.projectId);
        return proj && proj.clientId === clientId;
      }),
      supportIssues: this.supportIssues.filter((iss) => iss.clientId === clientId),
      notifications: this.notifications.filter((n) => {
        return (
          n.recipientType === 'client' &&
          (n.recipientId === clientId || (clientUser && n.recipientId === clientUser.id))
        );
      }),
    };
  }

  // --- Session Management ---
  authenticateClientUser(clientUser: ClientUser) {
    this.setClientSession(clientUser);
  }

  setAuthMode(mode: 'client' | 'internal' | 'unauthenticated') {
    this.authMode = mode;
    if (mode === 'internal') {
      this.activeInternalUser = this.users[0];
      this.activeClientUser = null;
      localStorage.setItem(AUTH_MODE_STORAGE_KEY, 'internal');
      localStorage.setItem(AUTH_INTERNAL_USER_ID_KEY, this.users[0].id);
      localStorage.removeItem(AUTH_CLIENT_USER_ID_KEY);
    } else if (mode === 'client') {
      if (!this.activeClientUser) {
        this.activeClientUser = this.clientUsers[0];
      }
      this.activeInternalUser = null;
      localStorage.setItem(AUTH_MODE_STORAGE_KEY, 'client');
      localStorage.setItem(AUTH_CLIENT_USER_ID_KEY, this.activeClientUser.id);
      localStorage.removeItem(AUTH_INTERNAL_USER_ID_KEY);
    } else {
      this.logout();
    }
    this.notify();
  }

  signOut() {
    this.logout();
  }

  setClientSession(clientUser: ClientUser) {
    this.authMode = 'client';
    this.activeClientUser = clientUser;
    this.activeInternalUser = null;
    localStorage.setItem(AUTH_MODE_STORAGE_KEY, 'client');
    localStorage.setItem(AUTH_CLIENT_USER_ID_KEY, clientUser.id);
    localStorage.removeItem(AUTH_INTERNAL_USER_ID_KEY);
    this.notify();
  }

  setInternalSession(user: User) {
    this.authMode = 'internal';
    this.activeInternalUser = user;
    this.activeClientUser = null;
    localStorage.setItem(AUTH_MODE_STORAGE_KEY, 'internal');
    localStorage.setItem(AUTH_INTERNAL_USER_ID_KEY, user.id);
    localStorage.removeItem(AUTH_CLIENT_USER_ID_KEY);
    this.notify();
  }

  logout() {
    this.authMode = 'unauthenticated';
    this.activeClientUser = null;
    this.activeInternalUser = null;
    localStorage.removeItem(AUTH_MODE_STORAGE_KEY);
    localStorage.removeItem(AUTH_CLIENT_USER_ID_KEY);
    localStorage.removeItem(AUTH_INTERNAL_USER_ID_KEY);
    this.notify();
  }

  // --- Client Profile & Account Settings ---
  updateClientProfile(clientId: string, updates: Partial<Client>) {
    const client = this.clients.find((c) => c.id === clientId);
    if (!client) return;
    Object.assign(client, updates);
    this.notify();
  }

  updateClientUser(clientUserId: string, updates: Partial<ClientUser>) {
    const cu = this.clientUsers.find((u) => u.id === clientUserId);
    if (!cu) return;
    Object.assign(cu, updates);
    this.notify();
  }

  // --- Support Issues Channel ---
  createSupportIssue(data: {
    clientId: string;
    projectId: string;
    clientUserId: string;
    clientUserName: string;
    subject: string;
    category: SupportIssueCategory;
    urgency: SupportIssueUrgency;
    description: string;
  }): SupportIssue {
    const issue: SupportIssue = {
      id: `iss-${Date.now()}`,
      clientId: data.clientId,
      projectId: data.projectId,
      clientUserId: data.clientUserId,
      clientUserName: data.clientUserName,
      subject: data.subject,
      category: data.category,
      urgency: data.urgency,
      description: data.description,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    this.supportIssues.unshift(issue);

    const client = this.clients.find((c) => c.id === data.clientId);
    const proj = this.projects.find((p) => p.id === data.projectId);

    // Activity log
    this.activity.unshift({
      id: `act-${Date.now()}`,
      projectId: data.projectId,
      type: 'support_issue_raised',
      payload: {
        title: `Support Ticket: ${data.subject}`,
        description: `Raised by ${data.clientUserName} (${client?.companyName}). Urgency: ${data.urgency.toUpperCase()}.`,
        actorName: data.clientUserName,
        extraDetails: data.description,
      },
      createdAt: new Date().toISOString(),
    });

    // Alert internal team
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      recipientId: 'user-admin',
      recipientType: 'internal',
      title: `Support Ticket (${data.urgency.toUpperCase()}): ${data.subject}`,
      body: `${data.clientUserName} (${client?.companyName}) flagged an issue on ${proj?.name || 'Project'}: "${data.subject}"`,
      type: 'support',
      read: false,
      createdAt: new Date().toISOString(),
      linkTab: 'dashboard',
    });

    this.notify();
    return issue;
  }

  resolveSupportIssue(issueId: string, resolutionNotes?: string) {
    const issue = this.supportIssues.find((i) => i.id === issueId);
    if (!issue) return;
    issue.status = 'resolved';
    issue.resolvedAt = new Date().toISOString();
    issue.resolutionNotes = resolutionNotes || 'Resolved by Algotricz operations team.';

    // Notify client
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      recipientId: issue.clientUserId,
      recipientType: 'client',
      title: 'Support Ticket Resolved',
      body: `Your ticket "${issue.subject}" has been marked as resolved: ${issue.resolutionNotes}`,
      type: 'support',
      read: false,
      createdAt: new Date().toISOString(),
      linkTab: 'support',
    });

    this.notify();
  }

  markAllNotificationsRead(recipientId: string) {
    let changed = false;
    this.notifications.forEach((n) => {
      if (n.recipientId === recipientId && !n.read) {
        n.read = true;
        changed = true;
      }
    });
    if (changed) this.notify();
  }

  // --- Client CRUD ---
  addClient(data: Omit<Client, 'id' | 'createdAt' | 'portalAccessKey'>): Client {
    const id = `client-${Date.now()}`;
    const newClient: Client = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      portalAccessKey: `${data.companyName.substring(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-SEC`,
    };
    this.clients.unshift(newClient);

    // Auto-create client user
    const cu: ClientUser = {
      id: `cu-${Date.now()}`,
      clientId: id,
      name: data.contactName,
      email: data.contactEmail,
    };
    this.clientUsers.push(cu);

    this.notify();
    return newClient;
  }

  // --- Proposal -> Project Conversion Flow ---
  createProposal(
    clientId: string,
    title: string,
    description: string,
    lineItems: { label: string; amount: number }[]
  ): Proposal {
    const totalAmount = lineItems.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const proposal: Proposal = {
      id: `prop-${Date.now()}`,
      clientId,
      title,
      description,
      lineItems: lineItems.map((li, idx) => ({ id: `li-${Date.now()}-${idx}`, ...li })),
      totalAmount,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
    this.proposals.unshift(proposal);
    this.notify();
    return proposal;
  }

  sendProposal(proposalId: string) {
    const p = this.proposals.find((prop) => prop.id === proposalId);
    if (!p) return;
    p.status = 'sent';
    p.sentAt = new Date().toISOString();
    // Default 14 days expiration
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 14);
    p.expiresAt = expiry.toISOString();

    const client = this.clients.find((c) => c.id === p.clientId);

    // Add notification for client
    const cu = this.clientUsers.find((u) => u.clientId === p.clientId);
    if (cu) {
      this.notifications.unshift({
        id: `notif-${Date.now()}`,
        recipientId: cu.id,
        recipientType: 'client',
        title: 'New Proposal Received',
        body: `Algotricz has sent you a proposal: "${p.title}" ($${p.totalAmount.toLocaleString()}).`,
        type: 'proposal',
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    this.notify();
  }

  respondToProposal(
    proposalId: string,
    action: 'accept' | 'reject',
    clientUserId: string,
    reason?: string
  ): { project?: Project; invoice?: Invoice } {
    const p = this.proposals.find((prop) => prop.id === proposalId);
    if (!p) throw new Error('Proposal not found');

    const client = this.clients.find((c) => c.id === p.clientId);
    const clientUser = this.clientUsers.find((cu) => cu.id === clientUserId) || {
      name: client?.contactName || 'Client Representative',
    };

    p.respondedAt = new Date().toISOString();

    if (action === 'reject') {
      p.status = 'rejected';
      p.responseReason = reason || 'Client declined proposal.';
      this.notify();
      return {};
    }

    // Accept -> Automatic Conversion Flow
    p.status = 'accepted';

    // 1. Create Project with proposalId set, name defaulted from proposal title
    const projectId = `proj-${Date.now()}`;
    const newProject: Project = {
      id: projectId,
      clientId: p.clientId,
      proposalId: p.id,
      name: p.title,
      status: 'active',
      createdAt: new Date().toISOString(),
      budget: p.totalAmount,
      description: p.description,
      targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };
    this.projects.unshift(newProject);
    p.convertedProjectId = projectId;

    // 2. Automatically generate draft Invoice copying line items and total
    const invoiceNumber = `INV-ALG-${new Date().getFullYear()}-${String(this.invoices.length + 1).padStart(3, '0')}`;
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      clientId: p.clientId,
      projectId: projectId,
      lineItems: [...p.lineItems],
      totalAmount: p.totalAmount,
      status: 'draft',
      issuedDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      razorpayPaymentLinkId: `plink_${p.clientId.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}`,
      paidAt: null,
    };
    this.invoices.unshift(newInvoice);

    // 3. Log ActivityEvent: "Project created from accepted proposal"
    this.activity.unshift({
      id: `act-${Date.now()}`,
      projectId: projectId,
      type: 'project_created',
      payload: {
        title: 'Project Initialized from Accepted Proposal',
        description: `Proposal "${p.title}" was accepted by ${clientUser.name}. Project and initial invoice generated.`,
        actorName: clientUser.name,
      },
      createdAt: new Date().toISOString(),
    });

    // 4. Create default kick-off milestone
    this.milestones.push({
      id: `ms-${Date.now()}`,
      projectId: projectId,
      title: 'Milestone 1: Kickoff & Technical Architecture Specification',
      description: 'Initial architectural review, environment onboarding, and contract baseline.',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    // 5. Notify Internal Team
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      recipientId: 'user-admin',
      recipientType: 'internal',
      title: 'Proposal Accepted & Converted',
      body: `${client?.companyName} accepted "${p.title}". Project ${newProject.name} created.`,
      type: 'project',
      read: false,
      createdAt: new Date().toISOString(),
    });

    this.notify();
    return { project: newProject, invoice: newInvoice };
  }

  // --- Project CRUD (supports manual onboarding without proposal) ---
  createProject(data: {
    clientId: string;
    name: string;
    budget: number;
    description?: string;
    targetDate?: string;
  }): Project {
    const id = `proj-${Date.now()}`;
    const project: Project = {
      id,
      clientId: data.clientId,
      proposalId: null, // manual project, nullable per spec
      name: data.name,
      budget: Number(data.budget) || 0,
      description: data.description,
      status: 'active',
      createdAt: new Date().toISOString(),
      targetDate: data.targetDate,
    };
    this.projects.unshift(project);

    this.activity.unshift({
      id: `act-${Date.now()}`,
      projectId: id,
      type: 'project_created',
      payload: {
        title: 'Project Created Manually',
        description: `Project "${project.name}" onboarded directly for client.`,
        actorName: 'Algotricz Operations',
      },
      createdAt: new Date().toISOString(),
    });

    this.notify();
    return project;
  }

  // --- Task CRUD ---
  createTask(data: {
    projectId: string;
    title: string;
    description?: string;
    assigneeId: string;
    dueDate: string;
    priority: Task['priority'];
  }): Task {
    const task: Task = {
      id: `task-${Date.now()}`,
      projectId: data.projectId,
      title: data.title,
      description: data.description,
      status: 'todo',
      priority: data.priority || 'medium',
      assigneeId: data.assigneeId,
      dueDate: data.dueDate,
      createdAt: new Date().toISOString(),
    };
    this.tasks.unshift(task);

    this.activity.unshift({
      id: `act-${Date.now()}`,
      projectId: data.projectId,
      type: 'task_status_changed',
      payload: {
        title: 'Task Created',
        description: `Task "${task.title}" assigned with due date ${task.dueDate}.`,
        actorName: 'Internal Team',
      },
      createdAt: new Date().toISOString(),
    });

    this.notify();
    return task;
  }

  updateTaskStatus(taskId: string, status: Task['status']) {
    const t = this.tasks.find((task) => task.id === taskId);
    if (!t) return;
    const oldStatus = t.status;
    t.status = status;

    this.activity.unshift({
      id: `act-${Date.now()}`,
      projectId: t.projectId,
      type: 'task_status_changed',
      payload: {
        title: 'Task Status Updated',
        description: `Task "${t.title}" moved from ${oldStatus} to ${status}.`,
        actorName: 'Internal Team',
      },
      createdAt: new Date().toISOString(),
    });

    this.notify();
  }

  // --- Milestone Flows (Submit & Approve/Reject) ---
  createMilestone(data: {
    projectId: string;
    title: string;
    description: string;
    dueDate: string;
  }): Milestone {
    const milestone: Milestone = {
      id: `ms-${Date.now()}`,
      projectId: data.projectId,
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.milestones.push(milestone);
    this.notify();
    return milestone;
  }

  submitMilestone(milestoneId: string, notes: string) {
    const m = this.milestones.find((item) => item.id === milestoneId);
    if (!m) return;
    m.status = 'submitted';
    m.reviewNotes = notes;

    const proj = this.projects.find((p) => p.id === m.projectId);
    if (proj) {
      const cu = this.clientUsers.find((u) => u.clientId === proj.clientId);
      if (cu) {
        this.notifications.unshift({
          id: `notif-${Date.now()}`,
          recipientId: cu.id,
          recipientType: 'client',
          title: 'Milestone Ready for Review',
          body: `Algotricz has submitted "${m.title}" for your sign-off.`,
          type: 'milestone',
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    }

    this.activity.unshift({
      id: `act-${Date.now()}`,
      projectId: m.projectId,
      type: 'milestone_submitted',
      payload: {
        title: 'Milestone Submitted for Sign-off',
        description: `Milestone "${m.title}" submitted. Note: ${notes}`,
        actorName: 'Algotricz Lead',
      },
      createdAt: new Date().toISOString(),
    });

    this.notify();
  }

  approveMilestone(milestoneId: string, clientUserId: string) {
    const m = this.milestones.find((item) => item.id === milestoneId);
    if (!m) return;
    m.status = 'approved';
    m.approvedByClientUserId = clientUserId;
    m.approvedAt = new Date().toISOString();

    const cu = this.clientUsers.find((u) => u.id === clientUserId);
    const actorName = cu ? `${cu.name} (Client)` : 'Client Authorized Contact';

    this.activity.unshift({
      id: `act-${Date.now()}`,
      projectId: m.projectId,
      type: 'milestone_approved',
      payload: {
        title: 'Milestone Approved',
        description: `Milestone "${m.title}" was approved by ${actorName}.`,
        actorName,
      },
      createdAt: new Date().toISOString(),
    });

    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      recipientId: 'user-admin',
      recipientType: 'internal',
      title: 'Milestone Approved by Client',
      body: `Client approved "${m.title}".`,
      type: 'milestone',
      read: false,
      createdAt: new Date().toISOString(),
    });

    this.notify();
  }

  requestMilestoneChanges(milestoneId: string, clientUserId: string, notes: string) {
    const m = this.milestones.find((item) => item.id === milestoneId);
    if (!m) return;
    m.status = 'changes_requested';
    m.reviewNotes = notes;

    const cu = this.clientUsers.find((u) => u.id === clientUserId);
    const actorName = cu ? `${cu.name} (Client)` : 'Client Contact';

    this.activity.unshift({
      id: `act-${Date.now()}`,
      projectId: m.projectId,
      type: 'milestone_changes_requested',
      payload: {
        title: 'Changes Requested on Milestone',
        description: `Client feedback: "${notes}"`,
        actorName,
      },
      createdAt: new Date().toISOString(),
    });

    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      recipientId: 'user-admin',
      recipientType: 'internal',
      title: 'Changes Requested by Client',
      body: `Client requested modifications on "${m.title}": ${notes}`,
      type: 'milestone',
      read: false,
      createdAt: new Date().toISOString(),
    });

    this.notify();
  }

  // --- Files & Comments ---
  addFile(file: Omit<ProjectFile, 'id' | 'uploadedAt'>): ProjectFile {
    const newFile: ProjectFile = {
      ...file,
      id: `file-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    };
    this.files.unshift(newFile);

    this.activity.unshift({
      id: `act-${Date.now()}`,
      projectId: file.projectId,
      type: 'file_uploaded',
      payload: {
        title: 'File Uploaded',
        description: `Uploaded file "${file.name}" (${(file.sizeBytes / 1024).toFixed(1)} KB).`,
        actorName: file.uploadedByName,
      },
      createdAt: new Date().toISOString(),
    });

    this.notify();
    return newFile;
  }

  addComment(comment: Omit<ProjectComment, 'id' | 'createdAt'>): ProjectComment {
    const newComment: ProjectComment = {
      ...comment,
      id: `comm-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.comments.push(newComment);

    this.activity.unshift({
      id: `act-${Date.now()}`,
      projectId: comment.projectId,
      type: 'comment_added',
      payload: {
        title: 'Comment Added',
        description: comment.body.length > 80 ? comment.body.substring(0, 80) + '...' : comment.body,
        actorName: comment.authorName,
      },
      createdAt: new Date().toISOString(),
    });

    this.notify();
    return newComment;
  }

  // --- Invoices & Razorpay Integration ---
  createInvoice(data: {
    clientId: string;
    projectId?: string | null;
    lineItems: { label: string; amount: number; quantity?: number; unitPrice?: number }[];
    dueDate: string;
    invoiceNumber?: string;
    issuedDate?: string;
    subtotal?: number;
    taxRate?: number;
    taxAmount?: number;
    discountAmount?: number;
    notes?: string;
    currency?: string;
    status?: Invoice['status'];
  }): Invoice {
    const calculatedSubtotal = data.lineItems.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const subtotal = data.subtotal !== undefined ? data.subtotal : calculatedSubtotal;
    const taxAmount = data.taxAmount || 0;
    const discountAmount = data.discountAmount || 0;
    const totalAmount = Math.max(0, subtotal + taxAmount - discountAmount);

    const invoiceNumber =
      data.invoiceNumber ||
      `INV-ALG-${new Date().getFullYear()}-${String(this.invoices.length + 1).padStart(3, '0')}`;

    const invoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      clientId: data.clientId,
      projectId: data.projectId || null,
      lineItems: data.lineItems.map((li, idx) => ({ id: `li-${Date.now()}-${idx}`, ...li })),
      totalAmount,
      subtotal,
      taxRate: data.taxRate,
      taxAmount: data.taxAmount,
      discountAmount: data.discountAmount,
      notes: data.notes,
      currency: data.currency || 'USD',
      status: data.status || 'draft',
      issuedDate: data.issuedDate || new Date().toISOString().split('T')[0],
      dueDate: data.dueDate,
      razorpayPaymentLinkId: `plink_${data.clientId.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}`,
      paidAt: null,
    };
    this.invoices.unshift(invoice);
    this.notify();
    return invoice;
  }

  sendInvoice(invoiceId: string) {
    const inv = this.invoices.find((i) => i.id === invoiceId);
    if (!inv) return;
    inv.status = 'sent';

    const client = this.clients.find((c) => c.id === inv.clientId);
    const cu = this.clientUsers.find((u) => u.clientId === inv.clientId);
    if (cu) {
      this.notifications.unshift({
        id: `notif-${Date.now()}`,
        recipientId: cu.id,
        recipientType: 'client',
        title: 'New Invoice Issued',
        body: `Invoice ${inv.invoiceNumber} for $${inv.totalAmount.toLocaleString()} has been generated with online Razorpay payment option.`,
        type: 'invoice',
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    this.notify();
  }

  markInvoicePaid(invoiceId: string, paymentMethod: string = 'Razorpay Gateway') {
    const inv = this.invoices.find((i) => i.id === invoiceId);
    if (!inv) return;
    inv.status = 'paid';
    inv.paidAt = new Date().toISOString();

    const client = this.clients.find((c) => c.id === inv.clientId);

    if (inv.projectId) {
      this.activity.unshift({
        id: `act-${Date.now()}`,
        projectId: inv.projectId,
        type: 'invoice_paid',
        payload: {
          title: 'Invoice Payment Completed',
          description: `Invoice ${inv.invoiceNumber} for $${inv.totalAmount.toLocaleString()} paid via ${paymentMethod}.`,
          actorName: client ? client.companyName : 'Payment Gateway',
        },
        createdAt: new Date().toISOString(),
      });
    }

    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      recipientId: 'user-admin',
      recipientType: 'internal',
      title: 'Invoice Paid',
      body: `Client ${client?.companyName} paid ${inv.invoiceNumber} ($${inv.totalAmount.toLocaleString()}).`,
      type: 'invoice',
      read: false,
      createdAt: new Date().toISOString(),
    });

    this.notify();
  }

  // --- Google Workspace state updater ---
  updateGoogleWorkspace(partial: Partial<GoogleWorkspaceState>) {
    this.googleWorkspace = {
      ...this.googleWorkspace,
      ...partial,
    };
    this.notify();
  }

  markNotificationRead(notificationId: string) {
    const notif = this.notifications.find((n) => n.id === notificationId);
    if (notif) {
      notif.read = true;
      this.notify();
    }
  }

  resetToInitial() {
    localStorage.removeItem(STORAGE_KEY);
    this.users = INITIAL_USERS;
    this.clients = INITIAL_CLIENTS;
    this.clientUsers = INITIAL_CLIENT_USERS;
    this.proposals = INITIAL_PROPOSALS;
    this.projects = INITIAL_PROJECTS;
    this.tasks = INITIAL_TASKS;
    this.milestones = INITIAL_MILESTONES;
    this.files = INITIAL_FILES;
    this.comments = INITIAL_COMMENTS;
    this.activity = INITIAL_ACTIVITY;
    this.invoices = INITIAL_INVOICES;
    this.notifications = INITIAL_NOTIFICATIONS;
    this.notify();
  }
}

export const store = new PortalStore();
