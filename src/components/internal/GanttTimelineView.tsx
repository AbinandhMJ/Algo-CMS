import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import {
  CalendarRange,
  Layers,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  UserCheck,
  Plus,
  X,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { Project, Milestone, Task, Client, User, GoogleWorkspaceState } from '../../types';

interface GanttTimelineViewProps {
  projects: Project[];
  milestones: Milestone[];
  tasks: Task[];
  clients: Client[];
  users: User[];
  googleWorkspace: GoogleWorkspaceState;
  onSyncMilestoneToCalendar?: (milestone: Milestone, project: Project) => void;
  onSubmitMilestone?: (milestoneId: string, notes: string) => void;
  onUpdateTaskStatus?: (taskId: string, status: Task['status']) => void;
  onCreateMilestone?: (data: { projectId: string; title: string; description: string; dueDate: string }) => void;
  onCreateTask?: (data: {
    projectId: string;
    title: string;
    description?: string;
    assigneeId: string;
    dueDate: string;
    priority: Task['priority'];
  }) => void;
}

type TimeScaleMode = 'all' | '60days' | 'month';

export const GanttTimelineView: React.FC<GanttTimelineViewProps> = ({
  projects,
  milestones,
  tasks,
  clients,
  users,
  googleWorkspace,
  onSyncMilestoneToCalendar,
  onSubmitMilestone,
  onUpdateTaskStatus,
  onCreateMilestone,
  onCreateTask,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [scaleMode, setScaleMode] = useState<TimeScaleMode>('all');
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    projects.forEach((p) => {
      initial[p.id] = true;
    });
    return initial;
  });

  const [selectedItem, setSelectedItem] = useState<{
    type: 'milestone' | 'task';
    milestone?: Milestone;
    task?: Task;
    project?: Project;
  } | null>(null);

  // Quick Create Modal states
  const [isNewMilestoneModalOpen, setIsNewMilestoneModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [targetProjectId, setTargetProjectId] = useState<string>(projects[0]?.id || '');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDueDate, setNewDueDate] = useState('2026-10-15');
  const [newPriority, setNewPriority] = useState<Task['priority']>('medium');
  const [newAssigneeId, setNewAssigneeId] = useState(users[0]?.id || '');

  // Filtered projects
  const displayProjects = useMemo(() => {
    if (selectedProjectId === 'all') return projects;
    return projects.filter((p) => p.id === selectedProjectId);
  }, [projects, selectedProjectId]);

  // Compute time domain using D3
  const timelineDomain = useMemo(() => {
    const today = new Date();
    let minDate = new Date(today);
    minDate.setDate(minDate.getDate() - 21); // 3 weeks ago baseline

    let maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 90); // 3 months ahead baseline

    // Scan all project target dates, milestone due dates, task due dates
    projects.forEach((p) => {
      if (p.createdAt) {
        const d = new Date(p.createdAt);
        if (d < minDate) minDate = d;
      }
      if (p.targetDate) {
        const d = new Date(p.targetDate);
        if (d > maxDate) maxDate = d;
      }
    });

    milestones.forEach((m) => {
      if (m.dueDate) {
        const d = new Date(m.dueDate);
        if (d < minDate) minDate = d;
        if (d > maxDate) maxDate = d;
      }
    });

    tasks.forEach((t) => {
      if (t.dueDate) {
        const d = new Date(t.dueDate);
        if (d < minDate) minDate = d;
        if (d > maxDate) maxDate = d;
      }
    });

    // Adjust based on scale mode
    if (scaleMode === 'month') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 14);
      return [startOfMonth, endOfMonth];
    } else if (scaleMode === '60days') {
      const start = new Date(today);
      start.setDate(start.getDate() - 7);
      const end = new Date(today);
      end.setDate(end.getDate() + 60);
      return [start, end];
    }

    // Add small buffer to ends
    const paddedMin = new Date(minDate);
    paddedMin.setDate(paddedMin.getDate() - 7);
    const paddedMax = new Date(maxDate);
    paddedMax.setDate(paddedMax.getDate() + 14);

    return [paddedMin, paddedMax];
  }, [projects, milestones, tasks, scaleMode]);

  // Timeline dimensions
  const timelineWidth = 960;
  const timeScale = useMemo(() => {
    return d3.scaleTime().domain(timelineDomain).range([0, timelineWidth]);
  }, [timelineDomain, timelineWidth]);

  // Generate month and week markers
  const monthIntervals = useMemo(() => {
    return d3.timeMonth.range(timelineDomain[0], timelineDomain[1]);
  }, [timelineDomain]);

  const weekIntervals = useMemo(() => {
    return d3.timeMonday.range(timelineDomain[0], timelineDomain[1]);
  }, [timelineDomain]);

  const toggleProjectExpand = (id: string) => {
    setExpandedProjects((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper date positioning
  const getXCoordinate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 0;
      return Math.max(0, Math.min(timelineWidth, timeScale(d)));
    } catch {
      return 0;
    }
  };

  const todayX = useMemo(() => {
    return Math.max(0, Math.min(timelineWidth, timeScale(new Date())));
  }, [timeScale, timelineWidth]);

  // Project progress computation
  const getProjectMetrics = (projId: string) => {
    const pMilestones = milestones.filter((m) => m.projectId === projId);
    const pTasks = tasks.filter((t) => t.projectId === projId);

    const approvedCount = pMilestones.filter((m) => m.status === 'approved').length;
    const completedTasks = pTasks.filter((t) => t.status === 'done').length;

    const totalWeight = pMilestones.length + pTasks.length;
    const completedWeight = approvedCount + completedTasks;

    const progressPct = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;

    return {
      milestonesCount: pMilestones.length,
      approvedMilestones: approvedCount,
      tasksCount: pTasks.length,
      doneTasks: completedTasks,
      progressPct,
    };
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col gap-4 rounded-md border border-slate-200 bg-white p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CalendarRange className="h-5 w-5 text-slate-700" />
            <h1 className="text-lg font-medium text-slate-900 tracking-tight">
              Project Timeline & Gantt Schedule
            </h1>
          </div>
          <p className="mt-1 text-xs font-normal text-slate-600">
            High-level cross-project milestone roadmap, deliverable deadlines, and task execution schedules.
          </p>
        </div>

        {/* Global Control Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setTargetProjectId(projects[0]?.id || '');
              setIsNewMilestoneModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Plus className="h-3.5 w-3.5 text-slate-500" />
            Add Milestone
          </button>
          <button
            type="button"
            onClick={() => {
              setTargetProjectId(projects[0]?.id || '');
              setIsNewTaskModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Task
          </button>
        </div>
      </div>

      {/* Filter and Scale Selector Bar */}
      <div className="flex flex-col gap-3 rounded-md border border-slate-200 bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="h-3.5 w-3.5" />
            <span className="font-medium">Filter Project:</span>
          </div>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 focus:border-slate-500 focus:outline-none"
          >
            <option value="all">All Projects ({projects.length})</option>
            {projects.map((p) => {
              const client = clients.find((c) => c.id === p.clientId);
              return (
                <option key={p.id} value={p.id}>
                  {p.name} ({client?.companyName || 'Client'})
                </option>
              );
            })}
          </select>
        </div>

        {/* Time Scale Mode */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Horizon:</span>
          <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={() => setScaleMode('all')}
              className={`rounded px-2.5 py-1 text-xs transition-colors ${
                scaleMode === 'all'
                  ? 'bg-white font-medium text-slate-900 shadow-xs'
                  : 'font-normal text-slate-600 hover:text-slate-900'
              }`}
            >
              Full Horizon
            </button>
            <button
              type="button"
              onClick={() => setScaleMode('60days')}
              className={`rounded px-2.5 py-1 text-xs transition-colors ${
                scaleMode === '60days'
                  ? 'bg-white font-medium text-slate-900 shadow-xs'
                  : 'font-normal text-slate-600 hover:text-slate-900'
              }`}
            >
              Next 60 Days
            </button>
            <button
              type="button"
              onClick={() => setScaleMode('month')}
              className={`rounded px-2.5 py-1 text-xs transition-colors ${
                scaleMode === 'month'
                  ? 'bg-white font-medium text-slate-900 shadow-xs'
                  : 'font-normal text-slate-600 hover:text-slate-900'
              }`}
            >
              Current Month
            </button>
          </div>
        </div>
      </div>

      {/* Legend & Status Guide */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 px-1">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-medium text-slate-700">Milestone Status:</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-emerald-600 border border-emerald-700" />
            <span className="text-slate-600">Approved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-blue-600 border border-blue-700" />
            <span className="text-slate-600">In Review</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-amber-500 border border-amber-600" />
            <span className="text-slate-600">Changes Requested</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-slate-400 border border-slate-500" />
            <span className="text-slate-600">Pending</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-6 rounded-xs bg-slate-800" />
            <span className="text-slate-600">Task Schedule</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-0.5 bg-red-600" />
            <span className="text-slate-600">Current Date (Today)</span>
          </div>
        </div>
      </div>

      {/* Main Gantt Grid Container */}
      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <div className="min-w-[1280px]">
          {/* Timeline Time Header */}
          <div className="flex border-b border-slate-200 bg-slate-50">
            {/* Left Label Column */}
            <div className="w-80 shrink-0 border-r border-slate-200 p-3 text-xs font-medium text-slate-600">
              Project & Deliverable Hierarchy
            </div>

            {/* Timeline Scales Header */}
            <div className="relative flex-1">
              {/* Month Scale Header */}
              <div className="flex border-b border-slate-200 text-xs font-medium text-slate-700">
                {monthIntervals.map((monthDate, idx) => {
                  const x = timeScale(monthDate);
                  const nextMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
                  const nextX = timeScale(nextMonth);
                  const width = Math.max(40, nextX - x);

                  return (
                    <div
                      key={idx}
                      className="border-r border-slate-200 py-1.5 px-2 text-center truncate"
                      style={{ width: `${(width / timelineWidth) * 100}%` }}
                    >
                      {d3.timeFormat('%B %Y')(monthDate)}
                    </div>
                  );
                })}
              </div>

              {/* Weeks / Days Scale Sub-header */}
              <div className="relative h-6 text-[10px] text-slate-500">
                {weekIntervals.map((weekDate, idx) => {
                  const x = timeScale(weekDate);
                  return (
                    <div
                      key={idx}
                      className="absolute top-1 -translate-x-1/2 border-l border-slate-200 pl-1"
                      style={{ left: `${(x / timelineWidth) * 100}%` }}
                    >
                      {d3.timeFormat('%d %b')(weekDate)}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Project Groups */}
          {displayProjects.map((project) => {
            const client = clients.find((c) => c.id === project.clientId);
            const pMilestones = milestones.filter((m) => m.projectId === project.id);
            const pTasks = tasks.filter((t) => t.projectId === project.id);
            const metrics = getProjectMetrics(project.id);
            const isExpanded = !!expandedProjects[project.id];

            // Project bar bounds
            const projectStart = project.createdAt
              ? new Date(project.createdAt)
              : timelineDomain[0];
            const projectTarget = project.targetDate
              ? new Date(project.targetDate)
              : timelineDomain[1];

            const pStartX = getXCoordinate(projectStart.toISOString());
            const pTargetX = getXCoordinate(projectTarget.toISOString());
            const pBarWidth = Math.max(24, pTargetX - pStartX);

            return (
              <div key={project.id} className="border-b border-slate-200 last:border-b-0">
                {/* Project Master Row */}
                <div className="flex items-center bg-slate-50/80 hover:bg-slate-100/60 transition-colors border-b border-slate-100">
                  {/* Left Project Info */}
                  <div className="w-80 shrink-0 border-r border-slate-200 p-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleProjectExpand(project.id)}
                        className="rounded p-0.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-xs font-medium text-slate-900 truncate">
                            {project.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="truncate">{client?.companyName}</span>
                          <span>•</span>
                          <span>{metrics.progressPct}% done</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project Timeline Track */}
                  <div className="relative flex-1 h-14 overflow-hidden">
                    {/* Background Week Grid Lines */}
                    {weekIntervals.map((wDate, idx) => {
                      const x = timeScale(wDate);
                      return (
                        <div
                          key={idx}
                          className="absolute top-0 bottom-0 border-r border-slate-100/80 pointer-events-none"
                          style={{ left: `${(x / timelineWidth) * 100}%` }}
                        />
                      );
                    })}

                    {/* Today Line */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-red-500/70 z-10 pointer-events-none"
                      style={{ left: `${(todayX / timelineWidth) * 100}%` }}
                    />

                    {/* Project Lifetime Span Bar */}
                    <div
                      className="absolute top-3.5 h-7 rounded-sm border border-slate-300 bg-white/90 shadow-xs flex items-center px-2 z-5 group cursor-pointer hover:border-slate-400"
                      style={{
                        left: `${(pStartX / timelineWidth) * 100}%`,
                        width: `${(pBarWidth / timelineWidth) * 100}%`,
                      }}
                      onClick={() =>
                        setSelectedItem({
                          type: 'milestone',
                          milestone: pMilestones[0],
                          project,
                        })
                      }
                    >
                      {/* Inner Progress Fill */}
                      <div
                        className="absolute inset-y-0 left-0 rounded-l-xs bg-slate-200/90 -z-1"
                        style={{ width: `${metrics.progressPct}%` }}
                      />
                      <div className="flex items-center justify-between w-full text-[11px] font-medium text-slate-800 truncate">
                        <span className="truncate">{project.name} Lifespan</span>
                        <span className="text-slate-500 text-[10px] ml-2 shrink-0">
                          Target: {project.targetDate || 'TBD'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-Items: Milestones & Tasks (Collapsible) */}
                {isExpanded && (
                  <div>
                    {/* Milestones Header & Rows */}
                    <div className="bg-slate-50/30">
                      <div className="flex items-center border-b border-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">
                        <div className="w-80 shrink-0 flex items-center gap-1.5 pl-6">
                          <Layers className="h-3.5 w-3.5 text-slate-400" />
                          <span>Milestones & Contract Gates ({pMilestones.length})</span>
                        </div>
                        <div className="text-slate-400 text-[10px]">
                          Click any milestone for sign-off details and Google Calendar sync
                        </div>
                      </div>

                      {pMilestones.length === 0 ? (
                        <div className="py-2.5 px-9 text-xs text-slate-400 italic">
                          No milestones configured for this project.
                        </div>
                      ) : (
                        pMilestones.map((m) => {
                          const mDueDate = new Date(m.dueDate);
                          const mTargetX = getXCoordinate(m.dueDate);
                          // Milestone span bar represents active review or lead-up
                          const mLeadDays = 14;
                          const mStart = new Date(mDueDate);
                          mStart.setDate(mStart.getDate() - mLeadDays);
                          const mStartX = getXCoordinate(mStart.toISOString());
                          const mBarWidth = Math.max(28, mTargetX - mStartX);

                          let statusBg = 'bg-slate-100 text-slate-700 border-slate-300';
                          let markerColor = 'bg-slate-500';
                          if (m.status === 'approved') {
                            statusBg = 'bg-emerald-50 text-emerald-800 border-emerald-300';
                            markerColor = 'bg-emerald-600';
                          } else if (m.status === 'submitted') {
                            statusBg = 'bg-blue-50 text-blue-800 border-blue-300';
                            markerColor = 'bg-blue-600';
                          } else if (m.status === 'changes_requested') {
                            statusBg = 'bg-amber-50 text-amber-800 border-amber-300';
                            markerColor = 'bg-amber-600';
                          }

                          return (
                            <div
                              key={m.id}
                              className="flex items-center border-b border-slate-100 hover:bg-slate-50/70 transition-colors"
                            >
                              {/* Left Milestone Metadata */}
                              <div className="w-80 shrink-0 border-r border-slate-200 p-2.5 pl-8">
                                <div className="flex items-center justify-between gap-1">
                                  <span
                                    className="text-xs font-medium text-slate-800 truncate cursor-pointer hover:text-slate-900 hover:underline"
                                    onClick={() =>
                                      setSelectedItem({
                                        type: 'milestone',
                                        milestone: m,
                                        project,
                                      })
                                    }
                                  >
                                    {m.title}
                                  </span>
                                  <span
                                    className={`shrink-0 rounded-xs px-1.5 py-0.5 text-[10px] font-medium border ${statusBg}`}
                                  >
                                    {m.status.replace('_', ' ')}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                  Due: {m.dueDate}
                                </div>
                              </div>

                              {/* Milestone Gantt Track */}
                              <div className="relative flex-1 h-9 overflow-hidden">
                                {/* Week lines */}
                                {weekIntervals.map((wDate, idx) => {
                                  const x = timeScale(wDate);
                                  return (
                                    <div
                                      key={idx}
                                      className="absolute top-0 bottom-0 border-r border-slate-100/70 pointer-events-none"
                                      style={{ left: `${(x / timelineWidth) * 100}%` }}
                                    />
                                  );
                                })}

                                {/* Today line */}
                                <div
                                  className="absolute top-0 bottom-0 w-0.5 bg-red-500/70 z-10 pointer-events-none"
                                  style={{ left: `${(todayX / timelineWidth) * 100}%` }}
                                />

                                {/* Milestone Schedule Bar */}
                                <div
                                  className={`absolute top-2 h-5 rounded-xs border text-[10px] flex items-center justify-between px-2 cursor-pointer z-5 shadow-2xs hover:brightness-95 transition-all ${statusBg}`}
                                  style={{
                                    left: `${(mStartX / timelineWidth) * 100}%`,
                                    width: `${(mBarWidth / timelineWidth) * 100}%`,
                                  }}
                                  onClick={() =>
                                    setSelectedItem({
                                      type: 'milestone',
                                      milestone: m,
                                      project,
                                    })
                                  }
                                >
                                  <span className="truncate font-medium">{m.title}</span>
                                  {/* Diamond End-Pin */}
                                  <div
                                    className={`h-2.5 w-2.5 rotate-45 shrink-0 ml-1.5 ${markerColor}`}
                                    title={`Due: ${m.dueDate}`}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Tasks Sub-Rows */}
                    <div className="bg-white">
                      <div className="flex items-center border-b border-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">
                        <div className="w-80 shrink-0 flex items-center gap-1.5 pl-6">
                          <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
                          <span>Tasks in Progress & Queued ({pTasks.length})</span>
                        </div>
                        <div className="text-slate-400 text-[10px]">
                          Task duration windows and assignee allocations
                        </div>
                      </div>

                      {pTasks.length === 0 ? (
                        <div className="py-2.5 px-9 text-xs text-slate-400 italic">
                          No tasks logged for this project.
                        </div>
                      ) : (
                        pTasks.map((t) => {
                          const assignee = users.find((u) => u.id === t.assigneeId);
                          const tDueDate = new Date(t.dueDate);
                          const tTargetX = getXCoordinate(t.dueDate);

                          // Estimated start: 7 days prior
                          const tStart = new Date(tDueDate);
                          tStart.setDate(tStart.getDate() - 7);
                          const tStartX = getXCoordinate(tStart.toISOString());
                          const tBarWidth = Math.max(24, tTargetX - tStartX);

                          let taskColor = 'bg-slate-800 text-white';
                          if (t.status === 'done') {
                            taskColor = 'bg-slate-400 text-white';
                          } else if (t.status === 'review') {
                            taskColor = 'bg-blue-700 text-white';
                          } else if (t.status === 'in_progress') {
                            taskColor = 'bg-slate-900 text-white';
                          }

                          return (
                            <div
                              key={t.id}
                              className="flex items-center border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                            >
                              {/* Left Task Metadata */}
                              <div className="w-80 shrink-0 border-r border-slate-200 p-2 pl-8">
                                <div className="flex items-center justify-between gap-1">
                                  <span
                                    className="text-xs font-normal text-slate-800 truncate cursor-pointer hover:underline"
                                    onClick={() =>
                                      setSelectedItem({
                                        type: 'task',
                                        task: t,
                                        project,
                                      })
                                    }
                                  >
                                    {t.title}
                                  </span>
                                  <span className="text-[10px] uppercase font-medium text-slate-500 bg-slate-100 px-1 py-0.5 rounded-xs shrink-0">
                                    {t.priority}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                  <span>{assignee ? assignee.name : 'Unassigned'}</span>
                                  <span>•</span>
                                  <span>Due: {t.dueDate}</span>
                                </div>
                              </div>

                              {/* Task Gantt Track */}
                              <div className="relative flex-1 h-8 overflow-hidden">
                                {weekIntervals.map((wDate, idx) => {
                                  const x = timeScale(wDate);
                                  return (
                                    <div
                                      key={idx}
                                      className="absolute top-0 bottom-0 border-r border-slate-100/60 pointer-events-none"
                                      style={{ left: `${(x / timelineWidth) * 100}%` }}
                                    />
                                  );
                                })}

                                <div
                                  className="absolute top-0 bottom-0 w-0.5 bg-red-500/70 z-10 pointer-events-none"
                                  style={{ left: `${(todayX / timelineWidth) * 100}%` }}
                                />

                                {/* Task Schedule Pill */}
                                <div
                                  className={`absolute top-1.5 h-4.5 rounded-xs text-[10px] flex items-center px-2 cursor-pointer z-5 shadow-2xs hover:opacity-90 ${taskColor}`}
                                  style={{
                                    left: `${(tStartX / timelineWidth) * 100}%`,
                                    width: `${(tBarWidth / timelineWidth) * 100}%`,
                                  }}
                                  onClick={() =>
                                    setSelectedItem({
                                      type: 'task',
                                      task: t,
                                      project,
                                    })
                                  }
                                >
                                  <span className="truncate font-medium">{t.title}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Item Details Drawer / Inspector Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-md border border-slate-300 bg-white p-6 shadow-md">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-medium text-slate-500">
                  {selectedItem.type === 'milestone' ? 'Milestone Inspector' : 'Task Details'}
                </span>
                <h3 className="text-base font-medium text-slate-900 mt-0.5">
                  {selectedItem.milestone?.title || selectedItem.task?.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="rounded p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 py-4 text-xs">
              <div className="grid grid-cols-2 gap-3 rounded-md bg-slate-50 p-3 border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 font-medium">Project</span>
                  <p className="text-slate-800 font-medium">{selectedItem.project?.name}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-medium">Due Date</span>
                  <p className="text-slate-800 font-medium">
                    {selectedItem.milestone?.dueDate || selectedItem.task?.dueDate}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-medium">Status</span>
                  <p className="text-slate-800 capitalize">
                    {selectedItem.milestone?.status.replace('_', ' ') ||
                      selectedItem.task?.status.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {selectedItem.type === 'milestone' ? 'Sign-Off Date' : 'Assignee'}
                  </span>
                  <p className="text-slate-800">
                    {selectedItem.type === 'milestone'
                      ? selectedItem.milestone?.approvedAt || 'Pending Review'
                      : users.find((u) => u.id === selectedItem.task?.assigneeId)?.name ||
                        'Unassigned'}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-medium">Description & Scope</span>
                <p className="mt-1 text-slate-700 leading-relaxed">
                  {selectedItem.milestone?.description ||
                    selectedItem.task?.description ||
                    'No detailed description provided.'}
                </p>
              </div>

              {selectedItem.milestone?.reviewNotes && (
                <div className="rounded-md border border-amber-200 bg-amber-50/60 p-3">
                  <span className="text-[10px] font-medium text-amber-900">Review Notes:</span>
                  <p className="mt-0.5 text-amber-800">{selectedItem.milestone.reviewNotes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
                {selectedItem.type === 'milestone' && selectedItem.milestone && (
                  <>
                    {selectedItem.milestone.status === 'pending' && onSubmitMilestone && (
                      <button
                        type="button"
                        onClick={() => {
                          onSubmitMilestone(
                            selectedItem.milestone!.id,
                            'Deliverables completed according to architectural spec.'
                          );
                          setSelectedItem(null);
                        }}
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                      >
                        Submit for Client Sign-off
                      </button>
                    )}

                    {onSyncMilestoneToCalendar && selectedItem.project && (
                      <button
                        type="button"
                        onClick={() => {
                          onSyncMilestoneToCalendar(
                            selectedItem.milestone!,
                            selectedItem.project!
                          );
                        }}
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        Sync to Google Calendar
                      </button>
                    )}
                  </>
                )}

                {selectedItem.type === 'task' && selectedItem.task && onUpdateTaskStatus && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-medium">Change Status:</span>
                    {(['todo', 'in_progress', 'review', 'done'] as Task['status'][]).map(
                      (st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => {
                            onUpdateTaskStatus(selectedItem.task!.id, st);
                            setSelectedItem(null);
                          }}
                          className={`rounded px-2 py-1 text-[11px] font-medium uppercase border ${
                            selectedItem.task?.status === st
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {st.replace('_', ' ')}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Milestone Modal */}
      {isNewMilestoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-md border border-slate-300 bg-white p-5 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-medium text-slate-900">Define Project Milestone</h3>
              <button
                type="button"
                onClick={() => setIsNewMilestoneModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newTitle.trim()) return;
                if (onCreateMilestone) {
                  onCreateMilestone({
                    projectId: targetProjectId,
                    title: newTitle,
                    description: newDesc,
                    dueDate: newDueDate,
                  });
                }
                setNewTitle('');
                setNewDesc('');
                setIsNewMilestoneModalOpen(false);
              }}
              className="space-y-3 pt-3 text-xs"
            >
              <div>
                <label className="block text-slate-700 font-medium mb-1">Target Project</label>
                <select
                  value={targetProjectId}
                  onChange={(e) => setTargetProjectId(e.target.value)}
                  className="w-full rounded-md border border-slate-300 p-2 text-xs font-normal"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Milestone Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Milestone 3: Telemetry Gateway Integration"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-md border border-slate-300 p-2 text-xs font-normal"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Scope Description</label>
                <textarea
                  rows={2}
                  placeholder="Deliverable details and validation checklist..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full rounded-md border border-slate-300 p-2 text-xs font-normal"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Target Due Date</label>
                <input
                  type="date"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full rounded-md border border-slate-300 p-2 text-xs font-normal"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewMilestoneModalOpen(false)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add Task Modal */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-md border border-slate-300 bg-white p-5 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-medium text-slate-900">Add Project Task</h3>
              <button
                type="button"
                onClick={() => setIsNewTaskModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newTitle.trim()) return;
                if (onCreateTask) {
                  onCreateTask({
                    projectId: targetProjectId,
                    title: newTitle,
                    description: newDesc,
                    assigneeId: newAssigneeId,
                    dueDate: newDueDate,
                    priority: newPriority,
                  });
                }
                setNewTitle('');
                setNewDesc('');
                setIsNewTaskModalOpen(false);
              }}
              className="space-y-3 pt-3 text-xs"
            >
              <div>
                <label className="block text-slate-700 font-medium mb-1">Project</label>
                <select
                  value={targetProjectId}
                  onChange={(e) => setTargetProjectId(e.target.value)}
                  className="w-full rounded-md border border-slate-300 p-2 text-xs font-normal"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement streaming rate-limiter"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-md border border-slate-300 p-2 text-xs font-normal"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Assignee</label>
                  <select
                    value={newAssigneeId}
                    onChange={(e) => setNewAssigneeId(e.target.value)}
                    className="w-full rounded-md border border-slate-300 p-2 text-xs font-normal"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as Task['priority'])}
                    className="w-full rounded-md border border-slate-300 p-2 text-xs font-normal"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full rounded-md border border-slate-300 p-2 text-xs font-normal"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
