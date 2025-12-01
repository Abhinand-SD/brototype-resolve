import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Clock, CheckCircle2 } from "lucide-react";
import logo from "@/assets/logo.png";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="GenCorpus Logo" className="h-14 w-auto" />
          </div>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-5xl font-bold tracking-tight mb-4">
            Your Voice Matters
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Submit, track, and resolve complaints efficiently. Transparent communication between students and administration.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")}>
              Get Started
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="shadow-medium hover:shadow-strong transition-shadow">
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Easy Submission</h3>
              <p className="text-muted-foreground">
                Submit complaints with detailed descriptions and supporting documents in minutes
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-medium hover:shadow-strong transition-shadow">
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-lg bg-status-processing/10 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-status-processing" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Real-time Tracking</h3>
              <p className="text-muted-foreground">
                Monitor the status of your complaints from submission to resolution
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-medium hover:shadow-strong transition-shadow">
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-lg bg-status-resolved/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-status-resolved" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Fast Resolution</h3>
              <p className="text-muted-foreground">
                Get timely responses and solutions from our dedicated admin team
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-strong bg-gradient-to-br from-primary to-accent text-primary-foreground">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-3">Transparent. Efficient. Accessible.</h3>
            <p className="opacity-90 text-lg mb-6">
              Whether you're a student submitting a complaint or an administrator managing resolutions, our platform provides a seamless experience for everyone.
            </p>
            <Button size="lg" variant="secondary" onClick={() => navigate("/auth")}>
              Get Started Now
            </Button>
          </CardContent>
        </Card>
      </main>

      <footer className="container mx-auto px-4 py-8 mt-16 border-t">
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2024 GenCorpus Complaint Portal. Built for transparency and efficiency.</p>
        </div>
      </footer>
    </div>
  );
}
