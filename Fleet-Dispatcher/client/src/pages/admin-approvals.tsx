import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLanguage } from "@/lib/i18n";
import { LanguageToggle } from "@/components/language-toggle";
import {
  ArrowLeft,
  ShieldCheck,
  CalendarOff,
  Clock,
  Fuel,
  Camera,
  CheckCircle2,
  XCircle,
  Calendar,
  Timer,
  IndianRupee,
  Droplets,
  Package,
  MapPin,
  Maximize2,
  Radio,
  AlertTriangle,
} from "lucide-react";
import type {
  LeaveRequest,
  OvertimeRequest,
  FuelBill,
  PODApproval,
} from "@shared/schema";

type TabType = "leave" | "overtime" | "fuel" | "pod";

const TABS: { key: TabType; labelKey: string; icon: typeof CalendarOff }[] = [
  { key: "leave", labelKey: "admin.tab.leave", icon: CalendarOff },
  { key: "overtime", labelKey: "admin.tab.overtime", icon: Clock },
  { key: "fuel", labelKey: "admin.tab.fuel", icon: Fuel },
  { key: "pod", labelKey: "admin.tab.pod", icon: Camera },
];

function leaveTypeBadge(type: string, t: (k: string) => string) {
  const map: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    sick: { variant: "destructive", label: t("leave.sick") },
    casual: { variant: "secondary", label: t("leave.casual") },
    emergency: { variant: "destructive", label: t("leave.emergency") },
    personal: { variant: "outline", label: t("leave.personal") },
  };
  return map[type] ?? { variant: "secondary", label: type };
}

function statusBadge(status: string, t: (k: string) => string) {
  if (status === "approved") return { variant: "default" as const, label: t("admin.approved"), className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" };
  if (status === "rejected") return { variant: "destructive" as const, label: t("admin.rejected"), className: "" };
  return { variant: "outline" as const, label: t("admin.pending"), className: "border-amber-500/40 text-amber-600 dark:text-amber-400" };
}

function ImageViewer({ src, alt }: { src: string; alt: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <button className="relative group cursor-pointer w-full text-left" onClick={() => setExpanded(true)} data-testid={`btn-view-image-${alt.replace(/\s+/g, "-").toLowerCase()}`}>
        <img
          src={src}
          alt={alt}
          className="w-full h-40 object-cover rounded-md border"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-md flex items-center justify-center">
          <Maximize2 className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </button>
      {expanded && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setExpanded(false)}
          data-testid="image-lightbox"
        >
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-full object-contain rounded-md"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white"
            onClick={() => setExpanded(false)}
            data-testid="btn-close-lightbox"
          >
            <XCircle className="w-6 h-6" />
          </Button>
        </div>
      )}
    </>
  );
}

function ApprovalActions({
  id,
  status,
  apiPath,
  queryKey,
}: {
  id: string;
  status: string;
  apiPath: string;
  queryKey: string;
}) {
  const { toast } = useToast();
  const { t } = useLanguage();

  const mutation = useMutation({
    mutationFn: async (newStatus: "approved" | "rejected") => {
      const res = await apiRequest("POST", `${apiPath}/${id}`, { status: newStatus });
      return res.json();
    },
    onSuccess: (_data, newStatus) => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast({
        title: newStatus === "approved" ? t("admin.approved") : t("admin.rejected"),
        description: newStatus === "approved" ? t("admin.requestApproved") : t("admin.requestRejected"),
      });
    },
    onError: () => {
      toast({ title: t("admin.actionFailed"), description: t("admin.actionFailedDesc"), variant: "destructive" });
    },
  });

  if (status !== "pending") {
    const sb = statusBadge(status, t);
    return <Badge variant={sb.variant} className={sb.className}>{sb.label}</Badge>;
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button
        size="sm"
        onClick={() => mutation.mutate("approved")}
        disabled={mutation.isPending}
        className="gap-1"
        data-testid={`btn-approve-${id}`}
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        {t("admin.approve")}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => mutation.mutate("rejected")}
        disabled={mutation.isPending}
        className="gap-1"
        data-testid={`btn-reject-${id}`}
      >
        <XCircle className="w-3.5 h-3.5" />
        {t("admin.reject")}
      </Button>
    </div>
  );
}

