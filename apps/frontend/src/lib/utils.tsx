import React from "react";
import { AlertTriangle, Bell, CheckCircle } from "lucide-react";

export const statusColor: Record<string, string> = {
  "Fully Vaccinated": "bg-emerald-100 text-emerald-700",
  "Partially Vaccinated": "bg-amber-100 text-amber-700",
  "Unvaccinated": "bg-red-100 text-red-600",
  "Upcoming": "bg-blue-100 text-blue-700",
  "Completed": "bg-emerald-100 text-emerald-700",
  "Missed": "bg-red-100 text-red-600",
  "Rescheduled": "bg-purple-100 text-purple-700",
};

export const notifIcon: Record<string, JSX.Element> = {
  alert: <AlertTriangle size={14} className="text-red-500" />,
  warning: <AlertTriangle size={14} className="text-amber-500" />,
  info: <Bell size={14} className="text-blue-500" />,
  success: <CheckCircle size={14} className="text-emerald-500" />,
};
