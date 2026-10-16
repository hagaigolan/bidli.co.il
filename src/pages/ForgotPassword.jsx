import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

// איפוס סיסמה — שליחת קישור לאיפוס (עמוד עברי RTL)
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.auth.resetPasswordRequest(email);
    } catch {
      // Always show success regardless
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <div dir="rtl">
      <AuthLayout
        icon={Mail}
        title="איפוס סיסמה"
        subtitle="נשלח לך קישור לאיפוס הסיסמה"
        footer={
          <Link to="/login" className="text-primary font-medium hover:underline">
            <ArrowLeft className="w-3 h-3 inline ml-1" />חזרה להתחברות
          </Link>
        }
      >
        {sent ? (
          <p className="text-sm text-foreground text-center">
            אם קיים חשבון עם כתובת המייל שהזנת, יישלח אליך בקרוב קישור לאיפוס הסיסמה.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">כתובת מייל *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="you@example.com"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 text-right"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  שולח...
                </>
              ) : (
                "שלח קישור לאיפוס"
              )}
            </Button>
          </form>
        )}
      </AuthLayout>
    </div>
  );
}