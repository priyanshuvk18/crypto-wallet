import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const walletsTable = sqliteTable("wallets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("session_id").notNull(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  network: text("network").notNull().default("ethereum"),
  mnemonic: text("mnemonic"),
  privateKey: text("private_key"),
  encryptedData: text("encrypted_data"),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

export const transactionsTable = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("session_id").notNull(),
  hash: text("hash").notNull().unique(),
  fromAddress: text("from_address").notNull(),
  toAddress: text("to_address").notNull(),
  value: text("value").notNull(),
  symbol: text("symbol").notNull().default("ETH"),
  type: text("type").notNull().default("send"),
  status: text("status").notNull().default("pending"),
  network: text("network").notNull().default("ethereum"),
  gasUsed: text("gas_used"),
  blockNumber: text("block_number"),
  timestamp: text("timestamp").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  metadata: text("metadata", { mode: "json" }),
});

export const insertWalletSchema = createInsertSchema(walletsTable).omit({ id: true, createdAt: true });
export const insertTransactionSchema = createInsertSchema(transactionsTable).omit({ id: true, timestamp: true });

export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof walletsTable.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactionsTable.$inferSelect;
