import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface StatusUpdateRequest {
  studentEmail: string;
  studentName: string;
  complaintTitle: string;
  oldStatus: string;
  newStatus: string;
  resolutionNote?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      studentEmail, 
      studentName, 
      complaintTitle, 
      oldStatus, 
      newStatus,
      resolutionNote 
    }: StatusUpdateRequest = await req.json();

    console.log("Sending status update email to:", studentEmail);

    const statusColors: Record<string, string> = {
      pending: "#EAB308",
      processing: "#3B82F6",
      resolved: "#10B981",
      closed: "#6B7280",
    };

    const emailResponse = await resend.emails.send({
      from: "GenCorpus Complaint Portal <onboarding@resend.dev>",
      to: [studentEmail],
      subject: `Complaint Status Update: ${complaintTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 5px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
              .resolution { background: #e8f4f8; padding: 15px; border-radius: 5px; margin-top: 15px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Complaint Status Updated</h1>
              </div>
              <div class="content">
                <p>Dear ${studentName},</p>
                <p>Your complaint has been updated by an administrator.</p>
                
                <h2 style="color: #667eea;">Complaint Details</h2>
                <p><strong>Title:</strong> ${complaintTitle}</p>
                
                <p><strong>Status Change:</strong></p>
                <span class="status-badge" style="background: ${statusColors[oldStatus]}; color: white;">
                  ${oldStatus.toUpperCase()}
                </span>
                <span style="font-size: 20px;">→</span>
                <span class="status-badge" style="background: ${statusColors[newStatus]}; color: white;">
                  ${newStatus.toUpperCase()}
                </span>
                
                ${resolutionNote ? `
                  <div class="resolution">
                    <h3 style="margin-top: 0; color: #667eea;">Resolution Note:</h3>
                    <p>${resolutionNote}</p>
                  </div>
                ` : ''}
                
                <p style="margin-top: 30px;">
                  You can view your complaint details by logging into the portal.
                </p>
              </div>
              <div class="footer">
                <p>© 2025 GenCorpus Complaint Portal</p>
                <p>This is an automated notification. Please do not reply to this email.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-status-update-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);