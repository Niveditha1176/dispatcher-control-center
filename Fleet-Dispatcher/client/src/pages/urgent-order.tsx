import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLanguage } from "@/lib/i18n";
import { LanguageToggle } from "@/components/language-toggle";
import {
  ArrowLeft,
  Search,
  Warehouse,
  MapPin,
  Package,
  Clock,
  Bike,
  Truck,
  Star,
  Weight,
  Timer,
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Radio,
} from "lucide-react";
import type { DriverCandidate, UrgentOrderInput } from "@shared/schema";

const WAREHOUSES = [
  { name: "Central Warehouse, Guindy", lat: 13.0067, lng: 80.2206 },
  { name: "North Hub, Anna Nagar", lat: 13.0850, lng: 80.2101 },
  { name: "South Hub, Tambaram", lat: 12.9249, lng: 80.1000 },
  { name: "East Hub, Adyar", lat: 13.0012, lng: 80.2565 },
  { name: "West Hub, Porur", lat: 13.0382, lng: 80.1564 },
];

const DELIVERY_LOCATIONS = [
  { name: "T. Nagar", lat: 13.0418, lng: 80.2341 },
  { name: "Anna Nagar", lat: 13.0850, lng: 80.2101 },
  { name: "Adyar", lat: 13.0012, lng: 80.2565 },
  { name: "Velachery", lat: 12.9816, lng: 80.2185 },
  { name: "Mylapore", lat: 13.0368, lng: 80.2676 },
  { name: "Tambaram", lat: 12.9249, lng: 80.1000 },
  { name: "Porur", lat: 13.0382, lng: 80.1564 },
  { name: "Guindy", lat: 13.0067, lng: 80.2206 },
  { name: "Chromepet", lat: 12.9516, lng: 80.1462 },
  { name: "Perambur", lat: 13.1187, lng: 80.2332 },
  { name: "Thiruvanmiyur", lat: 12.9830, lng: 80.2594 },
  { name: "Kilpauk", lat: 13.0842, lng: 80.2428 },
  { name: "Kodambakkam", lat: 13.0524, lng: 80.2247 },
  { name: "Nungambakkam", lat: 13.0569, lng: 80.2425 },
  { name: "Egmore", lat: 13.0732, lng: 80.2609 },
  { name: "Sholinganallur", lat: 12.9010, lng: 80.2279 },
];

