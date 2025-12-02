import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, FileText } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "pending" | "processing" | "resolved" | "closed";
  resolution_note: string | null;
  created_at: string;
  attachments: string[];
  profiles: {
    name: string;
    email: string;
  } | null;
}

export default function ComplaintDetail() {
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<"pending" | "processing" | "resolved" | "closed">("pending");
  const [resolutionNote, setResolutionNote] = useState("");
  const { id } = useParams();
  const { profile, userRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const isAdmin = userRole?.role === "admin";

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    const { data, error } = await supabase
      .from("complaints")
      .select(`
        *,
        profiles:student_id (
          name,
          email
        )
      `)
      .eq("id", id)
      .single();

    if (!error && data) {
      setComplaint(data as any);
      setNewStatus(data.status);
      setResolutionNote(data.resolution_note || "");
    }
    setLoading(false);
  };

  const handleUpdate = async () => {
    if (!complaint) return;

    setUpdating(true);

    const oldStatus = complaint.status;

    const { error } = await supabase
      .rpc("update_complaint_status", {
        _complaint_id: complaint.id,
        _new_status: newStatus,
        _resolution_note: resolutionNote || null,
      });

    if (error) {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: "Failed to update complaint",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Complaint updated successfully",
      });
      
      // Send email notification
      if (complaint.profiles) {
        try {
          await supabase.functions.invoke('send-status-update-email', {
            body: {
              studentEmail: complaint.profiles.email,
              studentName: complaint.profiles.name,
              complaintTitle: complaint.title,
              oldStatus,
              newStatus,
              resolutionNote: resolutionNote || undefined,
            },
          });
        } catch (emailError) {
          console.error("Error sending email:", emailError);
        }
      }
      
      fetchComplaint();
    }

    setUpdating(false);
  };

  const handleBack = () => {
    navigate(isAdmin ? "/admin/dashboard" : "/student/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card shadow-soft">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-9 w-32" />
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-96 w-full" />
        </main>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Complaint not found</h2>
          <Button onClick={handleBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-6">
          <Card className="shadow-medium">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl">{complaint.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {complaint.category} • Submitted {format(new Date(complaint.created_at), "MMMM d, yyyy 'at' h:mm a")}
                  </CardDescription>
                </div>
                <StatusBadge status={complaint.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Student</Label>
                <p className="mt-1">{complaint.profiles?.name || 'Unknown'}</p>
                <p className="text-sm text-muted-foreground">{complaint.profiles?.email || 'N/A'}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="mt-1 whitespace-pre-wrap">{complaint.description}</p>
              </div>

              {complaint.attachments && complaint.attachments.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Attachments</Label>
                  <div className="mt-2 space-y-2">
                    {complaint.attachments.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                        Attachment {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {complaint.resolution_note && !isAdmin && (
                <div className="bg-muted p-4 rounded-lg">
                  <Label className="text-sm font-medium">Admin Response</Label>
                  <p className="mt-1 whitespace-pre-wrap">{complaint.resolution_note}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {isAdmin && (
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Update Complaint</CardTitle>
                <CardDescription>
                  Change the status and add resolution notes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={newStatus} onValueChange={(value) => setNewStatus(value as "pending" | "processing" | "resolved" | "closed")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Resolution Note</Label>
                  <Textarea
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    placeholder="Add details about the resolution or current status"
                    rows={4}
                  />
                </div>

                <Button
                  onClick={handleUpdate}
                  disabled={updating}
                  className="w-full"
                >
                  {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Complaint
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
