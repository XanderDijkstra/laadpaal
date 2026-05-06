import { Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import OffertePage from "@/pages/OffertePage";
import OfferteVerzondenPage from "@/pages/OfferteVerzondenPage";
import LaadpalenIndexPage from "@/pages/LaadpalenIndexPage";
import LaadpaalDetailPage from "@/pages/LaadpaalDetailPage";
import BesteLaadpaalPage from "@/pages/BesteLaadpaalPage";
import LaadkostCalculatorPage from "@/pages/LaadkostCalculatorPage";
import LaadpuntenIndexPage from "@/pages/LaadpuntenIndexPage";
import LaadpuntenGemeentePage from "@/pages/LaadpuntenGemeentePage";
import MerkenIndexPage from "@/pages/MerkenIndexPage";
import MerkDetailPage from "@/pages/MerkDetailPage";
import VergelijkenIndexPage from "@/pages/VergelijkenIndexPage";
import VergelijkenDetailPage from "@/pages/VergelijkenDetailPage";
import MerkenVergelijkenDetailPage from "@/pages/MerkenVergelijkenDetailPage";
import AutoIndexPage from "@/pages/AutoIndexPage";
import AutoDetailPage from "@/pages/AutoDetailPage";
import InstallatiePillarPage from "@/pages/InstallatiePillarPage";
import InstallatieDetailPage from "@/pages/InstallatieDetailPage";
import GemeenteIndexPage from "@/pages/GemeenteIndexPage";
import GemeenteDetailPage from "@/pages/GemeenteDetailPage";
import GidsIndexPage from "@/pages/GidsIndexPage";
import GidsDetailPage from "@/pages/GidsDetailPage";
import WoordenlijstIndexPage from "@/pages/WoordenlijstIndexPage";
import WoordenlijstDetailPage from "@/pages/WoordenlijstDetailPage";
import OverOnsPage from "@/pages/OverOnsPage";
import VoorInstallateursPage from "@/pages/VoorInstallateursPage";
import ContactPage from "@/pages/ContactPage";
import PrivacyPage from "@/pages/PrivacyPage";
import VoorwaardenPage from "@/pages/VoorwaardenPage";
import NotFoundPage from "@/pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/offerte" element={<OffertePage />} />
      <Route path="/offerte/verzonden" element={<OfferteVerzondenPage />} />
      <Route path="/laadpalen" element={<LaadpalenIndexPage />} />
      <Route path="/laadpalen/:slug" element={<LaadpaalDetailPage />} />
      <Route path="/beste-laadpaal" element={<BesteLaadpaalPage />} />
      <Route path="/laadkost-berekenen" element={<LaadkostCalculatorPage />} />
      <Route path="/laadpunten" element={<LaadpuntenIndexPage />} />
      <Route path="/laadpunten/:slug" element={<LaadpuntenGemeentePage />} />
      <Route path="/merken" element={<MerkenIndexPage />} />
      <Route path="/merken/:slug" element={<MerkDetailPage />} />
      <Route path="/vergelijken" element={<VergelijkenIndexPage />} />
      <Route path="/vergelijken/:slug" element={<VergelijkenDetailPage />} />
      <Route path="/merken-vergelijken/:slug" element={<MerkenVergelijkenDetailPage />} />
      <Route path="/auto" element={<AutoIndexPage />} />
      <Route path="/auto/:slug" element={<AutoDetailPage />} />
      <Route path="/installatie" element={<InstallatiePillarPage />} />
      <Route path="/installatie/:slug" element={<InstallatieDetailPage />} />
      <Route path="/gemeente" element={<GemeenteIndexPage />} />
      <Route path="/gemeente/:slug" element={<GemeenteDetailPage />} />
      <Route path="/gids" element={<GidsIndexPage />} />
      <Route path="/gids/:slug" element={<GidsDetailPage />} />
      <Route path="/woordenlijst" element={<WoordenlijstIndexPage />} />
      <Route path="/woordenlijst/:slug" element={<WoordenlijstDetailPage />} />
      <Route path="/over-ons" element={<OverOnsPage />} />
      <Route path="/voor-installateurs" element={<VoorInstallateursPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/voorwaarden" element={<VoorwaardenPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