function LeaveTab() {
  const { t, td } = useLanguage();
  const { data: requests = [], isLoading } = useQuery<LeaveRequest[]>({
    queryKey: ["/api/approvals/leave"],
  });

  if (isLoading) return <LoadingSkeleton />;
  if (requests.length === 0) return <EmptyState text={t("admin.noLeave")} />;

  const pending = requests.filter((r) => r.status === "pending");
  const processed = requests.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-3">
      {pending.length > 0 && (
        <div className="flex items-center gap-1.5 mb-1">
          <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 text-[10px]">
            {pending.length} {t("admin.pending")}
          </Badge>
        </div>
      )}
      {[...pending, ...processed].map((req) => {
        const lt = leaveTypeBadge(req.leaveType, t);
        return (
          <Card key={req.id} data-testid={`leave-card-${req.id}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-9 h-9 flex-shrink-0">
                  <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">{req.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground" data-testid={`text-leave-name-${req.id}`}>{td(req.driverName)}</span>
                      <Badge variant={lt.variant} className="text-[10px] px-1.5 py-0">{lt.label}</Badge>
                    </div>
                    <ApprovalActions id={req.id} status={req.status} apiPath="/api/approvals/leave" queryKey="/api/approvals/leave" />
                  </div>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">{req.startDate} - {req.endDate}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{t("admin.submitted")}: {req.submittedAt}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{td(req.reason)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function OvertimeTab() {
  const { t, td } = useLanguage();
  const OVERTIME_THRESHOLD = 1.5;
  const { data: requests = [], isLoading } = useQuery<OvertimeRequest[]>({
    queryKey: ["/api/approvals/overtime"],
  });

  if (isLoading) return <LoadingSkeleton />;
  if (requests.length === 0) return <EmptyState text={t("admin.noOvertime")} />;

  const pending = requests.filter((r) => r.status === "pending");
  const processed = requests.filter((r) => r.status !== "pending");
  const exceedingThreshold = pending.filter((r) => r.extraHours > OVERTIME_THRESHOLD);

  return (
    <div className="space-y-3">
      {exceedingThreshold.length > 0 && (
        <Card className="border-red-500/30 bg-red-500/5" data-testid="overtime-threshold-warning">
          <CardContent className="p-3">
            <div className="flex items-start gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-red-500/10 flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-red-600 dark:text-red-400">{t("overtime.immediateAction")}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {exceedingThreshold.length} {exceedingThreshold.length > 1 ? t("overtime.requests") : t("overtime.request")} {t("overtime.thresholdWarn")} ({OVERTIME_THRESHOLD}h):{" "}
                  {exceedingThreshold.map((r, i) => (
                    <span key={r.id}>
                      <span className="font-medium text-foreground">{td(r.driverName)}</span> (+{r.extraHours}h)
                      {i < exceedingThreshold.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {pending.length > 0 && (
        <div className="flex items-center gap-1.5 mb-1">
          <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 text-[10px]">
            {pending.length} {t("admin.pending")}
          </Badge>
        </div>
      )}
      {[...pending, ...processed].map((req) => {
        const exceedsThreshold = req.extraHours > OVERTIME_THRESHOLD && req.status === "pending";
        return (
        <Card key={req.id} className={exceedsThreshold ? "border-red-500/30" : ""} data-testid={`overtime-card-${req.id}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="w-9 h-9 flex-shrink-0">
                <AvatarFallback className={`text-xs font-semibold ${exceedsThreshold ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-primary/10 text-primary"}`}>{req.avatar}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground" data-testid={`text-overtime-name-${req.id}`}>{td(req.driverName)}</span>
                    <Badge variant={exceedsThreshold ? "destructive" : "secondary"} className="text-[10px] px-1.5 py-0">+{req.extraHours}h {t("overtime.extra")}</Badge>
                    {exceedsThreshold && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-red-500/40 text-red-600 dark:text-red-400 gap-0.5" data-testid={`badge-threshold-${req.id}`}>
                        <AlertTriangle className="w-2.5 h-2.5" />
                        {t("overtime.overThreshold")}
                      </Badge>
                    )}
                  </div>
                  <ApprovalActions id={req.id} status={req.status} apiPath="/api/approvals/overtime" queryKey="/api/approvals/overtime" />
                </div>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">{req.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Timer className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">{req.scheduledEnd}</span>
                    <span className="text-[10px] text-muted-foreground mx-0.5">&rarr;</span>
                    <span className="text-[10px] font-medium text-foreground">{req.requestedEnd}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{td(req.reason)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        );
      })}
    </div>
  );
}

