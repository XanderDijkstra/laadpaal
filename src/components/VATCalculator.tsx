import { useState } from "react";
import { Card } from "./ui/Card";
import { formatEuro } from "@/lib/utils";
import { Calculator } from "lucide-react";

export function VATCalculator() {
  const [price, setPrice] = useState(1800);

  const ex = price / 1.21;
  const at6 = ex * 1.06;
  const savings = price - at6;

  return (
    <Card className="p-6 md:p-8">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Calculator className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-xl font-bold tracking-tight">
            6% btw — bereken uw besparing
          </h3>
          <p className="text-sm text-muted-foreground">
            Voor woningen ouder dan 10 jaar geldt 6% btw in plaats van 21%.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <label className="text-sm font-medium">
          Geschatte all-in prijs (incl. 21% btw)
        </label>
        <div className="mt-2 flex items-center gap-3">
          <span className="font-mono text-base">€</span>
          <input
            type="range"
            min={800}
            max={4000}
            step={50}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <span className="font-mono text-base font-semibold w-24 text-right">
            {formatEuro(price)}
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-md border border-border p-4">
          <div className="text-xs text-muted-foreground">Excl. btw</div>
          <div className="font-mono text-lg font-semibold mt-1">
            {formatEuro(ex)}
          </div>
        </div>
        <div className="rounded-md border border-primary/30 bg-primary/5 p-4">
          <div className="text-xs text-primary font-medium">Met 6% btw</div>
          <div className="font-mono text-lg font-bold text-primary mt-1">
            {formatEuro(at6)}
          </div>
        </div>
        <div className="rounded-md border border-success/30 bg-success/5 p-4">
          <div className="text-xs text-success font-medium">Uw besparing</div>
          <div className="font-mono text-lg font-bold text-success mt-1">
            −{formatEuro(savings)}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        Schatting. Definitieve toepassing van het 6%-tarief vereist o.a. een
        woning ≥ 10 jaar oud, plaatsing door een erkend installateur en
        bestemming als privéwoning.
      </p>
    </Card>
  );
}
