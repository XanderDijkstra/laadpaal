import type { Brand } from "./types";

export const brands: Brand[] = [
  {
    slug: "zaptec",
    name: "Zaptec",
    country: "Noorwegen",
    countryFlag: "🇳🇴",
    founded: 2012,
    description:
      "Noorse pionier in slimme laders. De Zaptec Go staat bekend om compact design, automatische fasebalancering en uitstekende prestaties bij koud weer.",
    modelSlugs: ["zaptec-go", "zaptec-go-2", "zaptec-pro"],
  },
  {
    slug: "easee",
    name: "Easee",
    country: "Noorwegen",
    countryFlag: "🇳🇴",
    founded: 2018,
    description:
      "Modulaire chargers met sterke app en lage hardware-prijs. Populair bij installateurs in Vlaanderen.",
    modelSlugs: ["easee-charge-up", "easee-charge-core", "easee-charge-max"],
  },
  {
    slug: "wallbox",
    name: "Wallbox",
    country: "Spanje",
    countryFlag: "🇪🇸",
    founded: 2015,
    description:
      "Spaans merk met designgerichte chargers. De Pulsar Plus is een veelverkoper voor thuis.",
    modelSlugs: ["wallbox-pulsar-plus", "wallbox-copper-sb"],
  },
  {
    slug: "alfen",
    name: "Alfen",
    country: "Nederland",
    countryFlag: "🇳🇱",
    founded: 1937,
    description:
      "Nederlandse fabrikant met focus op betrouwbaarheid. Eve-serie is een veilige keuze met sterke garantie.",
    modelSlugs: ["alfen-eve-single-pro-line", "alfen-eve-double-pro-line"],
  },
  {
    slug: "peblar",
    name: "Peblar",
    country: "Nederland",
    countryFlag: "🇳🇱",
    founded: 2023,
    description:
      "Spin-off van Prodrive Technologies. Compacte, slimme charger met sterke fasebalancering en lokale ondersteuning.",
    modelSlugs: ["peblar-home", "peblar-business"],
  },
  {
    slug: "smappee",
    name: "Smappee",
    country: "België",
    countryFlag: "🇧🇪",
    founded: 2012,
    description:
      "Belgisch merk uit Harelbeke. Sterk geïntegreerd met zonnepanelen en energiemonitoring — Smappee EV Wall is de thuisoplossing.",
    modelSlugs: ["smappee-ev-wall"],
  },
  {
    slug: "tesla",
    name: "Tesla",
    country: "Verenigde Staten",
    countryFlag: "🇺🇸",
    founded: 2003,
    description:
      "Tesla Wall Connector — primair voor Tesla-eigenaars maar werkt met elke EV met Type 2-stekker.",
    modelSlugs: ["tesla-wall-connector"],
  },
  {
    slug: "myenergi",
    name: "MyEnergi",
    country: "Verenigd Koninkrijk",
    countryFlag: "🇬🇧",
    founded: 2016,
    description:
      "De Zappi is dé charger voor zonnepaneeleigenaars: laadt uitsluitend met overschot van eigen PV-productie.",
    modelSlugs: ["myenergi-zappi"],
  },
];
