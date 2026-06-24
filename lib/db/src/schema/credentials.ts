import { pgTable, serial, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const credentialStatusEnum = pgEnum("credential_status", [
  "New",
  "VPending",
  "USED",
]);

export const credentialsTable = pgTable("credentials", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  credit: integer("credit"),
  status: credentialStatusEnum("status").notNull().default("New"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCredentialSchema = createInsertSchema(credentialsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCredential = z.infer<typeof insertCredentialSchema>;
export type Credential = typeof credentialsTable.$inferSelect;
