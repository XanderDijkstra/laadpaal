import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card } from "./ui/Card";
import { RadioGroup } from "./ui/RadioGroup";
import { Label } from "./ui/Label";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Progress } from "./ui/Progress";
import { Pill } from "./ui/Pill";
import { gemeenten } from "@/data/gemeenten";
import { brands } from "@/data/brands";
import { isValidBelgianPostcode, scoreLead } from "@/lib/leadScoring";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "offerte:draft:v1";

interface FormState {
  property: string;
  ev_status: string;
  urgency: string;
  postcode: string;
  age_house: string;
  charger_location: string;
  meterkast_distance: string;
  electrical_phase: string;
  has_solar: string;
  digital_meter: string;
  vehicle_brand: string;
  desired_kw: string;
  brand_pref: string[];
  voornaam: string;
  achternaam: string;
  email: string;
  telefoon: string;
  call_pref: boolean;
  consent: boolean;
}

const DEFAULT_STATE: FormState = {
  property: "",
  ev_status: "",
  urgency: "",
  postcode: "",
  age_house: "",
  charger_location: "",
  meterkast_distance: "",
  electrical_phase: "",
  has_solar: "",
  digital_meter: "",
  vehicle_brand: "",
  desired_kw: "",
  brand_pref: [],
  voornaam: "",
  achternaam: "",
  email: "",
  telefoon: "",
  call_pref: true,
  consent: false,
};

const STEPS = [
  "Situatie",
  "Woning",
  "Elektriciteit",
  "Voertuig",
  "Contact",
] as const;

