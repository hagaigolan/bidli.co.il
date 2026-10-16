import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, Loader2, User, Phone, Smile } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import RegistrationBenefits from "@/components/RegistrationBenefits";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo } from "@/lib/authReturnTo";

// הרשמה: שם מלא, כינוי (אופציונלי), מייל, טלפון — עם אימות מייל בקוד OTP
export default function Register() {
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [agreed, setAgreed] = useState(false);

  const postRegisterUrl = safeReturnTo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!fullName.trim()) {
      setError("יש להזין שם מלא");
      return;
    }
    if (!email.trim()) {
      setError("יש להזין כתובת מייל");
      return;
    }
    if (!phone.trim() || !/^[0-9+\-\s]{9,}$/.test(phone.trim())) {
      setError("יש להזין מספר טלפון תקין");
      return;
    }
    if (password.length < 6) {
      setError("הסיסמה חייבת לכלול לפחות 6 תווים");
      return;
    }
    if (password !== confirmPassword) {
      setError("הסיסמאות אינן תואמות");
      return;
    }
    if (!agreed) {
      setError("יש לאשר את תנאי השימוש, מדיניות הפרטיות ואת היותך בן 18 ומעלה");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "ההרשמה נכשלה, נסה שנית");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
      }
      // שמירת הפרטים שמולאו בהרשמה על חשבון המשתמש
      try {
        await base44.auth.updateMe({
          full_name: fullName.trim(),
          phone: phone.trim(),
          ...(nickname.trim() ? { nickname: nickname.trim() } : {}),
        });
      } catch {}
      window.location.href = postRegisterUrl;
    } catch (err) {
      setError(err.message || "קוד האימות שגוי, נסה שנית");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({
        title: "הקוד נשלח",
        description: "קוד אימות חדש נשלח לכתובת המייל שלך.",
      });
    } catch (err) {
      setError(err.message || "שליחת הקוד נכשלה, נסה שנית");
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", postRegisterUrl);
  };

  if (showOtp) {
    return (
      <div dir="rtl">
        <AuthLayout
          icon={Mail}
          title="אימות המייל"
          subtitle={`שלחנו קוד בן 6 ספרות לכתובת ${email}`}
        >
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}
          <div className="flex justify-center mb-6" dir="ltr">
            <InputOTP
              maxLength={6}
              value={otpCode}
              onChange={setOtpCode}
              autoFocus
              autoComplete="one-time-code"
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
          <Button
            className="w-full h-12 font-medium"
            onClick={handleVerify}
            disabled={loading || otpCode.length < 6}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                מאמת...
              </>
            ) : (
              "אימות והמשך"
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground mt-4">
            לא קיבלת את הקוד?{" "}
            <button onClick={handleResend} className="text-primary font-medium hover:underline">
              שלח שוב
            </button>
          </p>
        </AuthLayout>
      </div>
    );
  }

  return (
    <div dir="rtl">
      <AuthLayout
        icon={UserPlus}
        title="יצירת חשבון"
        subtitle="הצטרפו כדי להגיש הצעות ולפרסם מכרזים"
        footer={
          <>
            כבר יש לכם חשבון?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              התחברות
            </Link>
          </>
        }
      >
        <Button
          variant="outline"
          className="w-full h-12 text-sm font-medium mb-6"
          onClick={handleGoogle}
        >
          <GoogleIcon className="w-5 h-5 mr-2" />
          המשך עם Google
        </Button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-3 text-muted-foreground">או</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">שם מלא *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="fullName"
                autoComplete="name"
                autoFocus
                placeholder="ישראל ישראלי"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nickname">כינוי (אופציונלי)</Label>
            <div className="relative">
              <Smile className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="nickname"
                placeholder="הכינוי שיוצג למשתמשים אחרים"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">מייל *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">טלפון *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="050-1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">סיסמה *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">אישור סיסמה *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>
          <div className="flex items-start space-x-2" dir="rtl">
            <input
              id="consent"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <label htmlFor="consent" className="text-xs text-muted-foreground leading-relaxed">
              אני מסכים/ה ל{" "}
              <Link to="/terms?tab=terms" className="text-primary font-medium hover:underline">תנאי השימוש</Link>
              {" "}ול{" "}
              <Link to="/terms?tab=privacy" className="text-primary font-medium hover:underline">מדיניות הפרטיות</Link>, ומאשר/ת כי הנני בן 18 ומעלה.
            </label>
          </div>
          <Button type="submit" className="w-full h-12 font-medium" disabled={loading || !agreed}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                יוצר חשבון...
              </>
            ) : (
              "יצירת חשבון"
            )}
          </Button>
        </form>
        <RegistrationBenefits />
      </AuthLayout>
    </div>
  );
}