import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n";
import { Clock, Package, MapPin, Leaf } from "lucide-react";
import type { KpiData } from "@shared/schema";

interface KpiBarProps {
  data: KpiData;
}

export function KpiBar({ data }: KpiBarProps) {
  const { t } = useLanguage();

  const kpiConfig: Array<{
    key: keyof KpiData;
    label: string;
    format: (v: number, co2?: number) => string;
    icon: typeof Clock;
    accent: string;
  }> = [
    {
      key: "onTimeRate",
      label: t("kpi.onTime"),
      format: (v) => `${v}%`,
      icon: Clock,
      accent: "bg-primary/10 text-primary",
    },
    {
      key: "dropsPerRoute",
      label: t("kpi.drops"),
      format: (v) => `${v}`,
      icon: Package,
      accent: "bg-primary/10 text-primary",
    },
    {
      key: "totalDistance",
      label: t("kpi.distance"),
      format: (v) => `${v} km`,
      icon: MapPin,
      accent: "bg-primary/10 text-primary",
    },
    {
      key: "fuelSavings",
      label: t("kpi.fuel"),
      format: (v, co2) => `${v}% ${t("kpi.fuelLabel")} · ${co2}% CO₂`,
      icon: Leaf,
      accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
  ];

  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      data-testid="kpi-bar"
    >
      {kpiConfig.map((kpi) => {
        const Icon = kpi.icon;
        const value =
          kpi.key === "fuelSavings"
            ? kpi.format(data.fuelSavings, data.co2Reduction)
            : kpi.format(data[kpi.key] as number, 0);
        return (
          <Card key={kpi.key} className="border-0 bg-card">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    data-testid={`kpi-label-${kpi.key}`}
                  >
                    {kpi.label}
                  </p>
                  <p
                    className="text-xl font-semibold mt-1 text-foreground"
                    data-testid={`kpi-value-${kpi.key}`}
                  >
                    {value}
                  </p>
                </div>
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-md ${kpi.accent}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
