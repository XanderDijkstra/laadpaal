import { useEffect, useRef, useState } from "react";
import type { ChargingStation } from "@/data/types";
import { getTariff } from "@/data/operatorTariffs";

interface Props {
  stations: ChargingStation[];
  // Initial center [lat, lng]; default = Vlaanderen approx midpoint
  center?: [number, number];
  zoom?: number;
  // Auto-fit bounds to stations on first render (ignored if center is set explicitly with focus)
  autoFit?: boolean;
  height?: number;
}

// Vlaams middelpunt (Geraardsbergen-omgeving) — goed startpunt voor heel Vlaanderen
const FLANDERS_CENTER: [number, number] = [50.95, 4.5];

// Tailwind-ish kleuren: blauw=AC, oranje=DC, groen=AC+DC
const COLORS: Record<string, string> = {
  AC: "#3b82f6",
  DC: "#f59e0b",
  "AC+DC": "#16a34a",
};

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function popupHtml(s: ChargingStation): string {
  const t = getTariff(s.operator);
  const price =
    s.type === "DC"
      ? t.dcPrice
      : s.type === "AC"
        ? t.acPrice
        : (t.acPrice ?? t.dcPrice);
  const priceLine =
    price != null
      ? `<div style="margin-top:4px;font-size:11px;color:#64748b">≈ €${price.toFixed(2)}/kWh via ${escapeHtml(t.name)}</div>`
      : "";
  return `
    <div style="font-family:Inter,system-ui,-apple-system,sans-serif;line-height:1.35;min-width:200px">
      <div style="font-weight:700;font-size:14px">${escapeHtml(s.name)}</div>
      <div style="font-size:12px;color:#475569;margin-top:2px">${escapeHtml(s.address ?? "")} · ${escapeHtml(s.postcode ?? "")}</div>
      <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;font-size:11px">
        <span style="background:${COLORS[s.type] ?? "#475569"};color:#fff;padding:2px 6px;border-radius:4px;font-weight:600">${escapeHtml(s.type)}</span>
        <span style="background:#eef2f7;color:#0f172a;padding:2px 6px;border-radius:4px">${s.maxKw} kW</span>
        <span style="background:#eef2f7;color:#0f172a;padding:2px 6px;border-radius:4px">${s.connectors} ${s.connectors === 1 ? "stekker" : "stekkers"}</span>
      </div>
      ${priceLine}
      <div style="margin-top:8px;display:flex;flex-direction:column;gap:4px">
        <a href="/laadpunt/${escapeHtml(s.id)}" style="color:#16a34a;font-size:12px;font-weight:600;text-decoration:none">Meer info, route en alternatieven →</a>
        <a href="/laadpunten/${escapeHtml(s.gemeenteSlug)}" style="color:#64748b;font-size:11px;text-decoration:none">Alle laadpalen in ${escapeHtml(s.gemeenteSlug)} →</a>
      </div>
    </div>
  `;
}

export function LaadpuntenMap({
  stations,
  center = FLANDERS_CENTER,
  zoom = 9,
  autoFit = true,
  height = 480,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let cleanup = () => {};

    (async () => {
      if (!containerRef.current) return;
      try {
        // 1) Leaflet eerst — markercluster leest `window.L` op module-load
        const { default: L } = await import("leaflet");
        await import("leaflet/dist/leaflet.css");
        (window as unknown as { L: typeof L }).L = L;
        // 2) Pas dan markercluster (die patcht zichzelf op de global L)
        await import("leaflet.markercluster");
        await import("leaflet.markercluster/dist/MarkerCluster.css");
        await import("leaflet.markercluster/dist/MarkerCluster.Default.css");
        if (cancelled || !containerRef.current) return;

        const map = L.map(containerRef.current, {
          scrollWheelZoom: false,
          attributionControl: true,
        }).setView(center, zoom);
        mapRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        // Zoom-on-click + scrollwheel after first interaction (UX: don't hijack page scroll)
        map.once("focus", () => map.scrollWheelZoom.enable());
        map.on("click", () => map.scrollWheelZoom.enable());

        // Cluster group with custom-coloured cluster icons
        const cluster = (L as unknown as {
          markerClusterGroup: (opts?: object) => unknown;
        }).markerClusterGroup({
          maxClusterRadius: 50,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          chunkedLoading: true,
        }) as {
          addLayer: (m: unknown) => void;
          getBounds: () => unknown;
          [k: string]: unknown;
        };

        for (const s of stations) {
          if (
            typeof s.lat !== "number" ||
            typeof s.lng !== "number" ||
            Number.isNaN(s.lat) ||
            Number.isNaN(s.lng)
          ) {
            continue;
          }
          const color = COLORS[s.type] ?? "#475569";
          const icon = L.divIcon({
            className: "lt-marker",
            html: `<span style="display:block;width:18px;height:18px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.3)"></span>`,
            iconSize: [18, 18],
            iconAnchor: [9, 9],
            popupAnchor: [0, -10],
          });
          const marker = L.marker([s.lat, s.lng], { icon, title: s.name });
          marker.bindPopup(popupHtml(s));
          cluster.addLayer(marker);
        }

        (map as unknown as { addLayer: (l: unknown) => void }).addLayer(cluster);

        if (autoFit && stations.length > 1) {
          try {
            const bounds = cluster.getBounds() as {
              isValid: () => boolean;
            };
            if (bounds && bounds.isValid && bounds.isValid()) {
              (map as unknown as {
                fitBounds: (b: unknown, opts?: object) => void;
              }).fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
            }
          } catch {
            /* ignore */
          }
        }

        setLoaded(true);
        cleanup = () => map.remove();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "kaart kon niet laden");
        }
      }
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-render markers when stations change after the initial mount
  useEffect(() => {
    if (!loaded || !mapRef.current) return;
    // Simple approach: skip — most callers don't change stations after mount.
    // If we ever need this, rebuild the cluster layer here.
  }, [loaded, stations]);

  return (
    <div className="rounded-md border border-border overflow-hidden bg-muted/40 relative">
      <div
        ref={containerRef}
        style={{ height, width: "100%" }}
        aria-label={`Kaart met ${stations.length} laadpunten`}
      />
      {!loaded && !error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/40 backdrop-blur-sm pointer-events-none">
          <div className="text-sm text-muted-foreground">Kaart laden…</div>
        </div>
      ) : null}
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/40 text-xs text-destructive p-4 text-center">
          Kaart kon niet laden: {error}
        </div>
      ) : null}
      <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border bg-card flex flex-wrap items-center gap-3">
        <span className="font-medium text-foreground">Legenda:</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: COLORS.AC }} />
          AC
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: COLORS.DC }} />
          DC snellader
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: COLORS["AC+DC"] }} />
          Beide
        </span>
        <span className="ml-auto">{stations.length} stations · klik voor scrollzoom</span>
      </div>
    </div>
  );
}
