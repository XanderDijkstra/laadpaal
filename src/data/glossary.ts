import type { GlossaryTerm } from "./types";

export const glossary: GlossaryTerm[] = [
  { slug: "type-2-stekker", term: "Type 2-stekker", short: "De Europese standaard voor AC-laden. Alle moderne EVs in Vlaanderen gebruiken deze connector." },
  { slug: "ccs-stekker", term: "CCS-stekker", short: "Combined Charging System — combineert Type 2 met DC-snelladen. Standaard op vrijwel alle nieuwe EVs in Europa." },
  { slug: "ac-vs-dc-laden", term: "AC versus DC laden", short: "AC-laden via een wallbox thuis (tot 22 kW). DC-laden via snellaadstations onderweg (50-350 kW)." },
  { slug: "kw-vs-kwh", term: "kW versus kWh", short: "kW is laadvermogen (snelheid), kWh is energie (capaciteit). 11 kW gedurende 1 uur = 11 kWh." },
  { slug: "mid-meter", term: "MID-meter", short: "Wettelijk gecertificeerde meter (Measuring Instruments Directive). Nodig wanneer verbruik moet worden gefactureerd of terugbetaald." },
  { slug: "ocpp", term: "OCPP", short: "Open Charge Point Protocol — open standaard waarmee laadpalen met backend-systemen communiceren. Belangrijk voor merk-onafhankelijkheid." },
  { slug: "rfid-authenticatie", term: "RFID-authenticatie", short: "Toegangscontrole via een NFC-kaart of -tag. Voorkomt dat onbevoegden uw laadpaal gebruiken." },
  { slug: "fasebalancering", term: "Fasebalancering", short: "Verdeling van vermogen over de drie fasen van uw aansluiting. Voorkomt onnodig opladen op één fase die de zekering doet springen." },
  { slug: "dynamic-load-balancing", term: "Dynamic load balancing (DLB)", short: "Continue meting van uw verbruik en automatisch terugschakelen van het laadvermogen om piekverbruik te vermijden." },
  { slug: "wallbox", term: "Wallbox", short: "Generieke term voor een muurgemonteerde AC-laadpaal voor thuis. Niet te verwarren met het merk Wallbox." },
  { slug: "ldb", term: "LDB", short: "Load Balancing — verdeling van vermogen over meerdere laadpunten." },
  { slug: "dlb", term: "DLB", short: "Dynamic Load Balancing — zie dynamic-load-balancing." },
  { slug: "areikeuring", term: "AREI-keuring", short: "Verplichte keuring van uw elektrische installatie door een erkend organisme (Vinçotte, BTV, …) na plaatsing van een laadpaal." },
  { slug: "capaciteitstarief", term: "Capaciteitstarief", short: "Tarief in Vlaanderen waarbij u betaalt op basis van uw piekverbruik (kW), niet enkel op verbruikte kWh." },
  { slug: "fluvius", term: "Fluvius", short: "De Vlaamse netbeheerder. Verantwoordelijk voor de aansluiting tot uw meterkast — niet voor de plaatsing van de laadpaal zelf." },
];
