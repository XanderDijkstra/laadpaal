import type { OperatorTariff } from "./types";

// Indicatieve tarieven Q1 2026, direct payment of standaard ad-hoc QR.
// Werkelijke prijs hangt af van uw laadpas/abonnement (Mobiflow, Eneco,
// Allego, …). Bron: publieke prijslijsten van de operatoren — laatst
// gecontroleerd januari 2026.
export const operatorTariffs: OperatorTariff[] = [
  {
    slug: "allego",
    name: "Allego",
    acPrice: 0.55,
    dcPrice: 0.79,
    startFee: 0.35,
    url: "https://www.allego.eu/",
    notes: "Roaming-pas vaak goedkoper dan ad-hoc QR.",
  },
  {
    slug: "totalenergies",
    name: "TotalEnergies",
    acPrice: 0.49,
    dcPrice: 0.69,
    startFee: null,
    url: "https://services.totalenergies.be/",
  },
  {
    slug: "pluginvest",
    name: "Pluginvest",
    acPrice: 0.46,
    dcPrice: 0.69,
    startFee: null,
    url: "https://www.pluginvest.be/",
  },
  {
    slug: "engie",
    name: "ENGIE",
    acPrice: 0.51,
    dcPrice: 0.74,
    startFee: 0.25,
    url: "https://emobility.engie.com/",
  },
  {
    slug: "ionity",
    name: "IONITY",
    acPrice: null,
    dcPrice: 0.79,
    startFee: null,
    notes: "Enkel DC. Power-pas korting tot €0,49/kWh.",
    url: "https://ionity.eu/",
  },
  {
    slug: "fastned",
    name: "Fastned",
    acPrice: null,
    dcPrice: 0.69,
    startFee: null,
    notes: "Enkel DC. Gold-abonnement: €0,49/kWh.",
    url: "https://fastned.nl/",
  },
  {
    slug: "tesla",
    name: "Tesla Supercharger",
    acPrice: 0.40,
    dcPrice: 0.55,
    startFee: null,
    notes: "Open voor non-Tesla EVs aan licht hoger tarief.",
    url: "https://www.tesla.com/superchargers",
  },
  {
    slug: "mobiflow",
    name: "Mobiflow (DATS24, Bolt, …)",
    acPrice: 0.49,
    dcPrice: 0.69,
    startFee: null,
    notes: "Wisselend per onderliggende operator.",
    url: "https://mobiflow.be/",
  },
  {
    slug: "eneco",
    name: "Eneco eMobility",
    acPrice: 0.45,
    dcPrice: 0.69,
    startFee: null,
    url: "https://www.eneco.be/",
  },
  {
    slug: "shell-recharge",
    name: "Shell Recharge",
    acPrice: 0.59,
    dcPrice: 0.79,
    startFee: 0.35,
    url: "https://shellrecharge.com/",
  },
  {
    slug: "blue-corner",
    name: "Blue Corner",
    acPrice: 0.49,
    dcPrice: 0.69,
    startFee: null,
    url: "https://www.bluecorner.be/",
  },
  {
    slug: "stroohm",
    name: "Stroohm",
    acPrice: 0.42,
    dcPrice: null,
    startFee: null,
    notes: "Vlaams netwerk via Mobiflow.",
    url: "https://www.stroohm.be/",
  },
  {
    slug: "onbekend",
    name: "Onbekend / niet gespecificeerd",
    acPrice: 0.55,
    dcPrice: 0.75,
    startFee: null,
    notes: "Vlaams gemiddelde — werkelijke prijs hangt af van operator.",
  },
];

export function getTariff(slug: string): OperatorTariff {
  return (
    operatorTariffs.find((o) => o.slug === slug) ??
    operatorTariffs.find((o) => o.slug === "onbekend")!
  );
}
