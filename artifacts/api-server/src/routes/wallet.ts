import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { walletsTable, transactionsTable } from "@workspace/db/schema";
import { eq, and, desc } from "drizzle-orm";
import {
  CreateWalletBody,
  ImportWalletBody,
  GetWalletBalanceQueryParams,
  GetTransactionHistoryQueryParams,
  SendTransactionBody,
  EstimateGasBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function getSessionId(req: any): string {
  return req.headers["x-session-id"] || req.headers["authorization"]?.replace("Bearer ", "") || "default-session";
}

const MOCK_BALANCES: Record<string, { balance: string; balanceUsd: number; price: number; change24h: number }> = {
  ETH: { balance: "2.4832", balanceUsd: 8421.76, price: 3390.21, change24h: 3.42 },
  BTC: { balance: "0.08124", balanceUsd: 5018.64, price: 61780.50, change24h: -1.23 },
  BNB: { balance: "12.55", balanceUsd: 3762.17, price: 299.77, change24h: 1.87 },
  MATIC: { balance: "1842.0", balanceUsd: 1473.86, price: 0.8001, change24h: 5.21 },
  USDT: { balance: "503.25", balanceUsd: 503.25, price: 1.0, change24h: 0.01 },
  USDC: { balance: "250.00", balanceUsd: 250.0, price: 1.0, change24h: -0.02 },
};

router.post("/create", async (req, res) => {
  try {
    const body = CreateWalletBody.parse(req.body);
    const sessionId = getSessionId(req);

    const address = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
    const mnemonic = generateMnemonic();

    await db.insert(walletsTable).values({
      sessionId,
      name: body.name,
      address,
      network: body.network || "ethereum",
    });

    res.json({
      id: generateId(),
      name: body.name,
      address,
      network: body.network || "ethereum",
      mnemonic,
      createdAt: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/import", async (req, res) => {
  try {
    const body = ImportWalletBody.parse(req.body);
    const sessionId = getSessionId(req);

    const address = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

    await db.insert(walletsTable).values({
      sessionId,
      name: body.name,
      address,
      network: body.network || "ethereum",
    });

    res.json({
      id: generateId(),
      name: body.name,
      address,
      network: body.network || "ethereum",
      createdAt: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/balance", async (req, res) => {
  try {
    const query = GetWalletBalanceQueryParams.parse(req.query);
    const address = query.address;

    const assets = Object.entries(MOCK_BALANCES).map(([symbol, data]) => ({
      symbol,
      name: getTokenName(symbol),
      balance: data.balance,
      balanceUsd: data.balanceUsd,
      price: data.price,
      change24h: data.change24h,
      network: query.network || "ethereum",
      icon: `/icons/${symbol.toLowerCase()}.svg`,
    }));

    const totalUsd = assets.reduce((sum, a) => sum + a.balanceUsd, 0);

    res.json({
      address,
      totalUsd,
      assets,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/transactions", async (req, res) => {
  try {
    const query = GetTransactionHistoryQueryParams.parse(req.query);
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const mockTxs = generateMockTransactions(query.address, 25);
    const start = (page - 1) * limit;
    const paginated = mockTxs.slice(start, start + limit);

    res.json({
      address: query.address,
      transactions: paginated,
      total: mockTxs.length,
      page,
      totalPages: Math.ceil(mockTxs.length / limit),
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/send", async (req, res) => {
  try {
    const body = SendTransactionBody.parse(req.body);
    const sessionId = getSessionId(req);

    const hash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

    await db.insert(transactionsTable).values({
      sessionId,
      hash,
      fromAddress: body.from,
      toAddress: body.to,
      value: body.amount,
      symbol: body.symbol,
      type: "send",
      status: "pending",
      network: body.network,
    });

    res.json({
      hash,
      status: "pending",
      message: "Transaction broadcast successfully",
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/estimate-gas", async (req, res) => {
  try {
    const body = EstimateGasBody.parse(req.body);

    const gasPrice = Math.floor(20 + Math.random() * 30);
    const gasLimit = "21000";
    const maxFeePerGas = `${gasPrice + 5}`;
    const maxPriorityFeePerGas = "2";
    const ethPrice = 3390.21;
    const feeEth = (parseInt(gasLimit) * gasPrice * 1e-9);
    const feeUsd = feeEth * ethPrice;

    res.json({
      gasLimit,
      gasPrice: `${gasPrice}`,
      maxFeePerGas,
      maxPriorityFeePerGas,
      estimatedFee: feeEth.toFixed(8),
      estimatedFeeUsd: parseFloat(feeUsd.toFixed(2)),
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

function getTokenName(symbol: string): string {
  const names: Record<string, string> = {
    ETH: "Ethereum",
    BTC: "Bitcoin",
    BNB: "BNB Chain",
    MATIC: "Polygon",
    USDT: "Tether",
    USDC: "USD Coin",
  };
  return names[symbol] || symbol;
}

function generateMnemonic(): string {
  const words = [
    "abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract",
    "absurd", "abuse", "access", "accident", "account", "accuse", "achieve", "acid",
    "acoustic", "acquire", "across", "action", "actor", "actress", "actual", "adapt"
  ];
  return Array.from({ length: 12 }, () => words[Math.floor(Math.random() * words.length)]).join(" ");
}

function generateMockTransactions(address: string, count: number) {
  const symbols = ["ETH", "BTC", "BNB", "MATIC", "USDT"];
  const networks = ["ethereum", "bsc", "polygon"];
  const types = ["send", "receive", "swap", "contract"] as const;
  const statuses = ["confirmed", "confirmed", "confirmed", "pending", "failed"] as const;

  return Array.from({ length: count }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const amount = (Math.random() * 10).toFixed(4);
    const hash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
    const timestamp = new Date(Date.now() - i * 86400000 * Math.random() * 3).toISOString();

    return {
      hash,
      from: type === "receive" ? `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}` : address,
      to: type === "send" ? `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}` : address,
      value: amount,
      valueUsd: parseFloat((parseFloat(amount) * 3390.21).toFixed(2)),
      symbol,
      type,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      timestamp,
      blockNumber: Math.floor(19000000 + Math.random() * 100000),
      gasUsed: "21000",
      network: networks[Math.floor(Math.random() * networks.length)],
    };
  });
}

export default router;
