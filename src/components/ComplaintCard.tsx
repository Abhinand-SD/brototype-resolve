import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { format } from "date-fns";
import { FileText } from "lucide-react";

interface ComplaintCardProps {
  complaint: {
    id: string;
    title: string;
    description: string;
    category: string;
    status: "pending" | "processing" | "resolved" | "closed";
    created_at: string;
    attachments?: string[];
  };
  onClick?: () => void;
}

export function ComplaintCard({ complaint, onClick }: ComplaintCardProps) {
  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-medium hover:scale-[1.02] duration-200"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg">{complaint.title}</CardTitle>
            <CardDescription className="mt-1">
              {complaint.category} • {format(new Date(complaint.created_at), "MMM d, yyyy")}
            </CardDescription>
          </div>
          <StatusBadge status={complaint.status} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {complaint.description}
        </p>
        {complaint.attachments && complaint.attachments.length > 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            <span>{complaint.attachments.length} attachment(s)</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
