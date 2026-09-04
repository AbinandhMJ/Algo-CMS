/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { store } from './services/store';
import { googleSignIn, googleLogout, initAuth, getAccessToken } from './services/auth';
import {
  createCalendarEvent,
  createDriveFolder,
  createSpreadsheetWithData,
  sendGmailMessage,
} from './services/googleWorkspace';
import { Navbar, InternalViewTab, ClientViewTab } from './components/Navbar';
import { InternalDashboard } from './components/internal/InternalDashboard';
import { ClientsView } from './components/internal/ClientsView';
import { ProposalsView } from './components/internal/ProposalsView';
import { ProjectsView } from './components/internal/ProjectsView';
import { GanttTimelineView } from './components/internal/GanttTimelineView';
import { InvoicesView } from './components/internal/InvoicesView';
import { WorkspaceSyncView } from './components/internal/WorkspaceSyncView';
import { ClientPortalView } from './components/client/ClientPortalView';
import { RazorpayModal } from './components/common/RazorpayModal';
import { ConfirmationModal } from './components/common/ConfirmationModal';
import { AuthView } from './components/auth/AuthView';
import { Invoice, Milestone, Project, Proposal, Client, ClientUser } from './types';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function App() {
  // Re-render trigger on store mutation
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setTick((t) => t + 1);
    });

    // Check Firebase auth state
    initAuth(
      (firebaseUser, token) => {
        store.updateGoogleWorkspace({
          isConnected: true,
          userEmail: firebaseUser.email,
          userName: firebaseUser.displayName,
          accessToken: token,
        });
      },
      () => {
        store.updateGoogleWorkspace({
          isConnected: false,
          userEmail: null,
          userName: null,
          accessToken: null,
        });
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Navigation State
  const [currentMode, setCurrentMode] = useState<'internal' | 'client'>(
    store.authMode === 'client' ? 'client' : 'internal'
  );
  const [internalTab, setInternalTab] = useState<InternalViewTab>('dashboard');
  const [clientTab, setClientTab] = useState<ClientViewTab>('overview');
  const [activeClientId, setActiveClientId] = useState<string>(
    store.activeClientUser?.clientId || store.clients[0]?.id || 'client-apex'
  );

  const handleClientLogin = (user: ClientUser) => {
    store.authenticateClientUser(user);
    setActiveClientId(user.clientId);
    setCurrentMode('client');
    setClientTab('overview');
    showToast(`Signed into Client Portal as ${user.name} (${user.email}).`, 'success');
  };

  const handleInternalLogin = () => {
    store.setAuthMode('internal');
    setCurrentMode('internal');
    setInternalTab('dashboard');
    showToast('Signed into Algotricz Lead Workspace.', 'success');
  };

  // Razorpay Checkout Modal
  const [razorpayInvoice, setRazorpayInvoice] = useState<Invoice | null>(null);
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);

  // Status Banner / Feedback Toast
  const [statusToast, setStatusToast] = useState<{
    type: 'success' | 'info' | 'error';
    message: string;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setStatusToast({ message, type });
    setTimeout(() => {
      setStatusToast(null);
    }, 4500);
  };

  // Confirmation Modal State (required for mutative Workspace API calls)
  const [confirmationConfig, setConfirmationConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const activeClient =
    store.clients.find((c) => c.id === activeClientId) || store.clients[0];

  // Scoped dataset for client portal (Service Layer enforced!)
  const scopedClientData = store.getScopedClientData(activeClientId);

  // --- Google Workspace Handlers ---
  const handleConnectGoogleWorkspace = async () => {
    try {
      showToast('Opening Google Workspace OAuth popup...', 'info');
      const authResult = await googleSignIn();
      if (authResult) {
        store.updateGoogleWorkspace({
          isConnected: true,
          userEmail: authResult.user.email,
          userName: authResult.user.displayName,
          accessToken: authResult.accessToken,
        });
        showToast(
          `Google Workspace connected (${authResult.user.email}). Calendar, Drive, Sheets & Gmail ready.`,
          'success'
        );
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Google Workspace connection failed.', 'error');
    }
  };

  const handleDisconnectGoogleWorkspace = async () => {
    await googleLogout();
    store.updateGoogleWorkspace({
      isConnected: false,
      userEmail: null,
      userName: null,
      accessToken: null,
    });
    showToast('Google Workspace disconnected.', 'info');
  };

  // Google Calendar Milestone Sync with Confirmation Dialog
  const handleSyncMilestoneToCalendar = (milestone: Milestone, project: Project) => {
    setConfirmationConfig({
      isOpen: true,
      title: 'Confirm Calendar Event Creation',
      message: `Are you sure you want to add "${milestone.title}" (Project: ${project.name}) to Google Calendar for ${milestone.dueDate}?`,
      confirmLabel: 'Add to Calendar',
      onConfirm: async () => {
        setConfirmationConfig((prev) => ({ ...prev, isOpen: false }));
        try {
          const token = await getAccessToken();
          if (!token) {
            showToast('Google Workspace access token required. Please connect above.', 'error');
            return;
          }

          const dueDateIso = new Date(`${milestone.dueDate}T09:00:00`).toISOString();
          const endDateIso = new Date(`${milestone.dueDate}T10:00:00`).toISOString();

          await createCalendarEvent(token, {
            summary: `Algotricz Milestone: ${milestone.title}`,
            description: `Project: ${project.name}\nScope: ${milestone.description}`,
            startDateTime: dueDateIso,
            endDateTime: endDateIso,
          });

          store.updateGoogleWorkspace({
            calendarEventsCount: store.googleWorkspace.calendarEventsCount + 1,
          });

          showToast(
            `Calendar event created for "${milestone.title}" on ${milestone.dueDate}.`,
            'success'
          );
        } catch (err: any) {
          showToast(err.message || 'Failed to sync calendar event.', 'error');
        }
      },
    });
  };

  // Google Drive Project Folder Creation with Confirmation Dialog
  const handleCreateDriveProjectFolder = (project: Project) => {
    setConfirmationConfig({
      isOpen: true,
      title: 'Confirm Google Drive Directory Creation',
      message: `Create a dedicated root folder "Algotricz - ${project.name}" in Google Drive for deliverables?`,
      confirmLabel: 'Provision Drive Folder',
      onConfirm: async () => {
        setConfirmationConfig((prev) => ({ ...prev, isOpen: false }));
        try {
          const token = await getAccessToken();
          if (!token) {
            showToast('Google Workspace access token required. Please connect above.', 'error');
            return;
          }

          const folder = await createDriveFolder(token, `Algotricz - ${project.name}`);
          store.updateGoogleWorkspace({
            driveFilesCount: store.googleWorkspace.driveFilesCount + 1,
          });

          showToast(
            `Google Drive folder created: "${folder.name}".`,
            'success'
          );
        } catch (err: any) {
          showToast(err.message || 'Drive folder creation failed.', 'error');
        }
      },
    });
  };

  // Google Sheets Export with Confirmation Dialog
  const handleExportSheets = (invoicesToExport: Invoice[]) => {
    setConfirmationConfig({
      isOpen: true,
      title: 'Export Financial Ledger to Google Sheets',
      message: `Generate a new Google Spreadsheet containing ${invoicesToExport.length} invoice records and reconciliation data?`,
      confirmLabel: 'Export Spreadsheet',
      onConfirm: async () => {
        setConfirmationConfig((prev) => ({ ...prev, isOpen: false }));
        try {
          const token = await getAccessToken();
          if (!token) {
            showToast('Google Workspace access token required. Please connect above.', 'error');
            return;
          }

          const headers = ['Invoice #', 'Client ID', 'Status', 'Due Date', 'Amount (USD)', 'Paid Date', 'Razorpay ID'];
          const rows = invoicesToExport.map((inv) => [
            inv.invoiceNumber,
            inv.clientId,
            inv.status.toUpperCase(),
            inv.dueDate,
            inv.totalAmount,
            inv.paidAt || 'N/A',
            inv.razorpayPaymentLinkId || 'N/A',
          ]);

          const result = await createSpreadsheetWithData(token, {
            title: `Algotricz Financial Ledger - ${new Date().toISOString().split('T')[0]}`,
            headers,
            rows,
          });

          showToast(
            `Spreadsheet successfully created in Google Drive. ID: ${result.spreadsheetId}`,
            'success'
          );
        } catch (err: any) {
          showToast(err.message || 'Sheets export failed.', 'error');
        }
      },
    });
  };

  // Gmail Dispatch with Confirmation Dialog
  const handleGmailDispatch = (toEmail: string, subject: string, bodyText: string) => {
    setConfirmationConfig({
      isOpen: true,
      title: 'Confirm Outbound Gmail Dispatch',
      message: `Send an official transactional email to "${toEmail}" via Gmail API?\n\nSubject: ${subject}`,
      confirmLabel: 'Send via Gmail',
      onConfirm: async () => {
        setConfirmationConfig((prev) => ({ ...prev, isOpen: false }));
        try {
          const token = await getAccessToken();
          if (!token) {
            showToast('Google Workspace access token required. Please connect above.', 'error');
            return;
          }

          await sendGmailMessage(token, {
            to: toEmail,
            subject,
            bodyText,
          });

          showToast(`Email dispatched to ${toEmail} via Gmail.`, 'success');
        } catch (err: any) {
          showToast(err.message || 'Gmail transmission failed.', 'error');
        }
      },
    });
  };

  // Proposal Acceptance handler (triggers conversion)
  const handleAcceptProposal = (proposalId: string) => {
    const result = store.respondToProposal(
      proposalId,
      'accept',
      scopedClientData.client?.id || 'cu-sarah'
    );
    showToast(
      `Proposal accepted! Project "${result.project?.name}" initialized and draft invoice created.`,
      'success'
    );
  };

  const handleRejectProposal = (proposalId: string, reason: string) => {
    store.respondToProposal(
      proposalId,
      'reject',
      scopedClientData.client?.id || 'cu-sarah',
      reason
    );
    showToast('Proposal response recorded (Declined).', 'info');
  };

  const handleApproveMilestone = (milestoneId: string) => {
    store.approveMilestone(milestoneId, scopedClientData.client?.id || 'cu-sarah');
    showToast('Milestone approved and verified.', 'success');
  };

  const handleRequestChangesMilestone = (milestoneId: string, notes: string) => {
    store.requestMilestoneChanges(milestoneId, scopedClientData.client?.id || 'cu-sarah', notes);
    showToast('Change request dispatched to Algotricz engineers.', 'info');
  };

  // Razorpay Checkout Trigger
  const handleOpenRazorpayModal = (invoice: Invoice) => {
    setRazorpayInvoice(invoice);
    setIsRazorpayModalOpen(true);
  };

  const handleRazorpayPaymentSuccess = (invoiceId: string, paymentMethod: string) => {
    store.markInvoicePaid(invoiceId, paymentMethod);
    showToast(
      `Payment received for ${razorpayInvoice?.invoiceNumber}! Ledger and client dashboard updated.`,
      'success'
    );
  };

  if (store.authMode === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-slate-100 font-sans text-slate-800 antialiased selection:bg-slate-200">
        {statusToast && (
          <div
            id="status-toast-banner"
            className="fixed top-4 right-4 z-50 flex max-w-md items-center justify-between gap-3 rounded-md border border-slate-300 bg-white p-3.5 shadow-md text-xs"
          >
            <div className="flex items-center gap-2">
              {statusToast.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
              ) : statusToast.type === 'error' ? (
                <AlertCircle className="h-4 w-4 text-red-700 shrink-0" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
              )}
              <span className="font-medium text-slate-900 leading-snug">{statusToast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusToast(null)}
              className="rounded p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <AuthView
          onClientAuthenticated={handleClientLogin}
          onInternalAuthenticated={handleInternalLogin}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 font-sans text-slate-800 antialiased selection:bg-slate-200">
      {/* Navigation Bar */}
      <Navbar
        currentMode={currentMode}
        onModeChange={(mode) => setCurrentMode(mode)}
        activeInternalTab={internalTab}
        onInternalTabChange={(tab) => setInternalTab(tab)}
        activeClientTab={clientTab}
        onClientTabChange={(tab) => setClientTab(tab)}
        clients={store.clients}
        activeClientId={activeClientId}
        onClientSelect={(cId) => {
          setActiveClientId(cId);
          const cu = store.clientUsers.find((u) => u.clientId === cId);
          if (cu) store.authenticateClientUser(cu);
        }}
        notifications={store.notifications}
        onMarkNotificationRead={(id) => store.markNotificationRead(id)}
        onMarkAllNotificationsRead={(recId) => store.markAllNotificationsRead(recId)}
        recipientId={
          currentMode === 'client'
            ? store.activeClientUser?.id || `cu-${activeClientId}`
            : 'internal-lead'
        }
        onLogout={() => {
          store.signOut();
          showToast('Signed out of Algotricz portal.', 'info');
        }}
        googleWorkspace={store.googleWorkspace}
        onConnectGoogleWorkspace={handleConnectGoogleWorkspace}
        onDisconnectGoogleWorkspace={handleDisconnectGoogleWorkspace}
      />

      {/* Toast Feedback Notification Banner */}
      {statusToast && (
        <div
          id="status-toast-banner"
          className="fixed top-16 right-4 z-50 flex max-w-md items-center justify-between gap-3 rounded-md border border-slate-300 bg-white p-3.5 shadow-md text-xs"
        >
          <div className="flex items-center gap-2">
            {statusToast.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
            ) : statusToast.type === 'error' ? (
              <AlertCircle className="h-4 w-4 text-red-700 shrink-0" />
            ) : (
              <div className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
            )}
            <span className="font-medium text-slate-900 leading-snug">{statusToast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusToast(null)}
            className="rounded p-1 text-slate-400 hover:text-slate-700"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {currentMode === 'internal' ? (
          // ================= INTERNAL TEAM VIEW =================
          <div>
            {internalTab === 'dashboard' && (
              <InternalDashboard
                projects={store.projects}
                tasks={store.tasks}
                invoices={store.invoices}
                proposals={store.proposals}
                clients={store.clients}
                activity={store.activity}
                onNavigate={(target) => setInternalTab(target)}
                onOpenCreateProposal={() => setInternalTab('proposals')}
                onOpenCreateClient={() => setInternalTab('clients')}
              />
            )}

            {internalTab === 'clients' && (
              <ClientsView
                clients={store.clients}
                projects={store.projects}
                proposals={store.proposals}
                invoices={store.invoices}
                onAddClient={(data) => {
                  const newC = store.addClient(data);
                  showToast(`Client "${newC.companyName}" onboarded with access key.`, 'success');
                }}
                onSwitchToClientView={(clientId) => {
                  setActiveClientId(clientId);
                  const cu = store.clientUsers.find((u) => u.clientId === clientId);
                  if (cu) {
                    store.authenticateClientUser(cu);
                  }
                  setCurrentMode('client');
                  setClientTab('overview');
                  showToast(`Switched view to client portal for ${store.clients.find(c => c.id === clientId)?.companyName}.`, 'info');
                }}
              />
            )}

            {internalTab === 'proposals' && (
              <ProposalsView
                proposals={store.proposals}
                clients={store.clients}
                projects={store.projects}
                googleWorkspace={store.googleWorkspace}
                onCreateProposal={(cId, title, desc, items) => {
                  store.createProposal(cId, title, desc, items);
                  showToast(`Draft proposal "${title}" created.`, 'success');
                }}
                onSendProposal={(propId) => {
                  store.sendProposal(propId);
                  showToast('Proposal dispatched to client portal.', 'success');
                }}
                onSimulateClientResponse={(propId, action, reason) => {
                  if (action === 'accept') {
                    handleAcceptProposal(propId);
                  } else {
                    handleRejectProposal(propId, reason || 'Declined during review');
                  }
                }}
                onSendGmailProposalNotification={(proposal, client) => {
                  handleGmailDispatch(
                    client.contactEmail,
                    `Algotricz Proposal: ${proposal.title}`,
                    `Dear ${client.contactName},\n\nAlgotricz has dispatched proposal "${proposal.title}" for ${client.companyName} ($${proposal.totalAmount.toLocaleString()}).\n\nPlease log in to review and authorize.\n\nAlgotricz Engineering`
                  );
                }}
                onNavigateToProject={(pId) => {
                  setInternalTab('projects');
                }}
              />
            )}

            {internalTab === 'projects' && (
              <ProjectsView
                projects={store.projects}
                tasks={store.tasks}
                milestones={store.milestones}
                files={store.files}
                comments={store.comments}
                activity={store.activity}
                clients={store.clients}
                users={store.users}
                googleWorkspace={store.googleWorkspace}
                onCreateProject={(data) => {
                  const proj = store.createProject(data);
                  showToast(`Direct project "${proj.name}" onboarded.`, 'success');
                }}
                onCreateTask={(data) => {
                  store.createTask(data);
                  showToast('Task assigned.', 'success');
                }}
                onUpdateTaskStatus={(taskId, status) => {
                  store.updateTaskStatus(taskId, status);
                }}
                onCreateMilestone={(data) => {
                  store.createMilestone(data);
                  showToast('Milestone defined.', 'success');
                }}
                onSubmitMilestone={(milestoneId, notes) => {
                  store.submitMilestone(milestoneId, notes);
                  showToast('Milestone submitted for client sign-off.', 'success');
                }}
                onUploadFile={(data) => {
                  store.addFile(data);
                  showToast(`File "${data.name}" uploaded.`, 'success');
                }}
                onAddComment={(data) => {
                  store.addComment(data);
                }}
                onSyncMilestoneToCalendar={(milestone, project) => {
                  handleSyncMilestoneToCalendar(milestone, project);
                }}
                onCreateProjectDriveFolder={(project) => {
                  handleCreateDriveProjectFolder(project);
                }}
              />
            )}

            {internalTab === 'timeline' && (
              <GanttTimelineView
                projects={store.projects}
                milestones={store.milestones}
                tasks={store.tasks}
                clients={store.clients}
                users={store.users}
                googleWorkspace={store.googleWorkspace}
                onSyncMilestoneToCalendar={(milestone, project) => {
                  handleSyncMilestoneToCalendar(milestone, project);
                }}
                onSubmitMilestone={(milestoneId, notes) => {
                  store.submitMilestone(milestoneId, notes);
                  showToast('Milestone submitted for client review.', 'success');
                }}
                onUpdateTaskStatus={(taskId, status) => {
                  store.updateTaskStatus(taskId, status);
                }}
                onCreateMilestone={(data) => {
                  store.createMilestone(data);
                  showToast('Milestone created.', 'success');
                }}
                onCreateTask={(data) => {
                  store.createTask(data);
                  showToast('Task assigned.', 'success');
                }}
              />
            )}

            {internalTab === 'invoices' && (
              <InvoicesView
                invoices={store.invoices}
                clients={store.clients}
                projects={store.projects}
                milestones={store.milestones}
                tasks={store.tasks}
                googleWorkspace={store.googleWorkspace}
                onCreateInvoice={(data) => {
                  const inv = store.createInvoice(data);
                  showToast(`Invoice ${inv.invoiceNumber} created.`, 'success');
                }}
                onSendInvoice={(invoiceId) => {
                  store.sendInvoice(invoiceId);
                  showToast('Invoice sent to client with Razorpay link.', 'success');
                }}
                onMarkInvoicePaid={(invoiceId) => {
                  store.markInvoicePaid(invoiceId, 'Manual Wire/Transfer');
                  showToast('Invoice marked as paid.', 'success');
                }}
                onOpenRazorpayCheckout={(inv) => {
                  handleOpenRazorpayModal(inv);
                }}
                onExportToGoogleSheets={(invoicesToExport) => {
                  handleExportSheets(invoicesToExport);
                }}
              />
            )}

            {internalTab === 'workspace' && (
              <WorkspaceSyncView
                workspace={store.googleWorkspace}
                projects={store.projects}
                milestones={store.milestones}
                invoices={store.invoices}
                clients={store.clients}
                proposals={store.proposals}
                onConnectWorkspace={handleConnectGoogleWorkspace}
                onRequestCalendarSync={(mId) => {
                  const m = store.milestones.find((item) => item.id === mId);
                  const p = store.projects.find((proj) => proj.id === m?.projectId);
                  if (m && p) handleSyncMilestoneToCalendar(m, p);
                }}
                onRequestDriveFolderCreate={(pId) => {
                  const p = store.projects.find((proj) => proj.id === pId);
                  if (p) handleCreateDriveProjectFolder(p);
                }}
                onRequestSheetsExport={() => {
                  handleExportSheets(store.invoices);
                }}
                onRequestGmailDispatch={(to, sub, body) => {
                  handleGmailDispatch(to, sub, body);
                }}
              />
            )}
          </div>
        ) : (
          // ================= CLIENT PORTAL VIEW (SCOPED DATASET) =================
          activeClient && (
            <ClientPortalView
              client={activeClient}
              clientUser={store.activeClientUser}
              activeTab={clientTab}
              onTabChange={(tab) => setClientTab(tab)}
              projects={scopedClientData.projects}
              proposals={scopedClientData.proposals}
              invoices={scopedClientData.invoices}
              milestones={scopedClientData.milestones}
              tasks={scopedClientData.tasks}
              files={scopedClientData.files}
              comments={scopedClientData.comments}
              activity={scopedClientData.activity}
              supportIssues={scopedClientData.supportIssues}
              onCreateSupportIssue={(data) => {
                store.createSupportIssue(data);
                showToast('Support ticket dispatched to project architect.', 'success');
              }}
              onAddFile={(projectId, fileData) => {
                store.addFile({
                  ...fileData,
                  projectId,
                  uploadedBy: store.activeClientUser?.name || activeClient.contactName,
                });
                showToast(`File "${fileData.name}" uploaded to project.`, 'success');
              }}
              onUpdateClientProfile={(updated) => {
                store.updateClientProfile(activeClient.id, updated);
                showToast('Organization settings updated.', 'success');
              }}
              onAcceptProposal={(proposalId) => handleAcceptProposal(proposalId)}
              onRejectProposal={(proposalId, reason) =>
                handleRejectProposal(proposalId, reason)
              }
              onApproveMilestone={(milestoneId) => handleApproveMilestone(milestoneId)}
              onRequestChangesMilestone={(milestoneId, notes) =>
                handleRequestChangesMilestone(milestoneId, notes)
              }
              onAddComment={(projectId, comment) => {
                store.addComment({
                  projectId,
                  authorType: 'client',
                  authorUserId: store.activeClientUser?.id || activeClient.id,
                  authorName: `${store.activeClientUser?.name || activeClient.contactName} (${activeClient.companyName})`,
                  body: comment,
                });
                showToast('Comment posted to project thread.', 'success');
              }}
              onOpenRazorpayModal={(invoice) => handleOpenRazorpayModal(invoice)}
            />
          )
        )}
      </main>

      {/* Razorpay Checkout Modal */}
      <RazorpayModal
        isOpen={isRazorpayModalOpen}
        invoice={razorpayInvoice}
        clientCompanyName={
          store.clients.find((c) => c.id === razorpayInvoice?.clientId)?.companyName ||
          'Client'
        }
        onClose={() => setIsRazorpayModalOpen(false)}
        onPaymentSuccess={handleRazorpayPaymentSuccess}
      />

      {/* Accessible User Confirmation Dialog for Workspace API Operations */}
      <ConfirmationModal
        isOpen={confirmationConfig.isOpen}
        title={confirmationConfig.title}
        message={confirmationConfig.message}
        confirmLabel={confirmationConfig.confirmLabel}
        onConfirm={confirmationConfig.onConfirm}
        onCancel={() => setConfirmationConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
