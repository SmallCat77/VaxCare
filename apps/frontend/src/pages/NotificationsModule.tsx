import React from "react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Notification } from "../lib/types";
import { notifIcon } from "../lib/utils";

export function NotificationsModule({ notifications, onMarkRead, onMarkAllRead }: {
  notifications: Notification[]; onMarkRead: (id: string) => void; onMarkAllRead: () => void;
}) {
  const unread = notifications.filter(n => !n.read);

  const typeBg: Record<string, string> = {
    alert: "border-l-4 border-l-red-500 border border-red-200/80 bg-red-50 dark:bg-red-950/40 dark:border-red-900/60 dark:border-l-red-400",
    warning: "border-l-4 border-l-amber-500 border border-amber-200/80 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-900/60 dark:border-l-amber-400",
    info: "border-l-4 border-l-blue-500 border border-blue-200/80 bg-blue-50 dark:bg-sky-950/40 dark:border-sky-900/60 dark:border-l-sky-400",
    success: "border-l-4 border-l-emerald-500 border border-emerald-200/80 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:border-l-emerald-400",
  };

  return (
    <div>
      <SectionHeader title="Notifications & Alerts" subtitle={`${unread.length} unread notifications`} action={
        unread.length > 0 ? (
          <button onClick={onMarkAllRead} className="text-xs text-primary font-semibold hover:underline">Mark all as read</button>
        ) : undefined
      } />
      <div className="space-y-2.5">
        {notifications.map(n => (
          <div
            key={n.id}
            onClick={() => onMarkRead(n.id)}
            className={`rounded-lg p-4 cursor-pointer transition-all ${typeBg[n.type]} ${n.read ? "opacity-85" : "shadow-xs"}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{notifIcon[n.type]}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{n.title}</span>
                  <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-300 shrink-0">{n.time}</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-200 mt-1 leading-relaxed font-medium">{n.message}</p>
              </div>
              {!n.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
