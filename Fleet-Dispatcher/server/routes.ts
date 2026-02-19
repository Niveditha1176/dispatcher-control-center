import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { urgentOrderInputSchema } from "@shared/schema";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/kpis", async (_req, res) => {
    const kpis = await storage.getKpis();
    res.json(kpis);
  });

  app.get("/api/drivers", async (_req, res) => {
    const drivers = await storage.getDrivers();
    res.json(drivers);
  });

  app.get("/api/fleet", async (_req, res) => {
    const fleet = await storage.getFleet();
    res.json(fleet);
  });

  app.get("/api/notifications", async (_req, res) => {
    const notifications = await storage.getNotifications();
    res.json(notifications);
  });

  app.get("/api/markers", async (_req, res) => {
    const markers = await storage.getMarkers();
    res.json(markers);
  });

  app.post("/api/notifications/:id/acknowledge", async (req, res) => {
    const { id } = req.params;
    const updated = await storage.acknowledgeNotification(id);
    if (!updated) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.json(updated);
  });

  app.post("/api/drivers/:id/reassign", async (req, res) => {
    const { id } = req.params;
    const result = await storage.reassignDriver(id);
    if (!result) {
      return res.status(404).json({ error: "Driver not found" });
    }
    res.json(result);
  });

  const transferSchema = z.object({
    fromDriverId: z.string(),
    toDriverId: z.string(),
    pointId: z.string(),
    insertIndex: z.number().int().min(0),
  });

  app.post("/api/delivery-points/transfer", async (req, res) => {
    const parsed = transferSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    }
    const { fromDriverId, toDriverId, pointId, insertIndex } = parsed.data;
    const result = await storage.transferDeliveryPoint(fromDriverId, toDriverId, pointId, insertIndex);
    if (!result) {
      return res.status(404).json({ error: "Driver or delivery point not found" });
    }
    res.json(result);
  });

  app.post("/api/urgent-order/find-drivers", async (req, res) => {
    const parsed = urgentOrderInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    }
    const candidates = await storage.findUrgentDriverCandidates(parsed.data);
    res.json(candidates);
  });

  const assignSchema = z.object({
    driverId: z.string(),
    order: urgentOrderInputSchema,
  });

  app.post("/api/urgent-order/assign", async (req, res) => {
    const parsed = assignSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    }
    const driver = await storage.assignUrgentOrder(parsed.data.driverId, parsed.data.order);
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }
    res.json(driver);
  });

  app.get("/api/approvals/leave", async (_req, res) => {
    const requests = await storage.getLeaveRequests();
    res.json(requests);
  });

  app.post("/api/approvals/leave/:id", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (status !== "approved" && status !== "rejected") {
      return res.status(400).json({ error: "Status must be approved or rejected" });
    }
    const result = await storage.updateLeaveStatus(id, status);
    if (!result) return res.status(404).json({ error: "Leave request not found" });
    res.json(result);
  });

  app.get("/api/approvals/overtime", async (_req, res) => {
    const requests = await storage.getOvertimeRequests();
    res.json(requests);
  });

  app.post("/api/approvals/overtime/:id", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (status !== "approved" && status !== "rejected") {
      return res.status(400).json({ error: "Status must be approved or rejected" });
    }
    const result = await storage.updateOvertimeStatus(id, status);
    if (!result) return res.status(404).json({ error: "Overtime request not found" });
    res.json(result);
  });

  app.get("/api/approvals/fuel", async (_req, res) => {
    const bills = await storage.getFuelBills();
    res.json(bills);
  });

  app.post("/api/approvals/fuel/:id", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (status !== "approved" && status !== "rejected") {
      return res.status(400).json({ error: "Status must be approved or rejected" });
    }
    const result = await storage.updateFuelBillStatus(id, status);
    if (!result) return res.status(404).json({ error: "Fuel bill not found" });
    res.json(result);
  });

  app.get("/api/approvals/pod", async (_req, res) => {
    const pods = await storage.getPodApprovals();
    res.json(pods);
  });

  app.post("/api/approvals/pod/:id", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (status !== "approved" && status !== "rejected") {
      return res.status(400).json({ error: "Status must be approved or rejected" });
    }
    const result = await storage.updatePodStatus(id, status);
    if (!result) return res.status(404).json({ error: "POD not found" });
    res.json(result);
  });

  return httpServer;
}
