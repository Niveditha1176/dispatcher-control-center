import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Bike,
  Truck,
  MapPin,
  Phone,
  Settings2,
  Package,
  Fuel,
} from "lucide-react";
import type { Driver } from "@shared/schema";

interface DriverSidebarProps {
  drivers: Driver[];
  onOverride?: (driverId: string) => void;
}

function driverStatusBadge(status: Driver["status"], t: (key: string) => string) {
  switch (status) {
    case "active":
      return { variant: "default" as const, label: t("status.active") };
    case "idle":
      return { variant: "secondary" as const, label: t("status.idle") };
    case "offline":
      return { variant: "outline" as const, label: t("status.offline") };
  }
}

function statusDot(status: Driver["status"]) {
  switch (status) {
    case "active":
      return "bg-emerald-500";
    case "idle":
      return "bg-amber-500";
    case "offline":
      return "bg-muted-foreground/40";
  }
}

export function DriverSidebar({ drivers, onOverride }: DriverSidebarProps) {
  const { t, td } = useLanguage();
  return (
    <div className="flex flex-col h-full" data-testid="driver-sidebar">
      <div className="flex items-center justify-between gap-2 flex-wrap px-4 py-3 border-b">
        <h2 className="text-sm font-semibold text-foreground">{t("dash.drivers")}</h2>
        <span className="text-xs text-muted-foreground">
          {drivers.filter((d) => d.status === "active").length} {t("dash.active")}
        </span>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {drivers.map((driver) => {
            const VehicleIcon = driver.vehicleType === "bike" ? Bike : Truck;
            const badge = driverStatusBadge(driver.status, t);
            return (
              <Card
                key={driver.id}
                className="border-card-border"
                data-testid={`driver-card-${driver.id}`}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <Avatar className="w-9 h-9">
                        <AvatarFallback className="text-xs font-medium bg-muted text-muted-foreground">
                          {driver.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${statusDot(driver.status)}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground truncate">
                          {td(driver.name)}
                        </span>
                        <Badge
                          variant={badge.variant}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {badge.label}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-foreground flex-shrink-0" />
                        <span
                          className="text-xs font-semibold text-foreground"
                          data-testid={`driver-locality-${driver.id}`}
                        >
                          {td(driver.homeLocality)}
                        </span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {t("dash.home")}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          <VehicleIcon className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground capitalize">
                            {td(driver.vehicleType)}
                          </span>
                        </div>
                        {driver.status !== "offline" && (
                          <>
                            <div className="flex items-center gap-1">
                              <Package className="w-3 h-3 text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground">
                                {driver.dropsCompleted}/{driver.dropsTotal}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Fuel className="w-3 h-3 text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground">
                                {driver.fuelConsumption}L/hr
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {driver.status !== "offline" && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                          <span className="text-[10px] text-muted-foreground">
                            {t("dash.deliveringIn")} {td(driver.currentRoute)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-2 border-t flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs gap-1"
                      onClick={() => onOverride?.(driver.id)}
                      data-testid={`btn-override-${driver.id}`}
                    >
                      <Settings2 className="w-3 h-3" />
                      {t("dash.manualOverride")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      data-testid={`btn-call-${driver.id}`}
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
