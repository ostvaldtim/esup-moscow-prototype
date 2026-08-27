import { pgTable, serial, text, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  inn: text("inn").notNull(),
  kpp: text("kpp").notNull(),
  accountingType: text("accounting_type", { enum: ["budget", "accounting"] }).notNull(),
  industry: text("industry"),
  centralizedOffice: text("centralized_office").notNull(),
});

export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
});

export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Organization = typeof organizations.$inferSelect;

export const policySections = pgTable("policy_sections", {
  id: serial("id").primaryKey(),
  sectionNumber: text("section_number").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  budgetAccounting: boolean("budget_accounting").notNull().default(false),
  businessAccounting: boolean("business_accounting").notNull().default(false),
  industrySpecific: boolean("industry_specific").notNull().default(false),
  industries: text("industries").array(),
});

export const insertPolicySectionSchema = createInsertSchema(policySections).omit({
  id: true,
});

export type InsertPolicySection = z.infer<typeof insertPolicySectionSchema>;
export type PolicySection = typeof policySections.$inferSelect;

export const generatedPolicies = pgTable("generated_policies", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  selectedSections: integer("selected_sections").array().notNull(),
  generatedDate: text("generated_date").notNull(),
  status: text("status", { enum: ["draft", "approved"] }).notNull(),
});

export const insertGeneratedPolicySchema = createInsertSchema(generatedPolicies).omit({
  id: true,
});

export type InsertGeneratedPolicy = z.infer<typeof insertGeneratedPolicySchema>;
export type GeneratedPolicy = typeof generatedPolicies.$inferSelect;
