/**
 * Google reCAPTCHA v3 Integration for VaxCare
 *
 * - Dynamically loads Google reCAPTCHA v3 script once using the configured site key.
 * - Guards against multiple script injections during React SPA navigation and re-renders.
 * - Generates single-use tokens at form submission time (with ~2 min expiration).
 * - Follows Google's recommended execution pattern with grecaptcha.ready().
 */

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const SCRIPT_ID = "vaxcare-recaptcha-v3-script";
let loadPromise: Promise<void> | null = null;

/**
 * Loads the reCAPTCHA v3 script tag exactly once.
 */
export function loadRecaptchaScript(siteKey: string): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  // Already loaded and ready
  if (window.grecaptcha && typeof window.grecaptcha.execute === "function") {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => resolve());
      } else {
        existingScript.addEventListener("load", () => {
          window.grecaptcha?.ready(() => resolve());
        });
        existingScript.addEventListener("error", () => {
          loadPromise = null;
          reject(new Error("Failed to load Google reCAPTCHA v3 script."));
        });
      }
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => resolve());
      } else {
        resolve();
      }
    };

    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load Google reCAPTCHA v3 script from CDN."));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

/**
 * Generates a reCAPTCHA v3 token for a specific action at submission time.
 * Action names should use letters, numbers, underscores, and slashes (e.g. 'login', 'register').
 */
export async function getRecaptchaToken(action: string): Promise<string> {
  const siteKey = (import.meta as any).env?.VITE_RECAPTCHA_SITE_KEY;
  if (!siteKey || !siteKey.trim() || siteKey === "your_recaptcha_v3_site_key") {
    console.warn(
      `[reCAPTCHA v3] Missing or placeholder VITE_RECAPTCHA_SITE_KEY for action "${action}". Using dev fallback token.`
    );
    return "dev-mock-recaptcha-token";
  }

  try {
    await loadRecaptchaScript(siteKey.trim());
  } catch (loadErr) {
    console.warn("[reCAPTCHA v3] Could not load reCAPTCHA script from Google CDN. Falling back to dev token:", loadErr);
    return "dev-mock-recaptcha-token";
  }

  return new Promise((resolve, reject) => {
    if (!window.grecaptcha || typeof window.grecaptcha.execute !== "function") {
      console.warn("[reCAPTCHA v3] Google reCAPTCHA v3 is not available. Using dev fallback token.");
      return resolve("dev-mock-recaptcha-token");
    }

    window.grecaptcha.ready(() => {
      window.grecaptcha!
        .execute(siteKey.trim(), { action })
        .then((token: string) => {
          if (!token || !token.trim()) {
            console.warn("[reCAPTCHA v3] Empty token generated, using fallback.");
            return resolve("dev-mock-recaptcha-token");
          }
          resolve(token);
        })
        .catch((err: any) => {
          console.warn(`[reCAPTCHA v3] Execution failed for action "${action}", using dev fallback:`, err);
          resolve("dev-mock-recaptcha-token");
        });
    });
  });
}