function FuelTab() {
  const { t, td } = useLanguage();
  const { data: bills = [], isLoading } = useQuery<FuelBill[]>({
    queryKey: ["/api/approvals/fuel"],
  });

  if (isLoading) return <LoadingSkeleton />;
  if (bills.length === 0) return <EmptyState text={t("admin.noFuel")} />;

  const pending = bills.filter((b) => b.status === "pending");
  const processed = bills.filter((b) => b.status !== "pending");

  return (
    <div className="space-y-3">
      {pending.length > 0 && (
        <div className="flex items-center gap-1.5 mb-1">
          <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 text-[10px]">
            {pending.length} {t("admin.pending")}
          </Badge>
        </div>
      )}
      {[...pending, ...processed].map((bill) => (
        <Card key={bill.id} data-testid={`fuel-card-${bill.id}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="w-9 h-9 flex-shrink-0">
                <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">{bill.avatar}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground" data-testid={`text-fuel-name-${bill.id}`}>{td(bill.driverName)}</span>
                    <Badge variant={bill.fuelType === "diesel" ? "secondary" : "outline"} className="text-[10px] px-1.5 py-0 capitalize">{td(bill.fuelType)}</Badge>
                  </div>
                  <ApprovalActions id={bill.id} status={bill.status} apiPath="/api/approvals/fuel" queryKey="/api/approvals/fuel" />
                </div>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">{bill.litres}L</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <IndianRupee className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] font-medium text-foreground">{bill.amountRs.toLocaleString("en-IN")}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{bill.vehiclePlate}</span>
                  <span className="text-[10px] text-muted-foreground">{bill.date}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{td(bill.stationName)}</p>
                <div className="mt-3">
                  <ImageViewer src={bill.receiptImageUrl} alt={`Fuel receipt from ${bill.stationName}`} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PODTab() {
  const { t, td } = useLanguage();
  const { data: pods = [], isLoading } = useQuery<PODApproval[]>({
    queryKey: ["/api/approvals/pod"],
  });

  if (isLoading) return <LoadingSkeleton />;
  if (pods.length === 0) return <EmptyState text={t("admin.noPod")} />;

  const pending = pods.filter((p) => p.status === "pending");
  const processed = pods.filter((p) => p.status !== "pending");

  return (
    <div className="space-y-3">
      {pending.length > 0 && (
        <div className="flex items-center gap-1.5 mb-1">
          <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 text-[10px]">
            {pending.length} {t("admin.pending")}
          </Badge>
        </div>
      )}
      {[...pending, ...processed].map((pod) => (
        <Card key={pod.id} data-testid={`pod-card-${pod.id}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="w-9 h-9 flex-shrink-0">
                <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">{pod.avatar}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground" data-testid={`text-pod-name-${pod.id}`}>{td(pod.driverName)}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{pod.orderId}</Badge>
                  </div>
                  <ApprovalActions id={pod.id} status={pod.status} apiPath="/api/approvals/pod" queryKey="/api/approvals/pod" />
                </div>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Package className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">{t("pod.customer")}: {td(pod.customerName)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">{pod.deliveredAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{td(pod.deliveryAddress)}</span>
                </div>
                <div className="mt-3">
                  <ImageViewer src={pod.photoUrl} alt={`Delivery proof for ${pod.orderId}`} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="h-3 w-48 bg-muted animate-pulse rounded" />
                <div className="h-3 w-full bg-muted animate-pulse rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <Card className="flex items-center justify-center min-h-[200px]">
      <CardContent className="text-center p-6">
        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">{text}</p>
      </CardContent>
    </Card>
  );
}

export default function AdminApprovals() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>("leave");

  const { data: leave = [] } = useQuery<LeaveRequest[]>({ queryKey: ["/api/approvals/leave"] });
  const { data: overtime = [] } = useQuery<OvertimeRequest[]>({ queryKey: ["/api/approvals/overtime"] });
  const { data: fuel = [] } = useQuery<FuelBill[]>({ queryKey: ["/api/approvals/fuel"] });
  const { data: pod = [] } = useQuery<PODApproval[]>({ queryKey: ["/api/approvals/pod"] });

  const pendingCounts: Record<TabType, number> = {
    leave: leave.filter((r) => r.status === "pending").length,
    overtime: overtime.filter((r) => r.status === "pending").length,
    fuel: fuel.filter((b) => b.status === "pending").length,
    pod: pod.filter((p) => p.status === "pending").length,
  };
  const totalPending = Object.values(pendingCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-background" data-testid="admin-approvals-page">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" data-testid="btn-back-dashboard">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-foreground leading-tight">{t("admin.title")}</h1>
                {totalPending > 0 && (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0" data-testid="badge-total-pending">
                    {totalPending} {t("admin.pending")}
                  </Badge>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">{t("admin.desc")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="gap-1.5" data-testid="link-dashboard">
                <Radio className="w-3.5 h-3.5" />
                {t("admin.dashboard")}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-1.5 mb-5 overflow-x-auto pb-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = pendingCounts[tab.key];
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover-elevate text-muted-foreground"
                }`}
                data-testid={`tab-${tab.key}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t(tab.labelKey)}
                {count > 0 && (
                  <span className={`ml-0.5 text-[10px] px-1.5 rounded-full font-semibold ${
                    isActive ? "bg-primary-foreground/20" : "bg-destructive/10 text-destructive"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {activeTab === "leave" && <LeaveTab />}
        {activeTab === "overtime" && <OvertimeTab />}
        {activeTab === "fuel" && <FuelTab />}
        {activeTab === "pod" && <PODTab />}
      </main>
    </div>
  );
}
