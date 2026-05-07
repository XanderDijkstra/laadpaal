import { useEffect, useMemo, useState } from "react";
import { LogOut, RefreshCw, Search } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { usePageMeta } from "@/hooks/usePageMeta";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

interface Lead {
  id: number;
  created_at: string;
  status: string;
  tier: string | null;
  score: number | null;
  postcode: string | null;
  gemeente: string | null;
  voornaam: string | null;
  achternaam: string | null;
  email: string | null;
  telefoon: string | null;
  property: string | null;
  ev_status: string | null;
  urgency: string | null;
  vehicle_brand: string | null;
  brand_pref: string[];
  age_house: string | null;
  electrical_phase: string | null;
  has_solar: string | null;
  digital_meter: string | null;
  charger_location: string | null;
  meterkast_distance: string | null;
  desired_kw: string | null;
  call_pref: boolean | null;
  notes: string | null;
}

interface Summary {
  total: number;
  new: number;
  tier3: number;
  tier2: number;
  tier1: number;
  last24h: number;
  last7d: number;
}

const STATUS_OPTIONS = ["new", "contacted", "matched", "won", "lost", "junk"] as const;
type Status = (typeof STATUS_OPTIONS)[number];

const STATUS_TONE: Record<string, "info" | "muted" | "success" | "warning"> = {
  new: "info",
  contacted: "muted",
  matched: "success",
  won: "success",
  lost: "warning",
  junk: "warning",
};

const TIER_TONE: Record<string, "success" | "info" | "muted" | "warning"> = {
  "tier-3": "success",
  "tier-2": "info",
  "tier-1": "muted",
  rejected: "warning",
};

