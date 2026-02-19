import { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  GripVertical,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  CircleDot,
  ChevronDown,
  ChevronRight,
  Bike,
  Truck,
  ArrowRightLeft,
} from "lucide-react";
import type { Driver } from "@shared/schema";
import { useLanguage } from "@/lib/i18n";

type DeliveryPoint = Driver["deliveryPoints"][number];

interface RouteOverrideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDriverId: string | null;
}

function statusIcon(status: DeliveryPoint["status"]) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />;
    case "delayed":
      return <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />;
    case "pending":
      return <CircleDot className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />;
  }
}

function statusLabel(status: DeliveryPoint["status"], t: (key: string) => string) {
  switch (status) {
    case "completed":
      return { text: t("status.done"), variant: "default" as const };
    case "delayed":
      return { text: t("status.delayed"), variant: "destructive" as const };
    case "pending":
      return { text: t("status.pending"), variant: "secondary" as const };
  }
}

export function RouteOverrideModal({ open, onOpenChange, selectedDriverId }: RouteOverrideModalProps) {
  const { toast } = useToast();
  const { t, td } = useLanguage();

  const driversQuery = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  const drivers = driversQuery.data ?? [];
  const activeDrivers = drivers.filter((d) => d.status !== "offline");

  const [expandedDrivers, setExpandedDrivers] = useState<Set<string>>(new Set());
  const [driverPointsMap, setDriverPointsMap] = useState<Record<string, DeliveryPoint[]>>({});
  const initializedRef = useRef(false);

  useEffect(() => {
    if (open && activeDrivers.length > 0) {
      const pointsMap: Record<string, DeliveryPoint[]> = {};
      activeDrivers.forEach((d) => {
        pointsMap[d.id] = [...d.deliveryPoints];
      });
      setDriverPointsMap(pointsMap);
      setExpandedDrivers(selectedDriverId ? new Set([selectedDriverId]) : new Set());
      initializedRef.current = true;
    }
    if (!open) {
      initializedRef.current = false;
      setDriverPointsMap({});
      setExpandedDrivers(new Set());
    }
  }, [open, activeDrivers.length, selectedDriverId]);

  const transferMutation = useMutation({
    mutationFn: async (payload: { fromDriverId: string; toDriverId: string; pointId: string; insertIndex: number }) => {
      const res = await apiRequest("POST", "/api/delivery-points/transfer", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
    },
  });

  const getPoints = (driverId: string): DeliveryPoint[] => {
    if (driverPointsMap[driverId]) {
      return driverPointsMap[driverId];
    }
    const driver = activeDrivers.find((d) => d.id === driverId);
    return driver?.deliveryPoints ?? [];
  };

  const toggleExpand = (driverId: string) => {
    setExpandedDrivers((prev) => {
      const next = new Set(prev);
      if (next.has(driverId)) {
        next.delete(driverId);
      } else {
        next.add(driverId);
      }
      return next;
    });
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const sourceDriverId = result.source.droppableId;
    const destDriverId = result.destination.droppableId;
    const pointId = result.draggableId;
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    if (sourceDriverId === destDriverId && sourceIndex === destIndex) return;

    const sourcePoints = [...getPoints(sourceDriverId)];
    const pointIdx = sourcePoints.findIndex((p) => p.id === pointId);
    if (pointIdx === -1) return;

    const [moved] = sourcePoints.splice(pointIdx, 1);

    if (sourceDriverId === destDriverId) {
      sourcePoints.splice(destIndex, 0, moved);
      setDriverPointsMap((prev) => ({
        ...prev,
        [sourceDriverId]: sourcePoints,
      }));
    } else {
      const destPoints = [...getPoints(destDriverId)];
      destPoints.splice(destIndex, 0, moved);

      setDriverPointsMap((prev) => ({
        ...prev,
        [sourceDriverId]: sourcePoints,
        [destDriverId]: destPoints,
      }));

      setExpandedDrivers((prev) => {
        const next = new Set(prev);
        next.add(destDriverId);
        return next;
      });

      try {
        await transferMutation.mutateAsync({
          fromDriverId: sourceDriverId,
          toDriverId: destDriverId,
          pointId,
          insertIndex: destIndex,
        });
        const sourceDriver = activeDrivers.find((d) => d.id === sourceDriverId);
        const destDriver = activeDrivers.find((d) => d.id === destDriverId);
        toast({
          title: t("override.reassigned"),
          description: `${t("override.movedStop")} ${td(sourceDriver?.name ?? "Driver")} ${t("override.to")} ${td(destDriver?.name ?? "Driver")}.`,
        });
      } catch {
        const rollbackMap: Record<string, DeliveryPoint[]> = {};
        activeDrivers.forEach((d) => {
          rollbackMap[d.id] = [...d.deliveryPoints];
        });
        setDriverPointsMap(rollbackMap);
        toast({
          title: t("override.failed"),
          description: t("override.failedDesc"),
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b">
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4" />
            {t("override.title")}
          </DialogTitle>
          <DialogDescription className="text-xs mt-1">
            {t("override.desc")}
          </DialogDescription>
        </DialogHeader>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex-1 overflow-y-auto px-5 py-3" style={{ maxHeight: "60vh" }}>
            <div className="space-y-2 pb-4">
              {activeDrivers.map((driver) => {
                const isExpanded = expandedDrivers.has(driver.id);
                const points = getPoints(driver.id);
                const pendingCount = points.filter((p) => p.status !== "completed").length;
                const completedCount = points.filter((p) => p.status === "completed").length;
                const isSelected = driver.id === selectedDriverId;
                const VehicleIcon = driver.vehicleType === "bike" ? Bike : Truck;

                return (
                  <div
                    key={driver.id}
                    className={`border rounded-md ${isSelected ? "border-primary/50 bg-primary/5" : ""}`}
                    data-testid={`override-driver-${driver.id}`}
                  >
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover-elevate rounded-md"
                      onClick={() => toggleExpand(driver.id)}
                      data-testid={`toggle-driver-${driver.id}`}
                    >
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <Avatar className="w-7 h-7 flex-shrink-0">
                        <AvatarFallback className="text-[10px] font-medium bg-muted text-muted-foreground">
                          {driver.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-foreground truncate">{td(driver.name)}</span>
                          <VehicleIcon className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{td(driver.currentRoute)}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                        {completedCount > 0 && (
                          <Badge variant="default" className="text-[10px] px-1.5 py-0">
                            {completedCount} {t("status.done")}
                          </Badge>
                        )}
                        {pendingCount > 0 && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {pendingCount} {t("override.left")}
                          </Badge>
                        )}
                        {points.length === 0 && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {t("override.noStops")}
                          </Badge>
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <Droppable droppableId={driver.id}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`px-3 pb-3 pt-1 min-h-[56px] rounded-b-md transition-colors ${
                              snapshot.isDraggingOver ? "bg-primary/10 border-t border-dashed border-primary/30" : ""
                            }`}
                            data-testid={`droppable-${driver.id}`}
                          >
                            {points.length === 0 && (
                              <div className="text-xs text-muted-foreground text-center py-5 border border-dashed rounded-md bg-muted/20">
                                {t("override.dropHere")}
                              </div>
                            )}
                            {points.map((point, index) => {
                              const isDraggable = point.status !== "completed";
                              return (
                                <Draggable
                                  key={point.id}
                                  draggableId={point.id}
                                  index={index}
                                  isDragDisabled={!isDraggable}
                                >
                                  {(dragProvided, dragSnapshot) => (
                                    <div
                                      ref={dragProvided.innerRef}
                                      {...dragProvided.draggableProps}
                                      {...dragProvided.dragHandleProps}
                                      className={`flex items-center gap-2 px-2.5 py-2 rounded-md mb-1 border ${
                                        dragSnapshot.isDragging
                                          ? "bg-card shadow-lg border-primary/40 z-50"
                                          : isDraggable
                                          ? "bg-card/50 cursor-grab"
                                          : "bg-muted/30 opacity-60 cursor-not-allowed"
                                      }`}
                                      style={{
                                        ...dragProvided.draggableProps.style,
                                        ...(dragSnapshot.isDragging ? { zIndex: 9999 } : {}),
                                      }}
                                      data-testid={`delivery-point-${point.id}`}
                                    >
                                      <GripVertical className={`w-3.5 h-3.5 flex-shrink-0 ${isDraggable ? "text-muted-foreground" : "text-muted-foreground/30"}`} />
                                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                                        <span className="text-[10px] font-medium text-muted-foreground">{index + 1}</span>
                                      </div>
                                      {statusIcon(point.status)}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                          <span className="text-xs text-foreground truncate">{td(point.address)}</span>
                                        </div>
                                        <div className="flex items-center gap-1 mt-0.5">
                                          <Clock className="w-2.5 h-2.5 text-muted-foreground flex-shrink-0" />
                                          <span className="text-[10px] text-muted-foreground">{point.estimatedTime}</span>
                                        </div>
                                      </div>
                                      <Badge
                                        variant={statusLabel(point.status, t).variant}
                                        className="text-[10px] px-1.5 py-0 flex-shrink-0"
                                      >
                                        {statusLabel(point.status, t).text}
                                      </Badge>
                                    </div>
                                  )}
                                </Draggable>
                              );
                            })}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </DragDropContext>

        <div className="px-5 py-3 border-t flex items-center justify-between gap-2 flex-wrap">
          <p className="text-[10px] text-muted-foreground">
            {t("override.footer")}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            data-testid="btn-close-override"
          >
            {t("override.close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