export function OfferteForm() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<FormState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Hydrate from localStorage + URL prefills after first render to avoid SSR mismatch
  useEffect(() => {
    let next: FormState = DEFAULT_STATE;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) next = { ...DEFAULT_STATE, ...JSON.parse(stored) };
    } catch {
      /* ignore */
    }
    const pc = params.get("postcode");
    const model = params.get("model");
    if (pc && !next.postcode) next = { ...next, postcode: pc };
    if (model && next.brand_pref.length === 0)
      next = { ...next, brand_pref: [model] };
    setState(next);
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist draft (only after hydration so we don't overwrite stored values with the default)
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  const postcodeValid = isValidBelgianPostcode(state.postcode);
  const detectedGemeente = useMemo(
    () =>
      gemeenten.find((g) => g.postcodes.some((p) => p === state.postcode)) ??
      null,
    [state.postcode],
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function toggleBrand(slug: string) {
    if (slug === "geen-voorkeur") {
      update("brand_pref", state.brand_pref.includes(slug) ? [] : ["geen-voorkeur"]);
      return;
    }
    const without = state.brand_pref.filter(
      (b) => b !== slug && b !== "geen-voorkeur",
    );
    update(
      "brand_pref",
      state.brand_pref.includes(slug) ? without : [...without, slug],
    );
  }

  const stepValid = useMemo(() => {
    switch (step) {
      case 0:
        return state.property && state.ev_status && state.urgency;
      case 1:
        return (
          postcodeValid &&
          state.age_house &&
          state.charger_location &&
          state.meterkast_distance
        );
      case 2:
        return state.electrical_phase && state.has_solar && state.digital_meter;
      case 3:
        return state.vehicle_brand && state.desired_kw;
      case 4:
        return (
          state.voornaam &&
          state.achternaam &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email) &&
          state.telefoon.length >= 8 &&
          state.consent
        );
      default:
        return false;
    }
  }, [step, state, postcodeValid]);

  async function next() {
    if (!stepValid || submitting) return;
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setSubmitting(true);
      try {
        await submit();
      } finally {
        setSubmitting(false);
      }
    }
  }

  function back() {
    if (step > 0) {
      setStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function submit() {
    const result = scoreLead({
      property: state.property,
      ev_status: state.ev_status,
      urgency: state.urgency,
      postcode: state.postcode,
      postcodeValid,
      age_house: state.age_house,
      electrical_phase: state.electrical_phase,
      has_solar: state.has_solar,
      digital_meter: state.digital_meter,
      vehicle_brand: state.vehicle_brand,
      desired_kw: state.desired_kw,
      brand_pref: state.brand_pref,
      email: state.email,
    });

    const utm = new URLSearchParams(window.location.search);
    const payload = {
      ...state,
      gemeente: detectedGemeente?.name ?? null,
      score: result.score,
      tier: result.tier,
      reasons: result.reasons,
      utm_source: utm.get("utm_source") ?? null,
      utm_medium: utm.get("utm_medium") ?? null,
      utm_campaign: utm.get("utm_campaign") ?? null,
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      // Fall back to localStorage so the user is never blocked from submitting
      // when the API is offline. Admin will reconcile from the table for
      // anything that arrived; manual recovery from localStorage if needed.
      console.error("[offerte] POST /api/leads failed:", err);
      try {
        const fallback = JSON.parse(
          window.localStorage.getItem("offerte:submitted:v1") ?? "[]",
        );
        fallback.push({
          submittedAt: new Date().toISOString(),
          state,
          result,
          gemeente: detectedGemeente?.name ?? null,
        });
        window.localStorage.setItem(
          "offerte:submitted:v1",
          JSON.stringify(fallback),
        );
      } catch {
        /* ignore */
      }
    }

    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    navigate("/offerte/verzonden", {
      state: { gemeente: detectedGemeente?.name ?? null, tier: result.tier },
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="font-medium">
            Stap {step + 1} / {STEPS.length}: {STEPS[step]}
          </span>
          <span className="text-muted-foreground">
            {Math.round(((step + 1) / STEPS.length) * 100)}%
          </span>
        </div>
        <Progress value={step + 1} max={STEPS.length} />
      </div>

      <Card className="p-6 md:p-8">
        {step === 0 && (
          <Step1
            state={state}
            onChange={update}
            detectedGemeente={detectedGemeente}
          />
        )}
        {step === 1 && (
          <Step2
            state={state}
            onChange={update}
            postcodeValid={postcodeValid}
            detectedGemeente={detectedGemeente}
          />
        )}
        {step === 2 && <Step3 state={state} onChange={update} />}
        {step === 3 && (
          <Step4
            state={state}
            onChange={update}
            toggleBrand={toggleBrand}
          />
        )}
        {step === 4 && <Step5 state={state} onChange={update} />}

        <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={back}
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-md border border-input hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
              Vorige
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={next}
            disabled={!stepValid || submitting}
            className={cn(
              "inline-flex items-center justify-center gap-2 h-11 px-6 rounded-md font-medium",
              stepValid && !submitting
                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                : "bg-muted text-muted-foreground cursor-not-allowed",
            )}
          >
            {submitting
              ? "Versturen…"
              : step === STEPS.length - 1
                ? "Verstuur — ontvang 3 offertes"
                : "Volgende"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ----- Steps ----- */

function StepHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-xl md:text-2xl font-bold tracking-tight">{title}</h2>
      {subtitle ? (
        <p className="text-muted-foreground mt-1">{subtitle}</p>
      ) : null}
    </div>
  );
}

function Field({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {helper ? (
        <p className="text-xs text-muted-foreground">{helper}</p>
      ) : null}
    </div>
  );
}

function Step1({
  state,
  onChange,
  detectedGemeente,
}: {
  state: FormState;
  onChange: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  detectedGemeente: { name: string } | null;
}) {
  return (
    <>
      <StepHeader
        title="Situatie"
        subtitle="3 korte vragen — 30 seconden."
      />
      {detectedGemeente ? (
        <Pill tone="success" className="mb-4">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Gemeente herkend: {detectedGemeente.name}
        </Pill>
      ) : null}
      <div className="space-y-6">
        <Field label="Wat is uw situatie?">
          <RadioGroup
            name="property"
            value={state.property}
            onChange={(v) => onChange("property", v)}
            layout="grid"
            options={[
              { value: "eigen-woning", label: "Eigen woning" },
              { value: "huur", label: "Huurwoning" },
              { value: "appartement", label: "Appartement" },
              { value: "bedrijf", label: "Bedrijf" },
            ]}
          />
        </Field>
        <Field label="Heeft u al een elektrische auto?">
          <RadioGroup
            name="ev_status"
            value={state.ev_status}
            onChange={(v) => onChange("ev_status", v)}
            layout="grid"
            options={[
              { value: "rijdt-al", label: "Ja, ik rijd elektrisch" },
              { value: "besteld", label: "Wagen besteld, wacht op levering" },
              { value: "kiezend", label: "Ik ben aan het kiezen" },
              { value: "orienterend", label: "Nog niet, oriënterend" },
            ]}
          />
        </Field>
        <Field label="Wanneer wilt u de laadpaal geïnstalleerd hebben?">
          <RadioGroup
            name="urgency"
            value={state.urgency}
            onChange={(v) => onChange("urgency", v)}
            layout="grid"
            options={[
              { value: "zsm", label: "Zo snel mogelijk" },
              { value: "1-maand", label: "Binnen 1 maand" },
              { value: "3-maanden", label: "Binnen 3 maanden" },
              { value: "geen-haast", label: "Geen haast" },
            ]}
          />
        </Field>
      </div>
    </>
  );
}

function Step2({
  state,
  onChange,
  postcodeValid,
  detectedGemeente,
}: {
  state: FormState;
  onChange: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  postcodeValid: boolean;
  detectedGemeente: { name: string } | null;
}) {
  return (
    <>
      <StepHeader title="Woning" subtitle="4 vragen over uw situatie." />
      <div className="space-y-6">
        <Field
          label="Postcode"
          helper={
            state.postcode && !postcodeValid
              ? "Vul een geldige Belgische postcode in (4 cijfers, niet beginnend met 0)."
              : detectedGemeente
                ? `Gemeente herkend: ${detectedGemeente.name}`
                : "Gebruikt om u te matchen met installateurs in uw regio."
          }
        >
          <Input
            inputMode="numeric"
            pattern="[1-9][0-9]{3}"
            maxLength={4}
            placeholder="bv. 9000"
            value={state.postcode}
            onChange={(e) => onChange("postcode", e.target.value)}
          />
        </Field>
        <Field
          label="Hoe oud is uw woning?"
          helper="Bepaalt of u 6% btw kunt vragen op de installatie."
        >
          <RadioGroup
            name="age_house"
            value={state.age_house}
            onChange={(v) => onChange("age_house", v)}
            options={[
              { value: "ouder-dan-10", label: "Ouder dan 10 jaar (6% btw)" },
              { value: "jonger-dan-10", label: "Jonger dan 10 jaar (21% btw)" },
              { value: "weet-niet", label: "Weet ik niet" },
            ]}
          />
        </Field>
        <Field label="Waar moet de laadpaal komen?">
          <RadioGroup
            name="charger_location"
            value={state.charger_location}
            onChange={(v) => onChange("charger_location", v)}
            layout="grid"
            options={[
              { value: "garage", label: "Garage" },
              { value: "buitengevel", label: "Buitengevel" },
              { value: "oprit", label: "Oprit (paal/sokkel nodig)" },
              { value: "carport", label: "Carport" },
              { value: "anders", label: "Anders" },
            ]}
          />
        </Field>
        <Field label="Afstand van meterkast tot laadpaal?">
          <RadioGroup
            name="meterkast_distance"
            value={state.meterkast_distance}
            onChange={(v) => onChange("meterkast_distance", v)}
            layout="grid"
            options={[
              { value: "lt-5", label: "Minder dan 5 meter" },
              { value: "5-10", label: "5 — 10 meter" },
              { value: "10-20", label: "10 — 20 meter" },
              { value: "gt-20", label: "Meer dan 20 meter" },
            ]}
          />
        </Field>
      </div>
    </>
  );
}

function Step3({
  state,
  onChange,
}: {
  state: FormState;
  onChange: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  return (
    <>
      <StepHeader
        title="Elektriciteit"
        subtitle="3 vragen over uw netaansluiting."
      />
      <div className="space-y-6">
        <Field label="Welke aansluiting heeft u?">
          <RadioGroup
            name="electrical_phase"
            value={state.electrical_phase}
            onChange={(v) => onChange("electrical_phase", v)}
            options={[
              { value: "1-fase", label: "1-fase 40A (standaard oudere woningen)" },
              { value: "3-fase", label: "3-fase" },
              { value: "weet-niet", label: "Weet ik niet" },
            ]}
          />
        </Field>
        <Field label="Heeft u zonnepanelen?">
          <RadioGroup
            name="has_solar"
            value={state.has_solar}
            onChange={(v) => onChange("has_solar", v)}
            layout="grid"
            options={[
              { value: "ja", label: "Ja" },
              { value: "nee", label: "Nee" },
              { value: "gepland", label: "Gepland" },
            ]}
          />
        </Field>
        <Field label="Heeft u een digitale meter?">
          <RadioGroup
            name="digital_meter"
            value={state.digital_meter}
            onChange={(v) => onChange("digital_meter", v)}
            layout="grid"
            options={[
              { value: "ja", label: "Ja" },
              { value: "nee", label: "Nee" },
              { value: "weet-niet", label: "Weet ik niet" },
            ]}
          />
        </Field>
      </div>
    </>
  );
}

function Step4({
  state,
  onChange,
  toggleBrand,
}: {
  state: FormState;
  onChange: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  toggleBrand: (slug: string) => void;
}) {
  const brandSlugs = ["geen-voorkeur", ...brands.map((b) => b.slug)];
  return (
    <>
      <StepHeader
        title="Voertuig en voorkeuren"
        subtitle="3 vragen over uw EV en gewenste laadpaal."
      />
      <div className="space-y-6">
        <Field label="Welk merk auto?">
          <Select
            value={state.vehicle_brand}
            onChange={(e) => onChange("vehicle_brand", e.target.value)}
          >
            <option value="">Kies een merk…</option>
            {[
              "Tesla",
              "BMW",
              "Volvo",
              "Audi",
              "Mercedes-Benz",
              "Volkswagen",
              "Hyundai",
              "Kia",
              "Škoda",
              "Renault",
              "Peugeot",
              "Polestar",
              "Cupra",
              "Porsche",
              "MG",
              "Andere",
              "Weet ik nog niet",
            ].map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Welk laadvermogen wilt u?">
          <RadioGroup
            name="desired_kw"
            value={state.desired_kw}
            onChange={(v) => onChange("desired_kw", v)}
            options={[
              { value: "7.4", label: "7,4 kW (standaard)", description: "Voldoende voor de meeste 1-fase aansluitingen" },
              { value: "11", label: "11 kW (snel, 3-fase)", description: "Beste keuze voor 95% van de EVs" },
              { value: "22", label: "22 kW (zeer snel, 3-fase)", description: "Alleen zinvol als uw EV 22 kW AC accepteert" },
              { value: "weet-niet", label: "Weet ik niet" },
            ]}
          />
        </Field>
        <Field
          label="Heeft u een merkvoorkeur?"
          helper="U kunt meerdere merken selecteren of ‘geen voorkeur’ kiezen."
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {brandSlugs.map((slug) => {
              const brand = brands.find((b) => b.slug === slug);
              const label =
                slug === "geen-voorkeur" ? "Geen voorkeur" : (brand?.name ?? slug);
              const checked = state.brand_pref.includes(slug);
              return (
                <button
                  type="button"
                  key={slug}
                  onClick={() => toggleBrand(slug)}
                  className={cn(
                    "p-3 rounded-md border text-sm font-medium text-left transition-colors",
                    checked
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-card hover:border-primary/50",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </Field>
      </div>
    </>
  );
}

function Step5({
  state,
  onChange,
}: {
  state: FormState;
  onChange: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  return (
    <>
      <StepHeader
        title="Contactgegevens"
        subtitle="Zo kunnen 3 erkende installateurs u een offerte sturen."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Voornaam">
          <Input
            value={state.voornaam}
            onChange={(e) => onChange("voornaam", e.target.value)}
            autoComplete="given-name"
          />
        </Field>
        <Field label="Achternaam">
          <Input
            value={state.achternaam}
            onChange={(e) => onChange("achternaam", e.target.value)}
            autoComplete="family-name"
          />
        </Field>
        <Field label="E-mail">
          <Input
            type="email"
            value={state.email}
            onChange={(e) => onChange("email", e.target.value)}
            autoComplete="email"
          />
        </Field>
        <Field
          label="Telefoon"
          helper="Voor +32-nummers werkt zowel 0470 12 34 56 als +32 470 12 34 56."
        >
          <Input
            type="tel"
            value={state.telefoon}
            onChange={(e) => onChange("telefoon", e.target.value)}
            autoComplete="tel"
            placeholder="bv. 0470 12 34 56"
          />
        </Field>
      </div>

      <div className="mt-6 space-y-4">
        <label className="flex items-start gap-3 p-3 rounded-md border border-border bg-card cursor-pointer">
          <input
            type="checkbox"
            checked={state.call_pref}
            onChange={(e) => onChange("call_pref", e.target.checked)}
            className="mt-1 h-4 w-4 accent-primary"
          />
          <span className="text-sm">
            <span className="font-medium">Ja, installateurs mogen mij bellen</span>
            <span className="block text-muted-foreground text-xs mt-0.5">
              Vink uit als u alleen via e-mail wilt worden gecontacteerd.
            </span>
          </span>
        </label>
        <label className="flex items-start gap-3 p-3 rounded-md border border-border bg-card cursor-pointer">
          <input
            type="checkbox"
            checked={state.consent}
            onChange={(e) => onChange("consent", e.target.checked)}
            className="mt-1 h-4 w-4 accent-primary"
          />
          <span className="text-sm">
            Ik ga akkoord dat tot 3 erkende installateurs contact met me opnemen
            over deze aanvraag. Lees de{" "}
            <a
              href="/privacy"
              className="text-primary underline underline-offset-2"
            >
              privacy policy
            </a>
            .
          </span>
        </label>
      </div>
    </>
  );
}
