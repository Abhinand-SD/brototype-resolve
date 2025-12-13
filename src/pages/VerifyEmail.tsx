import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Mail, Loader2, CheckCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function VerifyEmail() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  
  // Get email from localStorage (set during signup) or from user object
  const email = localStorage.getItem("pendingVerificationEmail") || user?.email;

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Redirect if already verified (check profile.email_verified)
  useEffect(() => {
    if (profile?.email_verified) {
      localStorage.removeItem("pendingVerificationEmail");
      navigate("/student/dashboard");
    }
  }, [profile, navigate]);

  const handleVerifyOTP = async () => {
    if (!email || otp.length !== 6) return;
    
    setIsVerifying(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, code: otp }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Verification failed",
          description: data.error || "Invalid or expired code",
          variant: "destructive",
        });
      } else {
        setIsVerified(true);
        toast({
          title: "Email verified!",
          description: "Your account is now active. Redirecting...",
        });
        localStorage.removeItem("pendingVerificationEmail");
        
        // Wait a moment then redirect
        setTimeout(() => {
          window.location.href = "/student/dashboard";
        }, 2000);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email || cooldown > 0) return;
    
    setIsResending(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-verification-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (response.ok) {
        setCooldown(30);
        toast({
          title: "Code sent!",
          description: "Check your email for the new verification code",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to resend verification code",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to resend verification code",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleSignOut = async () => {
    localStorage.removeItem("pendingVerificationEmail");
    await signOut();
    navigate("/auth");
  };

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-center">Email Verified!</h2>
              <p className="text-muted-foreground text-center">
                Redirecting to your dashboard...
              </p>
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a 6-digit code to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Enter the verification code from your email
            </p>
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={handleVerifyOTP} 
              className="w-full"
              disabled={otp.length !== 6 || isVerifying}
            >
              {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Email
            </Button>
            <Button 
              onClick={handleResendOTP} 
              variant="outline" 
              className="w-full"
              disabled={isResending || cooldown > 0}
            >
              {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {cooldown > 0 ? `Resend Code (${cooldown}s)` : "Resend Code"}
            </Button>
            <Button 
              onClick={handleSignOut} 
              variant="ghost" 
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
