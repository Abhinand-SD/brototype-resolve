import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { LogOut, Shield, Filter } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface Complaint {
  id: string;
  title: string;
  category: string;
  status: "pending" | "processing" | "resolved" | "closed";
  created_at: string;
  profiles: {
    name: string;
    email: string;
  };
}

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const { user, profile, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (userRole?.role !== "admin") {
      navigate("/student/dashboard");
      return;
    }

    fetchComplaints();
  }, [user, profile, navigate]);

  useEffect(() => {
    filterComplaints();
  }, [complaints, statusFilter, categoryFilter]);

  const fetchComplaints = async () => {
    const { data, error } = await supabase
      .from("complaints")
      .select(`
        *,
        profiles:student_id (
          name,
          email
        )
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setComplaints(data as any);
    }
    setLoading(false);
  };

  const filterComplaints = () => {
    let filtered = [...complaints];

    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((c) => c.category === categoryFilter);
    }

    setFilteredComplaints(filtered);
  };

  if (!profile) return null;

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === "pending").length,
    processing: complaints.filter((c) => c.status === "processing").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-soft sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-6">Complaint Management</h2>
          
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <div className="bg-card p-4 rounded-lg shadow-soft border">
              <p className="text-sm font-medium text-muted-foreground">Total</p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </div>
            <div className="bg-card p-4 rounded-lg shadow-soft border border-status-pending/30">
              <p className="text-sm font-medium text-status-pending">Pending</p>
              <p className="text-2xl font-bold mt-1">{stats.pending}</p>
            </div>
            <div className="bg-card p-4 rounded-lg shadow-soft border border-status-processing/30">
              <p className="text-sm font-medium text-status-processing">Processing</p>
              <p className="text-2xl font-bold mt-1">{stats.processing}</p>
            </div>
            <div className="bg-card p-4 rounded-lg shadow-soft border border-status-resolved/30">
              <p className="text-sm font-medium text-status-resolved">Resolved</p>
              <p className="text-2xl font-bold mt-1">{stats.resolved}</p>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Technical">Technical</SelectItem>
                <SelectItem value="Staff-Related">Staff-Related</SelectItem>
                <SelectItem value="Hostel">Hostel</SelectItem>
                <SelectItem value="Fees">Fees</SelectItem>
                <SelectItem value="Course Content">Course Content</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-lg shadow-soft border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComplaints.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No complaints found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredComplaints.map((complaint) => (
                    <TableRow
                      key={complaint.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/admin/complaint/${complaint.id}`)}
                    >
                      <TableCell className="font-medium">{complaint.title}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{complaint.profiles?.name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{complaint.profiles?.email || 'N/A'}</p>
                        </div>
                      </TableCell>
                      <TableCell>{complaint.category}</TableCell>
                      <TableCell>
                        <StatusBadge status={complaint.status} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(complaint.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
}
