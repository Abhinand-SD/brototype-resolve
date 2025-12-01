import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ComplaintCard } from "@/components/ComplaintCard";
import { Plus, LogOut, GraduationCap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "pending" | "processing" | "resolved" | "closed";
  created_at: string;
  attachments: string[];
}

export default function StudentDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (userRole?.role === "admin") {
      navigate("/admin/dashboard");
      return;
    }

    fetchComplaints();
  }, [user, profile, navigate]);

  const fetchComplaints = async () => {
    const { data, error } = await supabase
      .from("complaints")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setComplaints(data);
    }
    setLoading(false);
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-soft sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">GenCorpus Portal</h1>
                <p className="text-sm text-muted-foreground">{profile.name}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">My Complaints</h2>
            <p className="text-muted-foreground mt-1">
              Track and manage your submitted complaints
            </p>
          </div>
          <Button onClick={() => navigate("/student/new-complaint")}>
            <Plus className="h-4 w-4 mr-2" />
            New Complaint
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No complaints yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first complaint to get started
            </p>
            <Button onClick={() => navigate("/student/new-complaint")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Complaint
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {complaints.map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                onClick={() => navigate(`/student/complaint/${complaint.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
