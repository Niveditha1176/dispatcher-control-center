import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowLeft,
  Bike,
  Truck,
  MapPin,
  Phone,
  Clock,
  Fuel,
  Star,
  CheckCircle2,
  AlertTriangle,
  CircleDot,
  Timer,
  Calendar,
  Package,
  Weight,
} from "lucide-react";
import type { Driver, FleetVehicle } from "@shared/schema";
import { useLanguage } from "@/lib/i18n";

interface DriverDetailViewProps {
  driver: Driver;
  vehicle: FleetVehicle | undefined;
  onBack: () => void;
}

function ratingStars(rating: number) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.3;
  const stars = [];
  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(<Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />);
    } else if (i === full && hasHalf) {
      stars.push(
        <div key={i} className="relative w-3.5 h-3.5">
          <Star className="w-3.5 h-3.5 text-muted-foreground/30 absolute inset-0" />
          <div className="overflow-hidden w-[50%] absolute inset-0">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          </div>
        </div>
      );
    } else {
      stars.push(<Star key={i} className="w-3.5 h-3.5 text-muted-foreground/30" />);
    }
  }
  return stars;
}

function stopStatusIcon(status: "pending" | "completed" | "delayed") {
  switch (status) {
    case "completed": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case "delayed": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    case "pending": return <CircleDot className="w-4 h-4 text-muted-foreground" />;
  }
}

function fuelColor(level: number) {
  if (level >= 60) return "bg-emerald-500";
  if (level >= 30) return "bg-amber-500";
  return "bg-destructive";
}

function hoursColor(worked: number, max: number) {
  const pct = worked / max;
  if (pct >= 0.9) return "bg-destructive";
  if (pct >= 0.7) return "bg-amber-500";
  return "bg-emerald-500";
}

