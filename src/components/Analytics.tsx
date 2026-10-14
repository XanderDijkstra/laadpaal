import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

/*
 * Google Analytics 4 behind prior consent (Belgian GBA / ePrivacy). Nothing is loaded
 * from Google until the visitor clicks "Accepteren". The choice is kept in localStorage;
 * <CookieSettingsButton> on /privacy clears it so the banner shows again.
 */
const GA_ID = "G-ZN9DG872XK";
const KEY = "lt-cookie-consent";
const REOPEN = "lt-cookie-settings";

type Choice = "granted" | "denied" | null;

type GtagWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };

function loadGa() {
  if (document.getElementById("ga4-gtag")) return;
  const w = window as GtagWindow;
  w.dataLayer = w.dataLayer || [];
  w.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments);
  };
  w.gtag("js", new Date());
  w.gtag("config", GA_ID);
  const s = document.createElement("script");
  s.id = "ga4-gtag";
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
}

export function Analytics() {
  const [choice, setChoice] = useState<Choice | "unknown">("unknown");

  useEffect(() => {
    const read = () => setChoice((localStorage.getItem(KEY) as Choice) ?? null);
    read();
    window.addEventListener(REOPEN, read);
    return () => window.removeEventListener(REOPEN, read);
  }, []);

  useEffect(() => {
    if (choice === "granted") loadGa();
  }, [choice]);

  const decide = (value: "granted" | "denied") => {
    const revoking = value === "denied" && /(^|;\s*)_ga/.test(document.cookie);
    localStorage.setItem(KEY, value);
    if (revoking) {
      // Stop the running tag first (it rewrites _ga_* on activity), then drop the cookies and reload.
      (window as unknown as Record<string, boolean>)[`ga-disable-${GA_ID}`] = true;
      document.cookie
        .split(";")
        .map((c) => c.split("=")[0].trim())
        .filter((n) => n.startsWith("_ga"))
        .forEach((n) => {
          document.cookie = `${n}=; Max-Age=0; path=/; domain=.${location.hostname.replace(/^www\./, "")}`;
          document.cookie = `${n}=; Max-Age=0; path=/`;
        });
      location.reload();
      return;
    }
    setChoice(value);
  };

  if (choice !== null) return null;

  return (
    <div
      role="region"
      aria-label="Cookietoestemming"
      className="fixed z-50 inset-x-4 bottom-4 mx-auto max-w-2xl flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background p-4 text-sm shadow-lg"
    >
      <p className="flex-[1_1_280px] text-foreground">
        We gebruiken Google Analytics om te meten hoe de website gebruikt wordt. Dat gebeurt
        alleen als u dat toestaat.{" "}
        <Link to="/privacy" className="text-primary underline">
          Meer info
        </Link>
      </p>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => decide("denied")}>
          Weigeren
        </Button>
        <Button type="button" size="sm" onClick={() => decide("granted")}>
          Accepteren
        </Button>
      </div>
    </div>
  );
}

export function CookieSettingsButton() {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => {
        localStorage.removeItem(KEY);
        window.dispatchEvent(new Event(REOPEN));
      }}
    >
      Cookie-instellingen wijzigen
    </Button>
  );
}
