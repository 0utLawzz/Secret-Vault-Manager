import { Router } from "express";
import { db, credentialsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  CreateCredentialBody,
  UpdateCredentialBody,
  UpdateCreditBody,
  UpdateStatusBody,
  ListCredentialsQueryParams,
} from "@workspace/api-zod";
import { z } from "zod";

// Additional integer refinements for credit fields not enforced by generated zod
const creditIsInteger = (v: number | null | undefined) =>
  v == null || Number.isInteger(v);
const creditErrMsg = "Credit must be a whole number";

const router = Router();

// GET /credentials
router.get("/credentials", async (req, res) => {
  try {
    const query = ListCredentialsQueryParams.safeParse(req.query);
    if (!query.success && req.query.status !== undefined) {
      res.status(400).json({ error: "Invalid status filter" });
      return;
    }
    let rows;
    if (query.success && query.data.status) {
      rows = await db
        .select()
        .from(credentialsTable)
        .where(eq(credentialsTable.status, query.data.status as any))
        .orderBy(credentialsTable.createdAt);
    } else {
      rows = await db
        .select()
        .from(credentialsTable)
        .orderBy(credentialsTable.createdAt);
    }
    res.json(rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /credentials
router.post("/credentials", async (req, res) => {
  const parsed = CreateCredentialBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (!creditIsInteger(parsed.data.credit)) {
    res.status(400).json({ error: creditErrMsg });
    return;
  }
  try {
    const [row] = await db
      .insert(credentialsTable)
      .values({
        email: parsed.data.email,
        password: parsed.data.password,
        credit: parsed.data.credit ?? null,
        status: parsed.data.status as any,
        notes: parsed.data.notes ?? null,
      })
      .returning();
    res.status(201).json(row);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /credentials/stats  — must be before /:id
router.get("/credentials/stats", async (req, res) => {
  try {
    const rows = await db
      .select({ status: credentialsTable.status, count: sql<number>`count(*)::int` })
      .from(credentialsTable)
      .groupBy(credentialsTable.status);

    const byStatus = { New: 0, VPending: 0, USED: 0 } as Record<string, number>;
    let total = 0;
    for (const r of rows) {
      byStatus[r.status] = r.count;
      total += r.count;
    }
    res.json({ total, byStatus });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /credentials/:id
router.get("/credentials/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    const [row] = await db.select().from(credentialsTable).where(eq(credentialsTable.id, id));
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /credentials/:id
router.patch("/credentials/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateCredentialBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  if (!creditIsInteger(parsed.data.credit)) { res.status(400).json({ error: creditErrMsg }); return; }
  try {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (parsed.data.email !== undefined) updateData.email = parsed.data.email;
    if (parsed.data.password !== undefined) updateData.password = parsed.data.password;
    if (parsed.data.credit !== undefined) updateData.credit = parsed.data.credit;
    if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
    if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;

    const [row] = await db
      .update(credentialsTable)
      .set(updateData as any)
      .where(eq(credentialsTable.id, id))
      .returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /credentials/:id
router.delete("/credentials/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    const [row] = await db.delete(credentialsTable).where(eq(credentialsTable.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /credentials/:id/credit
router.patch("/credentials/:id/credit", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateCreditBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  if (!creditIsInteger(parsed.data.credit)) { res.status(400).json({ error: creditErrMsg }); return; }
  try {
    const [row] = await db
      .update(credentialsTable)
      .set({ credit: parsed.data.credit, updatedAt: new Date() })
      .where(eq(credentialsTable.id, id))
      .returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /credentials/:id/status
router.patch("/credentials/:id/status", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateStatusBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  try {
    const [row] = await db
      .update(credentialsTable)
      .set({ status: parsed.data.status as any, updatedAt: new Date() })
      .where(eq(credentialsTable.id, id))
      .returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