export function DriverDetailView({ driver, vehicle, onBack }: DriverDetailViewProps) {
  const { t, td } = useLanguage();
  const VehicleIcon = driver.vehicleType === "bike" ? Bike : Truck;

  function statusBadge(status: Driver["status"]) {
    switch (status) {
      case "active": return { variant: "default" as const, label: t("status.active") };
      case "idle": return { variant: "secondary" as const, label: t("status.idle") };
      case "offline": return { variant: "outline" as const, label: t("status.offline") };
    }
  }

  function stopStatusLabel(status: "pending" | "completed" | "delayed") {
    switch (status) {
      case "completed": return { text: t("status.completed"), variant: "default" as const };
      case "delayed": return { text: t("status.delayed"), variant: "destructive" as const };
      case "pending": return { text: t("status.pending"), variant: "secondary" as const };
    }
  }

  const badge = statusBadge(driver.status);
  const completedStops = driver.deliveryPoints.filter((p) => p.status === "completed").length;
  const pendingStops = driver.deliveryPoints.filter((p) => p.status === "pending").length;
  const delayedStops = driver.deliveryPoints.filter((p) => p.status === "delayed").length;
  const workPct = Math.min((driver.hoursWorkedToday / driver.maxHoursPerDay) * 100, 100);

  return (
    <div className="flex flex-col h-full" data-testid="driver-detail-view">
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          data-testid="btn-back-fleet"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-sm font-semibold text-foreground">{t("detail.title")}</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          <Card data-testid="card-driver-profile">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
                    {driver.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-semibold text-foreground" data-testid="text-driver-name">
                      {td(driver.name)}
                    </span>
                    <Badge variant={badge.variant} className="text-[10px] px-1.5 py-0">
                      {badge.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {ratingStars(driver.rating)}
                    <span className="text-xs text-muted-foreground ml-1">{driver.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1.5">
                    <Phone className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{driver.phone}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-2">
            <Card data-testid="card-vehicle-info">
              <CardContent className="p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <VehicleIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{t("detail.vehicle")}</span>
                </div>
                <span className="text-sm font-semibold text-foreground" data-testid="text-license-plate">
                  {vehicle?.licensePlate ?? t("detail.na")}
                </span>
                <div className="text-[10px] text-muted-foreground mt-0.5 capitalize">{td(driver.vehicleType)}</div>
              </CardContent>
            </Card>

            <Card data-testid="card-fuel-info">
              <CardContent className="p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Fuel className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{t("detail.fuel")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground" data-testid="text-fuel-level">
                    {vehicle?.fuelLevel ?? 0}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted mt-1.5">
                  <div
                    className={`h-full rounded-full transition-all ${fuelColor(vehicle?.fuelLevel ?? 0)}`}
                    style={{ width: `${vehicle?.fuelLevel ?? 0}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card data-testid="card-capacity-info">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Weight className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{t("detail.loadCapacity")}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground" data-testid="text-load-info">
                  {driver.currentLoadKg} / {driver.vehicleCapacityKg} kg
                </span>
                <Badge variant={driver.currentLoadKg / driver.vehicleCapacityKg > 0.85 ? "destructive" : "secondary"} className="text-[10px] px-1.5 py-0">
                  {Math.round((driver.currentLoadKg / driver.vehicleCapacityKg) * 100)}% {t("detail.full")}
                </Badge>
              </div>
              <div className="w-full h-1.5 rounded-full bg-muted mt-1.5">
                <div
                  className={`h-full rounded-full transition-all ${
                    driver.currentLoadKg / driver.vehicleCapacityKg > 0.85
                      ? "bg-destructive"
                      : driver.currentLoadKg / driver.vehicleCapacityKg > 0.6
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min((driver.currentLoadKg / driver.vehicleCapacityKg) * 100, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-shift-info">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Timer className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{t("detail.workingHours")}</span>
              </div>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <span className="text-sm font-semibold text-foreground" data-testid="text-hours-worked">
                    {driver.hoursWorkedToday.toFixed(1)}h
                  </span>
                  <span className="text-xs text-muted-foreground"> / {driver.maxHoursPerDay}h {t("detail.max")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">
                    {driver.shiftStart} - {driver.shiftEnd}
                  </span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-muted mt-2">
                <div
                  className={`h-full rounded-full transition-all ${hoursColor(driver.hoursWorkedToday, driver.maxHoursPerDay)}`}
                  style={{ width: `${workPct}%` }}
                />
              </div>
              {driver.hoursWorkedToday >= driver.maxHoursPerDay * 0.9 && (
                <div className="flex items-center gap-1 mt-1.5">
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">{t("detail.shiftLimit")}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-delivery-summary">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Package className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{t("detail.deliverySummary")}</span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{td(driver.currentRoute)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="default" className="text-[10px] px-1.5 py-0">
                  {completedStops} {t("detail.delivered")}
                </Badge>
                {pendingStops > 0 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {pendingStops} {t("status.pending")}
                  </Badge>
                )}
                {delayedStops > 0 && (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                    {delayedStops} {t("status.delayed")}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <div>
            <div className="flex items-center gap-1.5 mb-2 px-1">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                {t("detail.allStops")} ({driver.deliveryPoints.length})
              </span>
            </div>
            <div className="space-y-1.5">
              {driver.deliveryPoints.length === 0 && (
                <Card>
                  <CardContent className="p-4 text-center">
                    <span className="text-xs text-muted-foreground">{t("detail.noStops")}</span>
                  </CardContent>
                </Card>
              )}
              {driver.deliveryPoints.map((point, index) => {
                const sl = stopStatusLabel(point.status);
                return (
                  <Tooltip key={point.id}>
                    <TooltipTrigger asChild>
                      <Card
                        className="cursor-default"
                        data-testid={`stop-card-${point.id}`}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-2.5">
                            <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
                              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                <span className="text-[10px] font-semibold text-muted-foreground">{index + 1}</span>
                              </div>
                              {index < driver.deliveryPoints.length - 1 && (
                                <div className="w-px h-3 bg-border" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                  {stopStatusIcon(point.status)}
                                  <span className="text-xs font-medium text-foreground truncate">{td(point.address)}</span>
                                </div>
                                <Badge variant={sl.variant} className="text-[10px] px-1.5 py-0 flex-shrink-0">
                                  {sl.text}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                                  <span className="text-[10px] text-muted-foreground">
                                    {t("detail.eta")}: {point.estimatedTime}
                                  </span>
                                </div>
                                {point.actualTime && (
                                  <div className="flex items-center gap-1">
                                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                                    <span className="text-[10px] text-muted-foreground">
                                      {t("detail.actual")}: {point.actualTime}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <div className="space-y-1">
                        <div className="text-xs font-medium">{td(point.address)}</div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs">{t("detail.estimatedEta")}: {point.estimatedTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Timer className="w-3 h-3" />
                          <span className="text-xs">{t("detail.deliveryWindow")}: {point.deliveryWindow}</span>
                        </div>
                        {point.actualTime && (
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span className="text-xs">{t("detail.deliveredAt")}: {point.actualTime}</span>
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
