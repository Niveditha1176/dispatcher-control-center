import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/lib/i18n";
import { LanguageToggle } from "@/components/language-toggle";
import { Bell, Radio, RefreshCw, ArrowLeft, Zap, ShieldCheck } from "lucide-react";
import { KpiBar } from "@/components/kpi-bar";
import { FleetList } from "@/components/fleet-list";
import { LiveMap } from "@/components/live-map";
import { DriverSidebar } from "@/components/driver-sidebar";
import { DriverDetailView } from "@/components/driver-detail-view";
import { NotificationsDrawer } from "@/components/notifications-drawer";
import { RouteOverrideModal } from "@/components/route-override-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import type { KpiData, Driver, FleetVehicle, Notification, MapMarker } from "@shared/schema";

function DashboardSkeleton() {
  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <div className="flex-1 flex gap-4">
        <Skeleton className="w-1/4 rounded-xl" />
        <Skeleton className="flex-1 rounded-xl" />
        <Skeleton className="w-1/4 rounded-xl" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [detailDriverId, setDetailDriverId] = useState<string | null>(null);
  const { toast } = useToast();
  const { t, td } = useLanguage();

  const kpiQuery = useQuery<KpiData>({
    queryKey: ["/api/kpis"],
  });

  const driversQuery = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  const fleetQuery = useQuery<FleetVehicle[]>({
    queryKey: ["/api/fleet"],
  });

  const notificationsQuery = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    refetchInterval: 15000,
  });

  const markersQuery = useQuery<MapMarker[]>({
    queryKey: ["/api/markers"],
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("POST", `/api/notifications/${id}/acknowledge`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const isLoading =
    kpiQuery.isLoading ||
    driversQuery.isLoading ||
    fleetQuery.isLoading ||
    notificationsQuery.isLoading ||
    markersQuery.isLoading;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const kpis = kpiQuery.data!;
  const drivers = driversQuery.data ?? [];
  const fleet = fleetQuery.data ?? [];
  const notifications = notificationsQuery.data ?? [];
  const markers = markersQuery.data ?? [];

  const unreadCount = notifications.filter((n) => !n.acknowledged).length;

  function handleOverride(driverId: string) {
    setSelectedDriverId(driverId);
    setOverrideOpen(true);
  }

  function handleAcknowledge(id: string) {
    acknowledgeMutation.mutate(id);
  }

  function handleDriverClick(driverId: string) {
    setDetailDriverId(driverId);
  }

  const detailDriver = detailDriverId ? drivers.find((d) => d.id === detailDriverId) : null;
  const detailVehicle = detailDriverId ? fleet.find((v) => v.driverId === detailDriverId) : undefined;

  return (
    <div className="flex flex-col h-screen bg-background" data-testid="dashboard">
      <header className="flex items-center justify-between gap-3 flex-wrap px-4 py-2.5 border-b bg-background sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="btn-back-home">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground leading-tight">
              {t("dash.title")}
            </h1>
            <p className="text-[10px] text-muted-foreground">
              {t("dash.subtitle")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/urgent-order">
            <Button variant="destructive" size="sm" className="gap-1.5" data-testid="btn-urgent-order">
              <Zap className="w-3.5 h-3.5" />
              {t("dash.urgentOrder")}
            </Button>
          </Link>
          <Link href="/admin-approvals">
            <Button variant="outline" size="sm" className="gap-1.5" data-testid="btn-admin-approvals">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t("dash.approvals")}
            </Button>
          </Link>
          <LanguageToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              queryClient.invalidateQueries();
              toast({ title: t("dash.refresh"), description: t("dash.refreshDesc") });
            }}
            data-testid="btn-refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setNotifOpen(true)}
              data-testid="btn-notifications"
            >
              <Bell className="w-3.5 h-3.5" />
              {t("dash.notifications")}
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="text-[10px] px-1.5 py-0 ml-1"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 pt-4 pb-2">
          <KpiBar data={kpis} />
        </div>

        <div className="flex-1 flex overflow-hidden px-4 pb-4 gap-3 pt-2">
          <div className="w-64 xl:w-72 flex-shrink-0 border rounded-md bg-card overflow-hidden">
            {detailDriver ? (
              <DriverDetailView
                driver={detailDriver}
                vehicle={detailVehicle}
                onBack={() => setDetailDriverId(null)}
              />
            ) : (
              <FleetList
                vehicles={fleet}
                onDriverClick={handleDriverClick}
              />
            )}
          </div>

          <div className="flex-1 border rounded-md bg-card overflow-hidden min-w-0 relative z-0 isolate">
            <LiveMap markers={markers} />
          </div>

          <div className="w-72 xl:w-80 flex-shrink-0 border rounded-md bg-card overflow-hidden">
            <DriverSidebar
              drivers={drivers}
              onOverride={handleOverride}
            />
          </div>
        </div>
      </div>

      <NotificationsDrawer
        open={notifOpen}
        onOpenChange={setNotifOpen}
        notifications={notifications}
        onAcknowledge={handleAcknowledge}
      />

      <RouteOverrideModal
        open={overrideOpen}
        onOpenChange={setOverrideOpen}
        selectedDriverId={selectedDriverId}
      />
    </div>
  );
}
