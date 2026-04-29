export interface LeadInput {
  property?: string;
  ev_status?: string;
  urgency?: string;
  postcode?: string;
  postcodeValid?: boolean;
  age_house?: string;
  electrical_phase?: string;
  has_solar?: string;
  digital_meter?: string;
  vehicle_brand?: string;
  desired_kw?: string;
  brand_pref?: string[];
  email?: string;
}

const FREE_DOMAINS = new Set([
  "gmail.com",
  "hotmail.com",
  "hotmail.be",
  "outlook.com",
  "outlook.be",
  "yahoo.com",
  "yahoo.fr",
  "telenet.be",
  "skynet.be",
  "live.com",
  "live.be",
  "icloud.com",
]);

export function scoreLead(input: LeadInput) {
  let score = 0;
  const reasons: string[] = [];

  switch (input.property) {
    case "eigen-woning":
      score += 30;
      reasons.push("Eigen woning +30");
      break;
    case "bedrijf":
      score += 35;
      reasons.push("Bedrijf +35");
      break;
    case "huur":
      score += 5;
      reasons.push("Huurwoning +5");
      break;
    case "appartement":
      score += 10;
      reasons.push("Appartement +10");
      break;
  }

  switch (input.ev_status) {
    case "rijdt-al":
      score += 30;
      reasons.push("Rijdt al elektrisch +30");
      break;
    case "besteld":
      score += 25;
      reasons.push("Wagen besteld +25");
      break;
    case "kiezend":
      score += 15;
      reasons.push("Kiezend +15");
      break;
    case "orienterend":
      score += 5;
      reasons.push("Oriënterend +5");
      break;
  }

  switch (input.urgency) {
    case "zsm":
      score += 30;
      reasons.push("Urgentie ZSM +30");
      break;
    case "1-maand":
      score += 20;
      reasons.push("Urgentie 1 maand +20");
      break;
    case "3-maanden":
      score += 10;
      reasons.push("Urgentie 3 maanden +10");
      break;
    case "geen-haast":
      reasons.push("Geen haast +0");
      break;
  }

  if (input.postcodeValid) {
    score += 10;
    reasons.push("Postcode geldig +10");
  } else if (input.postcode) {
    score -= 50;
    reasons.push("Postcode ongeldig -50");
  }

  if (input.age_house === "ouder-dan-10") {
    score += 10;
    reasons.push("6% btw eligible +10");
  }
  if (input.electrical_phase && input.electrical_phase !== "weet-niet") {
    score += 10;
    reasons.push("Elektrische info bekend +10");
  }
  if (input.brand_pref && input.brand_pref.length > 0 && !input.brand_pref.includes("geen-voorkeur")) {
    score += 5;
    reasons.push("Merkvoorkeur opgegeven +5");
  }

  if (input.email) {
    const domain = input.email.split("@")[1]?.toLowerCase() ?? "";
    if (FREE_DOMAINS.has(domain)) {
      score -= 15;
      reasons.push("Free email domain -15");
    } else if (domain && !domain.endsWith(".be") && domain.includes(".")) {
      score += 0;
    } else if (domain) {
      score += 10;
      reasons.push("Business email +10");
    }
  }

  let tier: "rejected" | "tier-1" | "tier-2" | "tier-3";
  if (score < 30) tier = "rejected";
  else if (score < 50) tier = "tier-1";
  else if (score < 80) tier = "tier-2";
  else tier = "tier-3";

  return { score, tier, reasons };
}

export function isValidBelgianPostcode(input: string) {
  return /^[1-9][0-9]{3}$/.test(input.trim());
}
