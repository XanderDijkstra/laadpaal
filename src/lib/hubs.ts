// Index ("hub") pages that link to every generated detail page. Linked from
// the homepage so crawlers reach each programmatic page within two clicks.
import { chargers } from "@/data/chargers";
import { brands } from "@/data/brands";
import { comparisons } from "@/data/comparisons";
import { evModels } from "@/data/evModels";
import { gemeenten } from "@/data/gemeenten";
import { guides } from "@/data/guides";
import { installationTopics } from "@/data/installationTopics";
import { glossary } from "@/data/glossary";
import { laadpunten } from "@/data/laadpunten";
import { allBrandPairs } from "@/lib/brandPairs";

export interface Hub {
  href: string;
  label: string;
  count: string;
}

export const HUBS: Hub[] = [
  { href: "/laadpalen", label: "Alle laadpalen", count: `${chargers.length} modellen` },
  { href: "/merken", label: "Laadpaalmerken", count: `${brands.length} merken` },
  { href: "/vergelijken", label: "Model-vergelijkingen", count: `${comparisons.length} vergelijkingen` },
  { href: "/merken-vergelijken", label: "Merk vs merk", count: `${allBrandPairs().length} merk-duels` },
  { href: "/auto", label: "Laadpaal per auto", count: `${evModels.length} EV-modellen` },
  { href: "/gemeente", label: "Installateurs per gemeente", count: `${gemeenten.length} gemeenten` },
  { href: "/laadpunten", label: "Publieke laadpalen", count: `${laadpunten.length} laadpunten` },
  { href: "/installatie", label: "Installatie", count: `${installationTopics.length} onderwerpen` },
  { href: "/gids", label: "Gidsen", count: `${guides.length} artikels` },
  { href: "/woordenlijst", label: "Woordenlijst", count: `${glossary.length} begrippen` },
];
