import React from 'react';
import {
  FolderKanban,
  AlertCircle,
  Receipt,
  FileClock,
  ArrowUpRight,
  Clock,
  Building2,
  CheckCircle2,
  Plus,
  CalendarRange,
} from 'lucide-react';
import { Project, Task, Invoice, Proposal, ActivityEvent, Client } from '../../types';

interface InternalDashboardProps {
  projects: Project[];
  tasks: Task[];
  invoices: Invoice[];
  proposals: Proposal[];
  clients: Client[];
  activity: ActivityEvent[];
  onNavigate: (tab: 'clients' | 'proposals' | 'projects' | 'timeline' | 'invoices' | 'workspace') => void;
  onOpenCreateProposal: () => void;
  onOpenCreateClient: () => void;
}

export const InternalDashboard: React.FC<InternalDashboardProps> = ({
  projects,
  tasks,
  invoices,
  proposals,
  clients,
  activity,
  onNavigate,
  onOpenCreateProposal,
  onOpenCreateClient,
}) => {
  const activeProjects = projects.filter((p) => p.status === 'active');
  const nowStr = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'done' && t.dueDate && t.dueDate < nowStr
  );
  const unpaidInvoices = invoices.filter(
    (i) => i.status === 'sent' || i.status === 'overdue'
  );
  const pendingProposals = proposals.filter((p) => p.status === 'sent');

  const totalUnpaidAmount = unpaidInvoices.reduce((acc, curr) => acc + curr.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome with Quick Actions */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-medium text-slate-900">Operations Control Center</h1>
          <p className="mt-1 text-xs font-normal text-slate-500">
            Algotricz internal workflow metrics, pending client actions, and live delivery feed.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="quick-view-gantt-btn"
            type="button"
            onClick={() => onNavigate('timeline')}
            className="flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50"
          >
            <CalendarRange className="h-3.5 w-3.5 text-slate-600" />
            Gantt Timeline
          </button>
          <button
            id="quick-add-client-btn"
            type="button"
            onClick={onOpenCreateClient}
            className="flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Client
          </button>
          <button
            id="quick-create-proposal-btn"
            type="button"
            onClick={onOpenCreateProposal}
            className="flex items-center gap-1.5 rounded bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
          >
            <Plus className="h-3.5 w-3.5" />
            Draft Proposal
          </button>
        </div>
      </div>

      {/* 4 Core Focus Metrics Required by Architecture Spec */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Active Projects */}
        <div
          id="stat-active-projects"
          className="rounded-lg border border-slate-200 bg-white p-5 cursor-pointer hover:border-slate-300 transition-colors"
          onClick={() => onNavigate('projects')}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-normal text-slate-500 uppercase tracking-wider">
              Active Projects
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded bg-slate-100 text-slate-700">
              <FolderKanban className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-medium text-slate-900">{activeProjects.length}</span>
            <span className="text-xs font-normal text-slate-500">
              of {projects.length} total
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] font-normal text-blue-700">
            <span>Manage pipeline</span>
            <ArrowUpRight className="h-3 w-3" />
          </div>
        </div>

        {/* Metric 2: Overdue Tasks */}
        <div
          id="stat-overdue-tasks"
          className="rounded-lg border border-slate-200 bg-white p-5 cursor-pointer hover:border-slate-300 transition-colors"
          onClick={() => onNavigate('projects')}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-normal text-slate-500 uppercase tracking-wider">
              Overdue Tasks
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded bg-amber-50 text-amber-800">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-medium text-slate-900">{overdueTasks.length}</span>
            <span className="text-xs font-normal text-slate-500">
              action required
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] font-normal text-amber-800">
            <span>{overdueTasks.length === 0 ? 'All tasks on track' : 'Review assignments'}</span>
            <ArrowUpRight className="h-3 w-3" />
          </div>
        </div>

        {/* Metric 3: Unpaid Invoices */}
        <div
          id="stat-unpaid-invoices"
          className="rounded-lg border border-slate-200 bg-white p-5 cursor-pointer hover:border-slate-300 transition-colors"
          onClick={() => onNavigate('invoices')}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-normal text-slate-500 uppercase tracking-wider">
              Unpaid Invoices
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded bg-slate-100 text-slate-700">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-medium text-slate-900">{unpaidInvoices.length}</span>
            <span className="text-xs font-normal text-slate-500">
              (${totalUnpaidAmount.toLocaleString()} pending)
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] font-normal text-blue-700">
            <span>View Razorpay links</span>
            <ArrowUpRight className="h-3 w-3" />
          </div>
        </div>

        {/* Metric 4: Pending Proposal Responses */}
        <div
          id="stat-pending-proposals"
          className="rounded-lg border border-slate-200 bg-white p-5 cursor-pointer hover:border-slate-300 transition-colors"
          onClick={() => onNavigate('proposals')}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-normal text-slate-500 uppercase tracking-wider">
              Pending Proposals
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded bg-slate-100 text-slate-700">
              <FileClock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-medium text-slate-900">{pendingProposals.length}</span>
            <span className="text-xs font-normal text-slate-500">awaiting client action</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] font-normal text-blue-700">
            <span>Track responses</span>
            <ArrowUpRight className="h-3 w-3" />
          </div>
        </div>
      </div>

      {/* Main Grid: Projects in Flight + Activity Feed */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Active Projects Summary */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h2 className="text-sm font-medium text-slate-900">Current Client Deployments</h2>
            <button
              id="view-all-projects-btn"
              type="button"
              onClick={() => onNavigate('projects')}
              className="text-xs font-normal text-blue-700 hover:underline"
            >
              View all ({projects.length})
            </button>
          </div>

          <div className="space-y-3">
            {activeProjects.map((p) => {
              const client = clients.find((c) => c.id === p.clientId);
              const projectTasks = tasks.filter((t) => t.projectId === p.id);
              const doneTasks = projectTasks.filter((t) => t.status === 'done');
              const completionPercent =
                projectTasks.length > 0
                  ? Math.round((doneTasks.length / projectTasks.length) * 100)
                  : 0;

              return (
                <div
                  key={p.id}
                  id={`project-card-${p.id}`}
                  className="rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-normal text-slate-500">
                          {client?.companyName || 'Direct Client'}
                        </span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
                          {p.status}
                        </span>
                      </div>
                      <h3 className="mt-1 text-sm font-medium text-slate-900">{p.name}</h3>
                    </div>
                    <span className="text-xs font-normal text-slate-600">
                      Budget: ${p.budget.toLocaleString()}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-normal">
                    <span>
                      {doneTasks.length} of {projectTasks.length} tasks completed ({completionPercent}%)
                    </span>
                    {p.targetDate && <span>Target: {p.targetDate}</span>}
                  </div>

                  {/* Progress bar */}
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100">
                    <div
                      className="h-1.5 rounded-full bg-slate-800 transition-all"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pending Proposals Alert Block */}
          {pendingProposals.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileClock className="h-4 w-4 text-slate-700" />
                  <span className="text-xs font-medium text-slate-800">
                    Sent Proposals Awaiting Sign-off
                  </span>
                </div>
                <button
                  id="dashboard-proposals-link"
                  type="button"
                  onClick={() => onNavigate('proposals')}
                  className="text-xs font-normal text-blue-700 hover:underline"
                >
                  Open Proposals
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {pendingProposals.map((prop) => {
                  const client = clients.find((c) => c.id === prop.clientId);
                  return (
                    <div
                      key={prop.id}
                      className="flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-2 text-xs"
                    >
                      <div>
                        <p className="font-medium text-slate-800">{prop.title}</p>
                        <p className="font-normal text-slate-500">{client?.companyName}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-slate-900">
                          ${prop.totalAmount.toLocaleString()}
                        </span>
                        <p className="text-[10px] font-normal text-slate-500">
                          Sent {new Date(prop.sentAt || '').toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Live Activity Feed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-600" />
              <h2 className="text-sm font-medium text-slate-900">Real-time Activity Feed</h2>
            </div>
            <span className="text-[11px] font-normal text-slate-500">Event mesh</span>
          </div>

          <div
            id="activity-events-feed"
            className="max-h-[500px] space-y-2.5 overflow-y-auto pr-1"
          >
            {activity.length === 0 ? (
              <p className="p-4 text-center text-xs font-normal text-slate-500">
                No activity recorded yet
              </p>
            ) : (
              activity.map((act) => (
                <div
                  key={act.id}
                  id={`activity-event-${act.id}`}
                  className="rounded border border-slate-200 bg-white p-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900">{act.payload.title}</span>
                    <span className="text-[10px] font-normal text-slate-400">
                      {new Date(act.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="mt-1 font-normal text-slate-600 leading-relaxed">
                    {act.payload.description}
                  </p>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] font-normal text-slate-500">
                    <span>By: {act.payload.actorName}</span>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400">
                      {act.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
