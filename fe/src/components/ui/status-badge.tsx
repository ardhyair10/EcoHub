import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "VALIDATED" | "PENDING" | "COMPLETED" | "CANCELLED" | "REGISTERED" | "ATTENDED";
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  VALIDATED: {
    label: "Tervalidasi",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  PENDING: {
    label: "Menunggu",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  COMPLETED: {
    label: "Selesai",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  CANCELLED: {
    label: "Dibatalkan",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  REGISTERED: {
    label: "Terdaftar",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  ATTENDED: {
    label: "Hadir",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: "bg-slate-100 text-foreground" };
  
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

export default StatusBadge;
