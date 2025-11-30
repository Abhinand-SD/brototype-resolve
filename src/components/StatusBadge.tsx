import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "pending" | "processing" | "resolved" | "closed";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    pending: {
      label: "Pending",
      className: "bg-status-pending/20 text-status-pending border-status-pending/30",
    },
    processing: {
      label: "Processing",
      className: "bg-status-processing/20 text-status-processing border-status-processing/30",
    },
    resolved: {
      label: "Resolved",
      className: "bg-status-resolved/20 text-status-resolved border-status-resolved/30",
    },
    closed: {
      label: "Closed",
      className: "bg-status-closed/20 text-status-closed border-status-closed/30",
    },
  };

  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