export default function AdminPage() {
  usePageMeta({
    title: `Admin — leads-overzicht Laadthuis`,
    description:
      "Interne admin-pagina voor de Laadthuis-redactie. Overzicht van offerte-aanvragen, status-updates en interne notities. Niet bedoeld voor het publiek.",
    canonical: `${SITE.url}/admin`,
    noindex: true,
  });

  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.set("status", filterStatus);
      if (filterTier !== "all") params.set("tier", filterTier);
      params.set("limit", "200");
      const res = await fetch(`/api/admin/leads?${params}`, {
        credentials: "include",
      });
      if (res.status === 401) {
        setAuthed(false);
        setLeads(null);
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAuthed(true);
      setLeads(data.leads ?? []);
      setSummary(data.summary ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterTier]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "include",
      });
      if (!res.ok) {
        setLoginError(
          res.status === 401
            ? "Onjuist wachtwoord"
            : `Fout (HTTP ${res.status})`,
        );
        return;
      }
      setPassword("");
      await refresh();
    } catch {
      setLoginError("Netwerkfout");
    } finally {
      setLoggingIn(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", {
      method: "POST",
      credentials: "include",
    });
    setAuthed(false);
    setLeads(null);
    setSummary(null);
  }

  async function updateLead(id: number, patch: { status?: Status; notes?: string }) {
    const res = await fetch(`/api/admin/leads?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
      credentials: "include",
    });
    if (res.ok && leads) {
      setLeads(
        leads.map((l) => (l.id === id ? { ...l, ...patch } as Lead : l)),
      );
    }
  }

  const filteredBySearch = useMemo(() => {
    if (!leads) return [];
    if (!search.trim()) return leads;
    const q = search.toLowerCase();
    return leads.filter((l) => {
      const haystack = [
        l.postcode,
        l.gemeente,
        l.voornaam,
        l.achternaam,
        l.email,
        l.telefoon,
        l.vehicle_brand,
        ...(l.brand_pref ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [leads, search]);

  if (authed === null) {
    return (
      <PageShell breadcrumbs={[{ label: "Home", href: "/" }, { label: "Admin" }]} width="prose">
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Admin — leads-overzicht
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Interne admin-pagina voor de Laadthuis-redactie. Sessie wordt
          gecontroleerd…
        </p>
        <div className="py-16 text-center text-muted-foreground">Laden…</div>
      </PageShell>
    );
  }

  if (!authed) {
    return (
      <PageShell breadcrumbs={[{ label: "Home", href: "/" }, { label: "Admin" }]} width="prose">
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Admin — leads-overzicht
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Interne admin-pagina voor de Laadthuis-redactie.
        </p>
        <Card className="mt-8 p-8 max-w-md mx-auto">
          <h2 className="font-heading text-xl font-bold tracking-tight">Admin login</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Toegang met het admin-wachtwoord.
          </p>
          <form onSubmit={login} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Wachtwoord</span>
              <input
                type="password"
                autoFocus
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
              />
            </label>
            {loginError ? (
              <div className="text-xs text-destructive">{loginError}</div>
            ) : null}
            <button
              type="submit"
              disabled={loggingIn || !password}
              className={cn(
                "w-full h-11 rounded-md font-medium",
                loggingIn || !password
                  ? "bg-muted text-muted-foreground"
                  : "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              {loggingIn ? "Inloggen…" : "Inloggen"}
            </button>
          </form>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell breadcrumbs={[{ label: "Home", href: "/" }, { label: "Admin" }]}>
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight">
            Leads
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Alle offerte-aanvragen via Laadthuis.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-border hover:bg-muted text-sm"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Vernieuwen
          </button>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-border hover:bg-muted text-sm"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      {summary ? (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <Stat label="Totaal" value={summary.total} />
          <Stat label="Nieuw" value={summary.new} accent />
          <Stat label="Tier 3" value={summary.tier3} />
          <Stat label="Tier 2" value={summary.tier2} />
          <Stat label="Tier 1" value={summary.tier1} />
          <Stat label="Laatste 24u" value={summary.last24h} />
          <Stat label="Laatste 7d" value={summary.last7d} />
        </div>
      ) : null}

      <div className="mt-6 rounded-md border border-border bg-card p-3 flex flex-wrap items-center gap-3">
        <label className="text-xs">
          <span className="block font-medium mb-1">Status</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 px-3 rounded-md border border-border bg-background text-sm"
          >
            <option value="all">Alle</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="text-xs">
          <span className="block font-medium mb-1">Tier</span>
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="h-9 px-3 rounded-md border border-border bg-background text-sm"
          >
            <option value="all">Alle</option>
            <option value="tier-3">Tier 3</option>
            <option value="tier-2">Tier 2</option>
            <option value="tier-1">Tier 1</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>
        <label className="text-xs flex-1 min-w-[200px]">
          <span className="block font-medium mb-1">Zoeken</span>
          <span className="relative block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Naam, e-mail, postcode, gemeente, EV-merk…"
              className="w-full h-9 pl-8 pr-3 rounded-md border border-border bg-background text-sm"
            />
          </span>
        </label>
        <span className="text-xs text-muted-foreground ml-auto self-end pb-1">
          {filteredBySearch.length} {leads && leads.length !== filteredBySearch.length ? `/ ${leads.length}` : ""} leads
        </span>
      </div>

      {error ? (
        <div className="mt-6 p-4 rounded-md border border-destructive/30 bg-destructive/5 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="mt-6 overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Wanneer</th>
              <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Status</th>
              <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Tier</th>
              <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Naam</th>
              <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Contact</th>
              <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Locatie</th>
              <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Situatie</th>
              <th className="text-right py-2 px-3 font-semibold text-muted-foreground">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredBySearch.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-muted-foreground">
                  {loading ? "Laden…" : "Geen leads die voldoen aan de filters."}
                </td>
              </tr>
            ) : null}
            {filteredBySearch.map((l) => {
              const isOpen = expandedId === l.id;
              return (
                <FragmentRow
                  key={l.id}
                  lead={l}
                  isOpen={isOpen}
                  onToggle={() => setExpandedId(isOpen ? null : l.id)}
                  onUpdate={(patch) => updateLead(l.id, patch)}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}

function FragmentRow({
  lead,
  isOpen,
  onToggle,
  onUpdate,
}: {
  lead: Lead;
  isOpen: boolean;
  onToggle: () => void;
  onUpdate: (patch: { status?: Status; notes?: string }) => void;
}) {
  const [notesDraft, setNotesDraft] = useState(lead.notes ?? "");
  const fullName = [lead.voornaam, lead.achternaam].filter(Boolean).join(" ");

  return (
    <>
      <tr
        onClick={onToggle}
        className="hover:bg-muted/40 cursor-pointer align-top"
      >
        <td className="py-2 px-3 whitespace-nowrap text-xs">
          {new Date(lead.created_at).toLocaleString("nl-BE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </td>
        <td className="py-2 px-3">
          <Pill tone={STATUS_TONE[lead.status] ?? "muted"} className="text-[10px]">
            {lead.status}
          </Pill>
        </td>
        <td className="py-2 px-3">
          {lead.tier ? (
            <Pill tone={TIER_TONE[lead.tier] ?? "muted"} className="text-[10px]">
              {lead.tier}
            </Pill>
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          )}
        </td>
        <td className="py-2 px-3 font-medium">{fullName || "—"}</td>
        <td className="py-2 px-3 text-xs">
          <div>{lead.email ?? "—"}</div>
          {lead.telefoon ? (
            <div className="text-muted-foreground">{lead.telefoon}</div>
          ) : null}
        </td>
        <td className="py-2 px-3 text-xs">
          {lead.postcode ? (
            <div className="font-mono">{lead.postcode}</div>
          ) : null}
          {lead.gemeente ? (
            <div className="text-muted-foreground">{lead.gemeente}</div>
          ) : null}
        </td>
        <td className="py-2 px-3 text-xs text-muted-foreground">
          {[lead.property, lead.ev_status, lead.urgency]
            .filter(Boolean)
            .join(" · ") || "—"}
        </td>
        <td className="py-2 px-3 text-right font-mono text-xs">
          {lead.score ?? "—"}
        </td>
      </tr>
      {isOpen ? (
        <tr className="bg-muted/30">
          <td colSpan={8} className="px-4 py-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold mb-2">Volledige aanvraag</h3>
                <dl className="text-xs grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <DRow label="Property" value={lead.property} />
                  <DRow label="EV-status" value={lead.ev_status} />
                  <DRow label="Urgency" value={lead.urgency} />
                  <DRow label="Voertuig" value={lead.vehicle_brand} />
                  <DRow label="Voorkeur merk" value={lead.brand_pref?.join(", ")} />
                  <DRow label="Woning ouderdom" value={lead.age_house} />
                  <DRow label="Aansluiting" value={lead.electrical_phase} />
                  <DRow label="Zonnepanelen" value={lead.has_solar} />
                  <DRow label="Digitale meter" value={lead.digital_meter} />
                  <DRow label="Locatie laadpaal" value={lead.charger_location} />
                  <DRow label="Meterkast afstand" value={lead.meterkast_distance} />
                  <DRow label="Gewenste kW" value={lead.desired_kw} />
                  <DRow
                    label="Bel-voorkeur"
                    value={lead.call_pref ? "Ja" : "Nee"}
                  />
                </dl>
              </div>
              <div>
                <label className="block">
                  <span className="text-sm font-semibold">Status</span>
                  <select
                    value={lead.status}
                    onChange={(e) => onUpdate({ status: e.target.value as Status })}
                    className="mt-1 w-full h-9 px-3 rounded-md border border-border bg-background text-sm"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label className="block mt-4">
                  <span className="text-sm font-semibold">Interne notities</span>
                  <textarea
                    rows={5}
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                  />
                </label>
                <button
                  onClick={() => onUpdate({ notes: notesDraft })}
                  disabled={notesDraft === (lead.notes ?? "")}
                  className={cn(
                    "mt-2 h-9 px-4 rounded-md text-sm font-medium",
                    notesDraft !== (lead.notes ?? "")
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-muted-foreground cursor-not-allowed",
                  )}
                >
                  Notities opslaan
                </button>
              </div>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-md border p-3",
        accent ? "border-primary/30 bg-primary/5" : "border-border bg-card",
      )}
    >
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          "font-mono font-bold mt-1",
          accent ? "text-2xl text-primary" : "text-xl",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function DRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-mono">{value || "—"}</dd>
    </>
  );
}