export default function UrgentOrder() {
  const { toast } = useToast();
  const { t, td } = useLanguage();
  const [, setLocation] = useLocation();

  const [orderDescription, setOrderDescription] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryAreaIdx, setDeliveryAreaIdx] = useState<number>(-1);
  const [packageDescription, setPackageDescription] = useState("");
  const [packageWeight, setPackageWeight] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [warehouseIdx, setWarehouseIdx] = useState(0);

  const [candidates, setCandidates] = useState<DriverCandidate[] | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [assignedDriver, setAssignedDriver] = useState<string | null>(null);

  const findMutation = useMutation({
    mutationFn: async (payload: UrgentOrderInput) => {
      const res = await apiRequest("POST", "/api/urgent-order/find-drivers", payload);
      return res.json() as Promise<DriverCandidate[]>;
    },
    onSuccess: (data) => {
      setCandidates(data);
      setSelectedCandidateId(null);
      if (data.length === 0) {
        toast({ title: t("urgent.noMatchingToast"), description: t("urgent.noMatchingToastDesc"), variant: "destructive" });
      }
    },
    onError: () => {
      toast({ title: t("urgent.searchFailed"), description: t("urgent.searchFailedDesc"), variant: "destructive" });
    },
  });

  const assignMutation = useMutation({
    mutationFn: async (driverId: string) => {
      const wh = WAREHOUSES[warehouseIdx];
      const deliveryLoc = deliveryAreaIdx >= 0 ? DELIVERY_LOCATIONS[deliveryAreaIdx] : { lat: 13.0827, lng: 80.2707 };
      const deliveryLocName = deliveryAreaIdx >= 0 ? DELIVERY_LOCATIONS[deliveryAreaIdx].name : "Chennai";
      const payload = {
        driverId,
        order: {
          orderDescription,
          deliveryAddress: deliveryAddress || deliveryLocName,
          deliveryLat: deliveryLoc.lat,
          deliveryLng: deliveryLoc.lng,
          packageDescription,
          packageWeightKg: parseFloat(packageWeight),
          requiredDeliveryTime: deliveryTime,
          warehouseLat: wh.lat,
          warehouseLng: wh.lng,
        },
      };
      const res = await apiRequest("POST", "/api/urgent-order/assign", payload);
      return res.json();
    },
    onSuccess: (_data, driverId) => {
      const driver = candidates?.find((c) => c.driverId === driverId);
      setAssignedDriver(driver?.driverName ?? driverId);
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/fleet"] });
      toast({ title: t("urgent.orderAssigned"), description: `${t("urgent.orderAssignedDesc")} ${td(driver?.driverName ?? "driver")}.` });
    },
    onError: () => {
      toast({ title: t("urgent.assignFailed"), description: t("urgent.assignFailedDesc"), variant: "destructive" });
    },
  });

  function handleSearch() {
    const wh = WAREHOUSES[warehouseIdx];
    const deliveryLoc = deliveryAreaIdx >= 0 ? DELIVERY_LOCATIONS[deliveryAreaIdx] : null;
    if (!orderDescription.trim() || !packageDescription.trim() || !packageWeight || !deliveryTime || !deliveryLoc) {
      toast({ title: t("urgent.missingFields"), description: t("urgent.missingFieldsDesc"), variant: "destructive" });
      return;
    }
    const weight = parseFloat(packageWeight);
    if (isNaN(weight) || weight <= 0) {
      toast({ title: t("urgent.invalidWeight"), description: t("urgent.invalidWeightDesc"), variant: "destructive" });
      return;
    }
    findMutation.mutate({
      orderDescription,
      deliveryAddress: deliveryAddress || deliveryLoc.name,
      deliveryLat: deliveryLoc.lat,
      deliveryLng: deliveryLoc.lng,
      packageDescription,
      packageWeightKg: weight,
      requiredDeliveryTime: deliveryTime,
      warehouseLat: wh.lat,
      warehouseLng: wh.lng,
    });
  }

  if (assignedDriver) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" data-testid="urgent-order-success">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-1" data-testid="text-success-title">{t("urgent.orderAssigned")}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {t("urgent.orderAssignedDesc")} <span className="font-medium text-foreground">{td(assignedDriver)}</span>. {t("urgent.pickupDeliver")}
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Button variant="outline" onClick={() => { setAssignedDriver(null); setCandidates(null); setSelectedCandidateId(null); }} data-testid="btn-new-order">
                {t("urgent.newOrder")}
              </Button>
              <Link href="/dashboard">
                <Button data-testid="btn-back-dashboard">
                  {t("urgent.backDashboard")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="urgent-order-page">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" data-testid="btn-back-dashboard-header">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-destructive text-destructive-foreground">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground leading-tight">{t("urgent.title")}</h1>
              <p className="text-[10px] text-muted-foreground">{t("urgent.desc")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="gap-1.5" data-testid="link-dashboard">
                <Radio className="w-3.5 h-3.5" />
                {t("urgent.dashboard")}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card data-testid="card-warehouse">
              <CardContent className="p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <Warehouse className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wide">{t("urgent.warehouseLocation")}</span>
                </div>
                <div className="space-y-1.5">
                  {WAREHOUSES.map((wh, idx) => (
                    <button
                      key={idx}
                      onClick={() => setWarehouseIdx(idx)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors ${
                        warehouseIdx === idx
                          ? "bg-primary/10 border border-primary/30"
                          : "hover-elevate border border-transparent"
                      }`}
                      data-testid={`warehouse-option-${idx}`}
                    >
                      <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${warehouseIdx === idx ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-xs ${warehouseIdx === idx ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                        {td(wh.name)}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-order-details">
              <CardContent className="p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wide">{t("urgent.orderDetails")}</span>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="order-desc" className="text-xs">{t("urgent.orderDesc")}</Label>
                    <Textarea
                      id="order-desc"
                      placeholder={t("urgent.orderDescPlaceholder")}
                      value={orderDescription}
                      onChange={(e) => setOrderDescription(e.target.value)}
                      className="resize-none text-xs"
                      rows={2}
                      data-testid="input-order-description"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="delivery-area" className="text-xs">{t("urgent.deliveryArea")}</Label>
                    <select
                      id="delivery-area"
                      value={deliveryAreaIdx}
                      onChange={(e) => {
                        const idx = parseInt(e.target.value);
                        setDeliveryAreaIdx(idx);
                        if (idx >= 0) setDeliveryAddress(DELIVERY_LOCATIONS[idx].name);
                      }}
                      className="w-full h-9 rounded-md border bg-background px-3 text-xs text-foreground"
                      data-testid="select-delivery-area"
                    >
                      <option value={-1}>{t("urgent.selectArea")}</option>
                      {DELIVERY_LOCATIONS.map((loc, i) => (
                        <option key={i} value={i}>{td(loc.name)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="delivery-addr" className="text-xs">{t("urgent.deliveryAddr")}</Label>
                    <Input
                      id="delivery-addr"
                      placeholder={t("urgent.deliveryAddrPlaceholder")}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="text-xs"
                      data-testid="input-delivery-address"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="pkg-desc" className="text-xs">{t("urgent.pkgDesc")}</Label>
                    <Input
                      id="pkg-desc"
                      placeholder={t("urgent.pkgDescPlaceholder")}
                      value={packageDescription}
                      onChange={(e) => setPackageDescription(e.target.value)}
                      className="text-xs"
                      data-testid="input-package-description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="pkg-weight" className="text-xs">{t("urgent.pkgWeight")}</Label>
                      <Input
                        id="pkg-weight"
                        type="number"
                        step="0.1"
                        min="0.1"
                        placeholder={t("urgent.pkgWeightPlaceholder")}
                        value={packageWeight}
                        onChange={(e) => setPackageWeight(e.target.value)}
                        className="text-xs"
                        data-testid="input-package-weight"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="del-time" className="text-xs">{t("urgent.deliveryTime")}</Label>
                      <Input
                        id="del-time"
                        placeholder="e.g. 02:00 PM"
                        value={deliveryTime}
                        onChange={(e) => setDeliveryTime(e.target.value)}
                        className="text-xs"
                        data-testid="input-delivery-time"
                      />
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full mt-4 gap-2"
                  onClick={handleSearch}
                  disabled={findMutation.isPending}
                  data-testid="btn-find-drivers"
                >
                  <Search className="w-4 h-4" />
                  {findMutation.isPending ? t("urgent.searching") : t("urgent.findDrivers")}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {!candidates && !findMutation.isPending && (
              <Card className="h-full min-h-[400px] flex items-center justify-center">
                <CardContent className="text-center p-8">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mx-auto mb-4">
                    <Search className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{t("urgent.enterDetails")}</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    {t("urgent.enterDetailsDesc")}
                  </p>
                </CardContent>
              </Card>
            )}

            {findMutation.isPending && (
              <Card className="h-full min-h-[400px] flex items-center justify-center">
                <CardContent className="text-center p-8">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 animate-pulse">
                    <Zap className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{t("urgent.scanningFleet")}</h3>
                  <p className="text-xs text-muted-foreground">{t("urgent.scanningDesc")}</p>
                </CardContent>
              </Card>
            )}

            {candidates && candidates.length === 0 && !findMutation.isPending && (
              <Card className="h-full min-h-[400px] flex items-center justify-center">
                <CardContent className="text-center p-8">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mx-auto mb-4">
                    <AlertTriangle className="w-7 h-7 text-destructive" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{t("urgent.noMatching")}</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    {t("urgent.noMatchingDesc")}
                  </p>
                </CardContent>
              </Card>
            )}

            {candidates && candidates.length > 0 && !findMutation.isPending && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">{t("urgent.topMatching")} {candidates.length} {t("urgent.matchingDrivers")}</h3>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{t("urgent.rankedBy")}</p>
                </div>

                {candidates.map((c, rank) => {
                  const VehicleIcon = c.vehicleType === "bike" ? Bike : Truck;
                  const isSelected = selectedCandidateId === c.driverId;
                  return (
                    <Card
                      key={c.driverId}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? "border-primary/50 bg-primary/5" : ""
                      }`}
                      onClick={() => setSelectedCandidateId(c.driverId)}
                      data-testid={`candidate-card-${c.driverId}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="relative flex-shrink-0">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                                {c.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                              <span className="text-[10px] font-bold">#{rank + 1}</span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-foreground" data-testid={`text-candidate-name-${c.driverId}`}>
                                {td(c.driverName)}
                              </span>
                              <Badge variant={c.status === "active" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                                {c.status === "active" ? t("status.active") : t("status.idle")}
                              </Badge>
                              <VehicleIcon className="w-3.5 h-3.5 text-muted-foreground" />
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-muted-foreground">{c.licensePlate}</span>
                              <span className="text-[10px] text-muted-foreground">{td(c.currentArea)}</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-[10px] text-muted-foreground">{t("urgent.distance")}</span>
                                </div>
                                <span className="text-xs font-semibold text-foreground" data-testid={`text-distance-${c.driverId}`}>
                                  {c.distanceToWarehouseKm} km
                                </span>
                              </div>
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1">
                                  <Weight className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-[10px] text-muted-foreground">{t("urgent.capacity")}</span>
                                </div>
                                <span className="text-xs font-semibold text-foreground">
                                  {c.remainingCapacityKg} kg
                                </span>
                              </div>
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1">
                                  <Timer className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-[10px] text-muted-foreground">{t("urgent.hoursLeft")}</span>
                                </div>
                                <span className="text-xs font-semibold text-foreground">
                                  {c.remainingHours}h
                                </span>
                              </div>
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                  <span className="text-[10px] text-muted-foreground">{t("urgent.rating")}</span>
                                </div>
                                <span className="text-xs font-semibold text-foreground">{c.rating}</span>
                              </div>
                            </div>

                            <div className="mt-3 p-2 rounded-md bg-muted/50 space-y-1.5">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-[10px] text-muted-foreground">{t("urgent.estPickup")}</span>
                                </div>
                                <span className="text-[10px] font-medium text-foreground">{c.estimatedPickupMin} {t("urgent.min")}</span>
                              </div>
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-1">
                                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-[10px] text-muted-foreground">{t("urgent.estDelivery")}</span>
                                </div>
                                <span className="text-[10px] font-medium text-foreground">{c.estimatedDeliveryMin} {t("urgent.min")}</span>
                              </div>
                              <div className="border-t pt-1.5 mt-1.5">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <span className="text-[10px] text-muted-foreground">{t("urgent.currentLastEta")}</span>
                                  <span className="text-[10px] font-medium text-foreground" data-testid={`text-old-eta-${c.driverId}`}>{c.oldEta}</span>
                                </div>
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <span className="text-[10px] text-muted-foreground">{t("urgent.newLastEta")}</span>
                                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0" data-testid={`text-new-eta-${c.driverId}`}>
                                    {c.newEta}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 pt-0.5">
                                <Package className="w-3 h-3 text-muted-foreground" />
                                <span className="text-[10px] text-muted-foreground">{c.currentStopsCount} {t("urgent.pendingStops")}</span>
                              </div>
                            </div>

                            {isSelected && (
                              <Button
                                className="w-full mt-3 gap-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  assignMutation.mutate(c.driverId);
                                }}
                                disabled={assignMutation.isPending}
                                data-testid={`btn-assign-${c.driverId}`}
                              >
                                <Zap className="w-4 h-4" />
                                {assignMutation.isPending ? t("urgent.assigning") : `${t("urgent.assignTo")} ${td(c.driverName)}`}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
