import React from "react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Notification } from "../lib/types";
import { notifIcon } from "../lib/utils";

export function NotificationsModule({ notifications, onMarkRead, onMarkAllRead }: {
  notifications: Notification[]; onMarkRead: (id: string) => void; onMarkAllRead: () => void;
}) {
  const unread = notifications.filter(n => !n.read);

  const typeBg: Record<string, string> = {
    alert: "border-l-4 border-l-red-400 bg-red-50",
    warning: "border-l-4 border-l-amber-400 bg-amber-50",
    info: "border-l-4 border-l-blue-400 bg-blue-50",
    success: "border-l-4 border-l-emerald-400 bg-emerald-50",
  };

  return (
    <div>
      <SectionHeader title="Notifications & Alerts" subtitle={`${unread.length} unread notifications`} action={
        unread.length > 0 ? (
          <button onClick={onMarkAllRead} className="text-xs text-primary font-medium hover:underline">Mark all as read</button>
        ) : undefined
      } />
      <div className="space-y-2">
        {notifications.map(n => (
          <div key={n.id} onClick={() => onMarkRead(n.id)} className={`rounded-lg p-4 cursor-pointer transition-all ${typeBg[n.type]} ${n.read ? "opacity-60" : ""}`}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{notifIcon[n.type]}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{n.title}</span>
                  <span className="text-xs font-mono text-muted-foreground">{n.time}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.message}</p>
              </div>
              {!n.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
