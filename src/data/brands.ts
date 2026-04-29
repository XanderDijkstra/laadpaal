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
  {
    slug: "abb",
    name: "ABB",
    country: "Zwitserland",
    countryFlag: "🇨🇭",
    founded: 1988,
    description:
      "Industriële reus uit Zürich. De Terra AC-reeks is robuust, met OCPP-ondersteuning en een breed bereik aan vermogens — geliefd bij installateurs voor zakelijke en residentiële installaties.",
    modelSlugs: ["abb-terra-ac-w22", "abb-terra-ac-w11"],
  },
  {
    slug: "schneider",
    name: "Schneider Electric",
    country: "Frankrijk",
    countryFlag: "🇫🇷",
    founded: 1836,
    description:
      "Frans wereldspeler in elektrische installaties. EVlink Wallbox is een betrouwbare standaardkeuze, vaak voorgesteld door installateurs die al met Schneider materiaal werken.",
    modelSlugs: ["schneider-evlink-wallbox-g4", "schneider-evlink-home"],
  },
  {
    slug: "webasto",
    name: "Webasto",
    country: "Duitsland",
    countryFlag: "🇩🇪",
    founded: 1901,
    description:
      "Duitse fabrikant uit Stockdorf, oorspronkelijk bekend van auto-verwarmingssystemen. Webasto Pure en Live Plus zijn breed verkrijgbaar via Belgische installateurs.",
    modelSlugs: ["webasto-pure", "webasto-live-plus", "webasto-turbodx"],
  },
  {
    slug: "keba",
    name: "KEBA",
    country: "Oostenrijk",
    countryFlag: "🇦🇹",
    founded: 1968,
    description:
      "Oostenrijks merk met een sterke reputatie in publieke en semi-publieke laders. KeContact P30/P40 wordt vaak gebruikt voor bedrijfsparkings.",
    modelSlugs: ["keba-kecontact-p30", "keba-kecontact-p40"],
  },
  {
    slug: "mennekes",
    name: "MENNEKES",
    country: "Duitsland",
    countryFlag: "🇩🇪",
    founded: 1935,
    description:
      "Uitvinder van de Type 2-stekker. Amtron-reeks staat bekend om premium afwerking en lange levensduur — een veilige keuze voor wie 'made in Germany' belangrijk vindt.",
    modelSlugs: ["mennekes-amtron-compact-2s", "mennekes-amtron-charge-control"],
  },
  {
    slug: "evbox",
    name: "EVBox",
    country: "Nederland",
    countryFlag: "🇳🇱",
    founded: 2010,
    description:
      "Een van de grootste laadpaalfabrikanten van Europa, eigendom van ENGIE. Elvi voor thuis, Liviqo voor zakelijke en multi-user setups.",
    modelSlugs: ["evbox-elvi", "evbox-liviqo"],
  },
  {
    slug: "hager",
    name: "Hager",
    country: "Frankrijk",
    countryFlag: "🇫🇷",
    founded: 1955,
    description:
      "Frans-Duitse groep met Belgische dochter. Witty-reeks integreert vlot in bestaande Hager-meterkasten — populaire keuze bij elektriciens.",
    modelSlugs: ["hager-witty-start", "hager-witty-park"],
  },
  {
    slug: "heidelberg",
    name: "Heidelberger",
    country: "Duitsland",
    countryFlag: "🇩🇪",
    founded: 1850,
    description:
      "Energy Control en Home Eco zijn budgetvriendelijke chargers met basis-functionaliteit. Geen app, geen wifi — pure laadhardware voor wie kosten wil drukken.",
    modelSlugs: ["heidelberg-energy-control", "heidelberg-home-eco"],
  },
  {
    slug: "ohme",
    name: "Ohme",
    country: "Verenigd Koninkrijk",
    countryFlag: "🇬🇧",
    founded: 2017,
    description:
      "Britse start-up die zich specialiseert in dynamische tarieven. Home Pro communiceert rechtstreeks met de energieleverancier voor optimaal goedkoop laden.",
    modelSlugs: ["ohme-home-pro", "ohme-epod"],
  },
  {
    slug: "go-e",
    name: "go-e",
    country: "Oostenrijk",
    countryFlag: "🇦🇹",
    founded: 2015,
    description:
      "Oostenrijkse innovator die zowel mobiele als vaste laders maakt. De Charger Gemini is een populaire enthousiast-keuze met sterke open API.",
    modelSlugs: ["go-e-charger-gemini-22", "go-e-charger-gemini-flex"],
  },
];
