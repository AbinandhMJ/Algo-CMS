import React, { useState } from 'react';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Plus,
  Calendar,
  FileText,
  Upload,
  MessageSquare,
  Activity,
  AlertCircle,
  Share2,
  ExternalLink,
  X,
  UserCheck,
} from 'lucide-react';
import {
  Project,
  Task,
  Milestone,
  ProjectFile,
  ProjectComment,
  ActivityEvent,
  Client,
  User,
  GoogleWorkspaceState,
} from '../../types';

interface ProjectsViewProps {
  projects: Project[];
  tasks: Task[];
  milestones: Milestone[];
  files: ProjectFile[];
  comments: ProjectComment[];
  activity: ActivityEvent[];
  clients: Client[];
  users: User[];
  googleWorkspace: GoogleWorkspaceState;
  initialSelectedProjectId?: string;
  onCreateProject: (data: {
    clientId: string;
    name: string;
    budget: number;
    description?: string;
    targetDate?: string;
  }) => void;
  onCreateTask: (data: {
    projectId: string;
    title: string;
    description?: string;
    assigneeId: string;
    dueDate: string;
    priority: Task['priority'];
  }) => void;
  onUpdateTaskStatus: (taskId: string, status: Task['status']) => void;
  onCreateMilestone: (data: {
    projectId: string;
    title: string;
    description: string;
    dueDate: string;
  }) => void;
  onSubmitMilestone: (milestoneId: string, notes: string) => void;
  onUploadFile: (data: {
    projectId: string;
    name: string;
    sizeBytes: number;
    mimeType: string;
    url: string;
    uploadedByUserId: string;
    uploadedByName: string;
  }) => void;
  onAddComment: (data: {
    projectId: string;
    authorType: 'internal';
    authorUserId: string;
    authorName: string;
    body: string;
  }) => void;
  onSyncMilestoneToCalendar?: (milestone: Milestone, project: Project) => void;
  onCreateProjectDriveFolder?: (project: Project) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  tasks,
  milestones,
  files,
  comments,
  activity,
  clients,
  users,
  googleWorkspace,
  initialSelectedProjectId,
  onCreateProject,
  onCreateTask,
  onUpdateTaskStatus,
  onCreateMilestone,
  onSubmitMilestone,
  onUploadFile,
  onAddComment,
  onSyncMilestoneToCalendar,
  onCreateProjectDriveFolder,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    initialSelectedProjectId || projects[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<
    'tasks' | 'milestones' | 'files' | 'comments' | 'activity'
  >('tasks');

  // Modals
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isNewMilestoneModalOpen, setIsNewMilestoneModalOpen] = useState(false);
  const [submittingMilestoneId, setSubmittingMilestoneId] = useState<string | null>(null);
  const [submitNotes, setSubmitNotes] = useState('');

