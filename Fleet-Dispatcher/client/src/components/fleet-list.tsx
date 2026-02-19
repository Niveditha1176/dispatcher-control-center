import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bike, Truck, Fuel } from "lucide-react";
import type { FleetVehicle } from "@shared/schema";
import { useLanguage } from "@/lib/i18n";

interface FleetListProps {
  vehicles: FleetVehicle[];
  onDriverClick?: (driverId: string) => void;
}

function statusColor(status: FleetVehicle["status"]) {
  switch (status) {
    case "en-route":
      return "default";
    case "idle":
      return "secondary";
    case "maintenance":
      return "outline";
  }
}

function fuelColor(level: number) {
  if (level >= 60) return "bg-emerald-500";
  if (level >= 30) return "bg-amber-500";
  return "bg-destructive";
}

export function FleetList({ vehicles, onDriverClick }: FleetListProps) {
  const { t, td } = useLanguage();

  function statusLabel(status: FleetVehicle["status"]) {
    switch (status) {
      case "en-route":
        return t("status.enRoute");
      case "idle":
        return t("status.idle");
      case "maintenance":
        return t("status.maintenance");
    }
  }

  return (
    <div className="flex flex-col h-full" data-testid="fleet-list">
      <div className="flex items-center justify-between gap-2 flex-wrap px-4 py-3 border-b">
        <h2 className="text-sm font-semibold text-foreground">{t("fleet.title")}</h2>
        <span className="text-xs text-muted-foreground">
          {vehicles.length} {t("fleet.vehicles")}
        </span>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {vehicles.map((vehicle) => {
            const VehicleIcon = vehicle.type === "bike" ? Bike : Truck;
            return (
              <div
                key={vehicle.id}
                className="flex items-center gap-3 p-3 rounded-md hover-elevate cursor-pointer"
                onClick={() => onDriverClick?.(vehicle.driverId)}
                data-testid={`fleet-vehicle-${vehicle.id}`}
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-md bg-muted">
                  <VehicleIcon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground truncate">
                      {td(vehicle.driverName)}
                    </span>
                    <Badge variant={statusColor(vehicle.status)} className="text-[10px] px-1.5 py-0">
                      {statusLabel(vehicle.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground truncate">
                      {vehicle.licensePlate}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {td(vehicle.currentArea)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Fuel className="w-3 h-3 text-muted-foreground" />
                  <div className="w-12 h-1.5 rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${fuelColor(vehicle.fuelLevel)}`}
                      style={{ width: `${vehicle.fuelLevel}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground w-7 text-right">
                    {vehicle.fuelLevel}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
