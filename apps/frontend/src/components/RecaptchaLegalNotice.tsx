import React from "react";

export function RecaptchaLegalNotice({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[11px] text-muted-foreground/80 text-center leading-relaxed ${className}`}>
      This site is protected by reCAPTCHA and the Google{" "}
      <a
        href="https://policies.google.com/privacy"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-primary transition-colors"
      >
        Privacy Policy
      </a>{" "}
      and{" "}
      <a
        href="https://policies.google.com/terms"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-primary transition-colors"
      >
        Terms of Service
      </a>{" "}
      apply.
    </p>
  );
}

export default RecaptchaLegalNotice;
