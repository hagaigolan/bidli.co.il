import React from "react";
import { Icon } from 'lucide-react';

export default function AuthLayout({ icon: Icon, logo, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          {logo ? (
            <div className="mb-4">
              <img src={logo} alt="bidli.co.il" className="h-16 w-auto object-contain mx-auto" />
              <div className="flex items-baseline justify-center gap-2 mt-2">
                <span className="text-2xl font-black text-foreground tracking-tight">בידלי</span>
                <span className="text-sm font-semibold text-muted-foreground" dir="ltr">bidli.co.il</span>
              </div>
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4">
              <Icon className="w-7 h-7 text-primary-foreground" aria-hidden="true" />
            </div>
          )}
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
        </div>
        <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
          {children}
        </div>
        {footer && (
          <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>
        )}
      </div>
    </div>
  );
}