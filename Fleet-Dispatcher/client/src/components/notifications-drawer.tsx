import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  Clock,
  Navigation,
  Wrench,
  Check,
} from "lucide-react";
import type { Notification } from "@shared/schema";
import { useLanguage } from "@/lib/i18n";

interface NotificationsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: Notification[];
  onAcknowledge?: (id: string) => void;
}

function typeIcon(type: Notification["type"]) {
  switch (type) {
    case "late-delivery":
      return Clock;
    case "overtime-alert":
      return AlertTriangle;
    case "route-deviation":
      return Navigation;
    case "vehicle-issue":
      return Wrench;
  }
}

function typeLabel(type: Notification["type"], t: (key: string) => string) {
  switch (type) {
    case "late-delivery":
      return t("notif.lateDelivery");
    case "overtime-alert":
      return t("notif.overtimeAlert");
    case "route-deviation":
      return t("notif.routeDeviation");
    case "vehicle-issue":
      return t("notif.vehicleIssue");
  }
}

function severityBadge(severity: Notification["severity"]) {
  switch (severity) {
    case "high":
      return "destructive" as const;
    case "medium":
      return "secondary" as const;
    case "low":
      return "outline" as const;
  }
}

export function NotificationsDrawer({
  open,
  onOpenChange,
  notifications,
  onAcknowledge,
}: NotificationsDrawerProps) {
  const { t, td } = useLanguage();
  const unread = notifications.filter((n) => !n.acknowledged).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-4 pt-6 pb-3 border-b">
          <SheetTitle className="flex items-center gap-2">
            {t("notif.title")}
            {unread > 0 && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                {unread}
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            {t("notif.desc")}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {notifications.map((notification) => {
              const Icon = typeIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`rounded-md border p-3 ${
                    notification.acknowledged
                      ? "opacity-60"
                      : ""
                  }`}
                  data-testid={`notification-${notification.id}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-md flex-shrink-0 ${
                        notification.severity === "high"
                          ? "bg-destructive/10 text-destructive"
                          : notification.severity === "medium"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-foreground">
                          {typeLabel(notification.type, t)}
                        </span>
                        <Badge
                          variant={severityBadge(notification.severity)}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {notification.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        <span className="font-medium text-foreground">
                          {td(notification.driverName)}
                        </span>
                        {" — "}
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between gap-2 mt-2 flex-wrap">
                        <span className="text-[10px] text-muted-foreground">
                          {notification.timestamp}
                        </span>
                        {!notification.acknowledged && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs gap-1"
                            onClick={() => onAcknowledge?.(notification.id)}
                            data-testid={`btn-ack-${notification.id}`}
                          >
                            <Check className="w-3 h-3" />
                            {t("notif.acknowledge")}
                          </Button>
                        )}
                        {notification.acknowledged && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            {t("notif.acknowledged")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