  // Project form
  const [newClientTarget, setNewClientTarget] = useState(clients[0]?.id || '');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectBudget, setNewProjectBudget] = useState(15000);
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectTargetDate, setNewProjectTargetDate] = useState('2026-10-31');

  // Task form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignee, setTaskAssignee] = useState(users[0]?.id || '');
  const [taskDueDate, setTaskDueDate] = useState('2026-09-20');
  const [taskPriority, setTaskPriority] = useState<Task['priority']>('medium');

  // Milestone form
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDesc, setMilestoneDesc] = useState('');
  const [milestoneDueDate, setMilestoneDueDate] = useState('2026-10-15');

  // Comment input
  const [commentText, setCommentText] = useState('');

  // Selected project details
  const selectedProject =
    projects.find((p) => p.id === selectedProjectId) || projects[0] || null;
  const projectClient = clients.find((c) => c.id === selectedProject?.clientId);

  const projectTasks = tasks.filter((t) => t.projectId === selectedProject?.id);
  const projectMilestones = milestones.filter((m) => m.projectId === selectedProject?.id);
  const projectFiles = files.filter((f) => f.projectId === selectedProject?.id);
  const projectComments = comments.filter((c) => c.projectId === selectedProject?.id);
  const projectActivity = activity.filter((a) => a.projectId === selectedProject?.id);

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !newClientTarget) return;

    onCreateProject({
      clientId: newClientTarget,
      name: newProjectName.trim(),
      budget: Number(newProjectBudget) || 0,
      description: newProjectDesc.trim(),
      targetDate: newProjectTargetDate,
    });

    setNewProjectName('');
    setNewProjectDesc('');
    setIsNewProjectModalOpen(false);
  };

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !selectedProject) return;

    onCreateTask({
      projectId: selectedProject.id,
      title: taskTitle.trim(),
      description: taskDesc.trim(),
      assigneeId: taskAssignee,
      dueDate: taskDueDate,
      priority: taskPriority,
    });

    setTaskTitle('');
    setTaskDesc('');
    setIsNewTaskModalOpen(false);
  };

  const handleCreateMilestoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle.trim() || !selectedProject) return;

    onCreateMilestone({
      projectId: selectedProject.id,
      title: milestoneTitle.trim(),
      description: milestoneDesc.trim(),
      dueDate: milestoneDueDate,
    });

    setMilestoneTitle('');
    setMilestoneDesc('');
    setIsNewMilestoneModalOpen(false);
  };

  const handleConfirmSubmitMilestone = () => {
    if (!submittingMilestoneId) return;
    onSubmitMilestone(submittingMilestoneId, submitNotes.trim() || 'Ready for client sign-off.');
    setSubmittingMilestoneId(null);
    setSubmitNotes('');
  };

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProject) return;

    onUploadFile({
      projectId: selectedProject.id,
      name: file.name,
      sizeBytes: file.size,
      mimeType: file.type || 'application/octet-stream',
      url: URL.createObjectURL(file),
      uploadedByUserId: users[0]?.id || 'internal-admin',
      uploadedByName: users[0]?.name || 'Devon Vance (Algotricz)',
    });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedProject) return;

    onAddComment({
      projectId: selectedProject.id,
      authorType: 'internal',
      authorUserId: users[0]?.id || 'internal-user',
      authorName: users[0]?.name || 'Devon Vance',
      body: commentText.trim(),
    });

    setCommentText('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-medium text-slate-900">Project Delivery Console</h1>
          <p className="mt-1 text-xs font-normal text-slate-500">
            Internal management for tasks, client milestones, cloud deliverables, and live activity streams.
          </p>
        </div>
        <button
          id="open-create-manual-project-btn"
          type="button"
          onClick={() => setIsNewProjectModalOpen(true)}
          className="flex items-center gap-1.5 rounded bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
        >
          <Plus className="h-3.5 w-3.5" />
          Onboard Project Directly
        </button>
      </div>

      {/* Project Selector Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {projects.map((p) => {
          const client = clients.find((c) => c.id === p.clientId);
          const isSelected = p.id === selectedProject?.id;

          return (
            <button
              key={p.id}
              id={`select-project-tab-${p.id}`}
              type="button"
              onClick={() => setSelectedProjectId(p.id)}
              className={`flex items-center gap-2 rounded border px-3.5 py-2 text-xs transition-colors whitespace-nowrap ${
                isSelected
                  ? 'border-slate-900 bg-white font-medium text-slate-900 shadow-xs'
                  : 'border-slate-200 bg-slate-50 font-normal text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <FolderKanban className="h-3.5 w-3.5 text-slate-500" />
              <span>{p.name}</span>
              <span className="text-[10px] text-slate-400">({client?.companyName})</span>
            </button>
          );
        })}
      </div>

      {selectedProject ? (
        <div className="space-y-6">
          {/* Selected Project Overview Card */}
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-normal text-slate-500">
                    Client: <span className="font-medium text-slate-800">{projectClient?.companyName}</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-[10px] text-slate-700">
                    {selectedProject.status}
                  </span>
                  {selectedProject.proposalId && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] font-normal text-slate-500">
                        Proposal Converted
                      </span>
                    </>
                  )}
                </div>
                <h2 className="mt-1 text-base font-medium text-slate-900">
                  {selectedProject.name}
                </h2>
                <p className="mt-1 text-xs font-normal text-slate-600">
                  {selectedProject.description || 'Project initiated and tracking milestone deliverables.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {onCreateProjectDriveFolder && (
                  <button
                    id="project-drive-folder-btn"
                    type="button"
                    onClick={() => onCreateProjectDriveFolder(selectedProject)}
                    className="flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Share2 className="h-3.5 w-3.5 text-slate-500" />
                    <span>Create Drive Folder</span>
                  </button>
                )}
                <div className="rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-right text-xs">
                  <span className="block text-[10px] font-normal text-slate-500">Allocated Budget</span>
                  <span className="font-medium text-slate-900">
                    ${selectedProject.budget.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Inner Project Sub-tabs */}
            <div className="mt-5 flex border-b border-slate-200 text-xs">
              <button
                id="tab-project-tasks"
                type="button"
                onClick={() => setActiveTab('tasks')}
                className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 transition-colors ${
                  activeTab === 'tasks'
                    ? 'border-slate-900 font-medium text-slate-900'
                    : 'border-transparent font-normal text-slate-500 hover:text-slate-800'
                }`}
              >
                Tasks ({projectTasks.length})
              </button>
              <button
                id="tab-project-milestones"
                type="button"
                onClick={() => setActiveTab('milestones')}
                className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 transition-colors ${
                  activeTab === 'milestones'
                    ? 'border-slate-900 font-medium text-slate-900'
                    : 'border-transparent font-normal text-slate-500 hover:text-slate-800'
                }`}
              >
                Milestones ({projectMilestones.length})
              </button>
              <button
                id="tab-project-files"
                type="button"
                onClick={() => setActiveTab('files')}
                className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 transition-colors ${
                  activeTab === 'files'
                    ? 'border-slate-900 font-medium text-slate-900'
                    : 'border-transparent font-normal text-slate-500 hover:text-slate-800'
                }`}
              >
                Deliverables & Files ({projectFiles.length})
              </button>
              <button
                id="tab-project-comments"
                type="button"
                onClick={() => setActiveTab('comments')}
                className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 transition-colors ${
                  activeTab === 'comments'
                    ? 'border-slate-900 font-medium text-slate-900'
                    : 'border-transparent font-normal text-slate-500 hover:text-slate-800'
                }`}
              >
                Comments ({projectComments.length})
              </button>
              <button
                id="tab-project-activity"
                type="button"
                onClick={() => setActiveTab('activity')}
                className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 transition-colors ${
                  activeTab === 'activity'
                    ? 'border-slate-900 font-medium text-slate-900'
                    : 'border-transparent font-normal text-slate-500 hover:text-slate-800'
                }`}
              >
                Activity Feed ({projectActivity.length})
              </button>
            </div>
          </div>

          {/* TAB 1: Tasks (Kanban / Columns) */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-normal text-slate-500">
                  Manage engineering tasks and status assignments
                </span>
                <button
                  id="open-create-task-btn"
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(true)}
                  className="flex items-center gap-1.5 rounded bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Task
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {(['todo', 'in_progress', 'review', 'done'] as Task['status'][]).map((colStatus) => {
                  const columnTasks = projectTasks.filter((t) => t.status === colStatus);
                  const columnLabels: Record<Task['status'], string> = {
                    todo: 'To Do',
                    in_progress: 'In Progress',
                    review: 'Under Review',
                    done: 'Completed',
                  };

                  return (
                    <div
                      key={colStatus}
                      className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="text-xs font-medium text-slate-800">
                          {columnLabels[colStatus]}
                        </span>
                        <span className="rounded bg-slate-200 px-1.5 py-0.2 text-[10px] font-normal text-slate-700">
                          {columnTasks.length}
                        </span>
                      </div>

                      <div className="mt-3 space-y-2.5">
                        {columnTasks.length === 0 ? (
                          <div className="py-6 text-center text-[11px] font-normal text-slate-400">
                            No tasks
                          </div>
                        ) : (
                          columnTasks.map((task) => {
                            const assignee = users.find((u) => u.id === task.assigneeId);
                            return (
                              <div
                                key={task.id}
                                id={`task-card-${task.id}`}
                                className="rounded border border-slate-200 bg-white p-3 shadow-xs text-xs"
                              >
                                <div className="flex items-start justify-between">
                                  <span
                                    className={`rounded px-1.5 py-0.5 text-[9px] font-medium uppercase ${
                                      task.priority === 'high'
                                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {task.priority}
                                  </span>
                                  <select
                                    value={task.status}
                                    onChange={(e) =>
                                      onUpdateTaskStatus(
                                        task.id,
                                        e.target.value as Task['status']
                                      )
                                    }
                                    className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-normal text-slate-600"
                                  >
                                    <option value="todo">To Do</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="review">Review</option>
                                    <option value="done">Done</option>
                                  </select>
                                </div>

                                <p className="mt-2 font-medium text-slate-900 leading-snug">
                                  {task.title}
                                </p>

                                {task.description && (
                                  <p className="mt-1 font-normal text-slate-500 text-[11px] line-clamp-2">
                                    {task.description}
                                  </p>
                                )}

                                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] font-normal text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <UserCheck className="h-3 w-3 text-slate-400" />
                                    {assignee?.name || 'Unassigned'}
                                  </span>
                                  <span>{task.dueDate}</span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Milestones & Approvals */}
          {activeTab === 'milestones' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-normal text-slate-500">
                  Deliverable milestones with client sign-off gate & Google Calendar sync
                </span>
                <button
                  id="open-create-milestone-btn"
                  type="button"
                  onClick={() => setIsNewMilestoneModalOpen(true)}
                  className="flex items-center gap-1.5 rounded bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Define Milestone
                </button>
              </div>

              <div className="space-y-3">
                {projectMilestones.map((m) => (
                  <div
                    key={m.id}
                    id={`milestone-row-${m.id}`}
                    className="rounded-lg border border-slate-200 bg-white p-4"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                              m.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : m.status === 'submitted'
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : m.status === 'changes_requested'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            Status: {m.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-xs font-normal text-slate-500">
                            Due: {m.dueDate}
                          </span>
                        </div>
                        <h3 className="mt-1 text-sm font-medium text-slate-900">{m.title}</h3>
                        <p className="mt-1 text-xs font-normal text-slate-600 leading-relaxed">
                          {m.description}
                        </p>
                        {m.reviewNotes && (
                          <div className="mt-2 rounded border border-slate-200 bg-slate-50 p-2.5 text-xs">
                            <span className="font-medium text-slate-800">Review Note:</span>{' '}
                            <span className="font-normal text-slate-600">{m.reviewNotes}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {onSyncMilestoneToCalendar && (
                          <button
                            id={`sync-cal-btn-${m.id}`}
                            type="button"
                            onClick={() => onSyncMilestoneToCalendar(m, selectedProject)}
                            className="flex items-center gap-1.5 rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <Calendar className="h-3.5 w-3.5 text-slate-500" />
                            Sync to Calendar
                          </button>
                        )}

                        {m.status === 'pending' || m.status === 'changes_requested' ? (
                          <button
                            id={`submit-milestone-btn-${m.id}`}
                            type="button"
                            onClick={() => setSubmittingMilestoneId(m.id)}
                            className="flex items-center gap-1 rounded bg-blue-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-800"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Submit to Client
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Deliverables & Files */}
          {activeTab === 'files' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-normal text-slate-500">
                  Project documents, contracts, and deliverable bundles
                </span>
                <label className="flex cursor-pointer items-center gap-1.5 rounded bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload Deliverable</span>
                  <input
                    type="file"
                    onChange={handleSimulatedFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50 font-medium text-slate-700">
                    <tr>
                      <th className="px-4 py-2.5 text-left">Document / File Name</th>
                      <th className="px-4 py-2.5 text-left">Uploaded By</th>
                      <th className="px-4 py-2.5 text-left">Date</th>
                      <th className="px-4 py-2.5 text-right">Size</th>
                      <th className="px-4 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                    {projectFiles.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400">
                          No files uploaded for this project yet.
                        </td>
                      </tr>
                    ) : (
                      projectFiles.map((f) => (
                        <tr key={f.id}>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-slate-400" />
                              <span className="font-medium text-slate-900">{f.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-slate-600">{f.uploadedByName}</td>
                          <td className="px-4 py-2.5 text-slate-500">
                            {new Date(f.uploadedAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-slate-500">
                            {(f.sizeBytes / 1024).toFixed(1)} KB
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <a
                              href={f.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-700 hover:underline"
                            >
                              Download
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: Comments */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <form onSubmit={handleCommentSubmit} className="space-y-3">
                  <textarea
                    id="internal-comment-input"
                    rows={2}
                    placeholder="Post an internal comment or project update..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full rounded border border-slate-300 p-2.5 text-xs font-normal text-slate-800"
                  />
                  <div className="flex justify-end">
                    <button
                      id="post-internal-comment-btn"
                      type="submit"
                      disabled={!commentText.trim()}
                      className="rounded bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-40"
                    >
                      Post Comment
                    </button>
                  </div>
                </form>
              </div>

              <div className="space-y-2.5">
                {projectComments.length === 0 ? (
                  <p className="py-6 text-center text-xs font-normal text-slate-400">
                    No comments recorded on this project yet.
                  </p>
                ) : (
                  projectComments.map((comm) => (
                    <div
                      key={comm.id}
                      className="rounded border border-slate-200 bg-white p-3.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">{comm.authorName}</span>
                          <span
                            className={`rounded px-1.5 py-0.2 text-[10px] font-normal ${
                              comm.authorType === 'client'
                                ? 'bg-blue-50 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {comm.authorType === 'client' ? 'Client' : 'Algotricz Team'}
                          </span>
                        </div>
                        <span className="text-[10px] font-normal text-slate-400">
                          {new Date(comm.createdAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="mt-1.5 font-normal text-slate-700 leading-relaxed">
                        {comm.body}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: Activity Feed */}
          {activeTab === 'activity' && (
            <div className="space-y-3">
              {projectActivity.length === 0 ? (
                <p className="py-6 text-center text-xs font-normal text-slate-400">
                  No activity events recorded for this project yet.
                </p>
              ) : (
                projectActivity.map((act) => (
                  <div
                    key={act.id}
                    className="rounded border border-slate-200 bg-white p-3.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900">{act.payload.title}</span>
                      <span className="text-[10px] font-normal text-slate-400">
                        {new Date(act.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 font-normal text-slate-600">{act.payload.description}</p>
                    <p className="mt-1 text-[10px] font-normal text-slate-400">
                      Actor: {act.payload.actorName}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-300 p-6 text-center text-xs font-normal text-slate-500">
          No projects available. Create a project above or accept a proposal.
        </div>
      )}

      {/* Modal: Create Manual Project (proposalId is nullable per spec) */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-sm font-medium text-slate-900">
                Onboard Project Manually (Direct Contract)
              </h2>
              <button
                type="button"
                onClick={() => setIsNewProjectModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProjectSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-normal text-slate-700">Client *</label>
                <select
                  value={newClientTarget}
                  onChange={(e) => setNewClientTarget(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-1.5 font-normal text-slate-800"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-normal text-slate-700">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Telemetry Edge Cluster"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 font-normal text-slate-800"
                />
              </div>

              <div>
                <label className="block font-normal text-slate-700">Budget (USD)</label>
                <input
                  type="number"
                  min="0"
                  value={newProjectBudget}
                  onChange={(e) => setNewProjectBudget(Number(e.target.value))}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block font-normal text-slate-700">Target Delivery Date</label>
                <input
                  type="date"
                  value={newProjectTargetDate}
                  onChange={(e) => setNewProjectTargetDate(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 font-normal text-slate-800"
                />
              </div>

              <div>
                <label className="block font-normal text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 font-normal text-slate-800"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="rounded border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-slate-900 px-4 py-1.5 font-medium text-white hover:bg-slate-800"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Task */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-sm font-medium text-slate-900">Add Project Task</h2>
              <button
                type="button"
                onClick={() => setIsNewTaskModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTaskSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-normal text-slate-700">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement HMAC signature verify"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 font-normal text-slate-800"
                />
              </div>

              <div>
                <label className="block font-normal text-slate-700">Assignee</label>
                <select
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-1.5 font-normal text-slate-800"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-normal text-slate-700">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 font-normal text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-normal text-slate-700">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as Task['priority'])}
                    className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-1.5 font-normal text-slate-800"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-normal text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 font-normal text-slate-800"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="rounded border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-slate-900 px-4 py-1.5 font-medium text-white hover:bg-slate-800"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Milestone */}
      {isNewMilestoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-sm font-medium text-slate-900">Define Project Milestone</h2>
              <button
                type="button"
                onClick={() => setIsNewMilestoneModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMilestoneSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-normal text-slate-700">Milestone Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Milestone 2: Beta Streaming Engine"
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 font-normal text-slate-800"
                />
              </div>

              <div>
                <label className="block font-normal text-slate-700">Due Date</label>
                <input
                  type="date"
                  value={milestoneDueDate}
                  onChange={(e) => setMilestoneDueDate(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 font-normal text-slate-800"
                />
              </div>

              <div>
                <label className="block font-normal text-slate-700">Milestone Scope & Success Criteria</label>
                <textarea
                  rows={3}
                  required
                  value={milestoneDesc}
                  onChange={(e) => setMilestoneDesc(e.target.value)}
                  placeholder="Explicit conditions required for client sign-off..."
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 font-normal text-slate-800"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewMilestoneModalOpen(false)}
                  className="rounded border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-slate-900 px-4 py-1.5 font-medium text-white hover:bg-slate-800"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Submit Milestone to Client */}
      {submittingMilestoneId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-medium text-slate-900">
              Submit Milestone for Client Sign-off
            </h2>
            <p className="mt-1 text-xs font-normal text-slate-600">
              This will notify the client representative and open the milestone for their formal approval or revision notes in their portal.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-normal text-slate-700">
                Review Notes & Verification Links
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Staging sandbox deployed at https://staging.apexfin.algotricz.io with credentials sent via encrypted channel..."
                value={submitNotes}
                onChange={(e) => setSubmitNotes(e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 p-2 text-xs font-normal text-slate-800"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSubmittingMilestoneId(null)}
                className="rounded border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmitMilestone}
                className="rounded bg-blue-700 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-800"
              >
                Submit Milestone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
