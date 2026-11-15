import React from "react";
import { AlertTriangle, Bell, CheckCircle } from "lucide-react";

export const statusColor: Record<string, string> = {
  "Fully Vaccinated": "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60",
  "Partially Vaccinated": "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60",
  "Unvaccinated": "bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300 border border-red-200/60 dark:border-red-800/60",
  "Upcoming": "bg-blue-100 text-blue-800 dark:bg-sky-950/70 dark:text-sky-300 border border-blue-200/60 dark:border-sky-800/60",
  "Completed": "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60",
  "Missed": "bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300 border border-red-200/60 dark:border-red-800/60",
  "Rescheduled": "bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60",
};

export const notifIcon: Record<string, JSX.Element> = {
  alert: <AlertTriangle size={15} className="text-red-600 dark:text-red-400" />,
  warning: <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400" />,
  info: <Bell size={15} className="text-blue-600 dark:text-sky-400" />,
  success: <CheckCircle size={15} className="text-emerald-600 dark:text-emerald-400" />,
};
