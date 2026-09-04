import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  FileText,
  Flag,
  Receipt,
  HelpCircle,
  Clock,
  ExternalLink,
  X,
} from 'lucide-react';
import { AppNotification } from '../../types';

interface ClientNotificationCenterProps {
  notifications: AppNotification[];
  recipientId: string;
  onMarkRead: (notificationId: string) => void;
  onMarkAllRead: (recipientId: string) => void;
  onNavigateTab?: (tab: string, targetId?: string) => void;
}

export const ClientNotificationCenter: React.FC<ClientNotificationCenterProps> = ({
  notifications = [],
  recipientId,
  onMarkRead,
  onMarkAllRead,
  onNavigateTab,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const safeNotifications = notifications || [];
  const unreadCount = safeNotifications.filter((n) => !n.read).length;
  const filteredNotifications = safeNotifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getIconForType = (type: AppNotification['type']) => {
    switch (type) {
      case 'proposal':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'milestone':
        return <Flag className="h-4 w-4 text-indigo-600" />;
      case 'invoice':
        return <Receipt className="h-4 w-4 text-emerald-600" />;
      case 'support':
        return <HelpCircle className="h-4 w-4 text-amber-600" />;
      default:
        return <Clock className="h-4 w-4 text-slate-600" />;
    }
  };

  const handleNotificationClick = (notif: AppNotification) => {
    if (!notif.read) {
      onMarkRead(notif.id);
    }
    if (onNavigateTab) {
      if (notif.type === 'proposal') {
        onNavigateTab('proposals');
      } else if (notif.type === 'milestone' || notif.type === 'project') {
        onNavigateTab('projects');
      } else if (notif.type === 'invoice') {
        onNavigateTab('invoices');
      } else if (notif.type === 'support') {
        onNavigateTab('support');
      }
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        id="client-notification-bell-btn"
        type="button"
        aria-label="Client notifications"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span
            id="client-unread-badge"
            className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-semibold text-white ring-2 ring-white animate-pulse"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          id="client-notifications-dropdown"
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white shadow-lg z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-800">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  id="client-mark-all-read-btn"
                  type="button"
                  onClick={() => onMarkAllRead(recipientId)}
                  className="flex items-center gap-1 text-[11px] font-medium text-blue-700 hover:text-blue-900"
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex border-b border-slate-100 px-4 py-1.5 gap-2 bg-white text-[11px]">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-2 py-0.5 rounded font-medium ${
                filter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`px-2 py-0.5 rounded font-medium ${
                filter === 'unread'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-8 w-8 text-slate-300 mx-auto stroke-1" />
                <p className="mt-2 text-xs font-medium text-slate-700">No notifications</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  You're all caught up on project updates and milestone sign-offs.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`group relative flex items-start gap-3 p-3.5 text-left transition-colors cursor-pointer hover:bg-slate-50 ${
                    !notif.read ? 'bg-blue-50/40' : 'bg-white'
                  }`}
                >
                  <div className="mt-0.5 shrink-0 rounded-lg border border-slate-200 bg-white p-2 shadow-2xs">
                    {getIconForType(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={`text-xs truncate ${
                          !notif.read ? 'font-semibold text-slate-950' : 'font-medium text-slate-800'
                        }`}
                      >
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(notif.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <p className="mt-0.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {notif.body}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] font-medium text-blue-700 group-hover:underline flex items-center gap-1">
                        View item <ExternalLink className="h-2.5 w-2.5" />
                      </span>

                      {!notif.read && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkRead(notif.id);
                          }}
                          className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 rounded bg-white px-1.5 py-0.5 border border-slate-200"
                        >
                          <Check className="h-2.5 w-2.5" /> Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
