import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { walletsTable, transactionsTable } from "@workspace/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { ethers } from "ethers";
import axios from "axios";
import {
  CreateWalletBody,
  ImportWalletBody,
  GetWalletBalanceQueryParams,
  GetTransactionHistoryQueryParams,
  SendTransactionBody,
  EstimateGasBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

// RPC Endpoints (Sepolia for testing)
const RPC_URLS: Record<string, string> = {
  ethereum: "https://ethereum-sepolia-rpc.publicnode.com",
  bsc: "https://bsc-testnet-rpc.publicnode.com",
  polygon: "https://polygon-amoy-bor-rpc.publicnode.com",
};

// Coingecko Price API
const getPrice = async (symbol: string) => {
  try {
    const map: Record<string, string> = { ETH: "ethereum", BTC: "bitcoin", MATIC: "matic-network" };
    const id = map[symbol.toUpperCase()] || "ethereum";
    const resp = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`);
    return resp.data[id].usd;
  } catch {
    return 3500; // Fallback
  }
};

function getSessionId(req: any): string {
  return req.headers["x-session-id"] || req.headers["authorization"]?.replace("Bearer ", "") || "default-session";
}

router.post("/create", async (req, res) => {
  try {
    const body = CreateWalletBody.parse(req.body);
    const sessionId = getSessionId(req);

    const wallet = ethers.Wallet.createRandom();
    
    await db.insert(walletsTable).values({
      sessionId,
      name: body.name,
      address: wallet.address,
      network: body.network || "ethereum",
      mnemonic: wallet.mnemonic?.phrase,
      privateKey: wallet.privateKey,
    });

    res.json({
      id: Math.random().toString(36).substring(7),
      name: body.name,
      address: wallet.address,
      network: body.network || "ethereum",
      mnemonic: wallet.mnemonic?.phrase,
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

    let wallet: ethers.HDNodeWallet | ethers.Wallet;
    if (body.mnemonic) {
      wallet = ethers.Wallet.fromPhrase(body.mnemonic);
    } else if (body.privateKey) {
      wallet = new ethers.Wallet(body.privateKey);
    } else {
      throw new Error("Mnemonic or Private Key required");
    }

    await db.insert(walletsTable).values({
      sessionId,
      name: body.name,
      address: wallet.address,
      network: body.network || "ethereum",
      mnemonic: body.mnemonic,
      privateKey: wallet.privateKey,
    });

    res.json({
      id: Math.random().toString(36).substring(7),
      name: body.name,
      address: wallet.address,
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
    const network = query.network || "ethereum";
    const provider = new ethers.JsonRpcProvider(RPC_URLS[network] || RPC_URLS.ethereum);
    
    const balanceWei = await provider.getBalance(query.address);
    const balanceEth = ethers.formatEther(balanceWei);
    
    const price = await getPrice("ETH");
    const balanceUsd = parseFloat(balanceEth) * price;

    const assets = [
      {
        symbol: "ETH",
        name: "Ethereum",
        balance: balanceEth,
        balanceUsd: balanceUsd,
        price: price,
        change24h: 2.5,
        network: network,
        icon: "/icons/eth.svg",
      }
    ];

    res.json({
      address: query.address,
      totalUsd: balanceUsd,
      assets,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/transactions", async (req, res) => {
  try {
    const query = GetTransactionHistoryQueryParams.parse(req.query);
    // Fetch from local DB for speed/customization
    const txs = await db.select()
      .from(transactionsTable)
      .where(eq(transactionsTable.fromAddress, query.address))
      .orderBy(desc(transactionsTable.timestamp))
      .limit(Number(query.limit) || 20);

    res.json({
      address: query.address,
      transactions: txs,
      total: txs.length,
      page: 1,
      totalPages: 1,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/send", async (req, res) => {
  try {
    const body = SendTransactionBody.parse(req.body);
    const sessionId = getSessionId(req);

    // Get wallet from DB
    const savedWallet = await db.select()
      .from(walletsTable)
      .where(and(eq(walletsTable.address, body.from), eq(walletsTable.sessionId, sessionId)))
      .limit(1);

    if (!savedWallet.length || !savedWallet[0].privateKey) {
      throw new Error("Wallet not found or private key missing");
    }

    const provider = new ethers.JsonRpcProvider(RPC_URLS[body.network] || RPC_URLS.ethereum);
    const wallet = new ethers.Wallet(savedWallet[0].privateKey, provider);

    const tx = await wallet.sendTransaction({
      to: body.to,
      value: ethers.parseEther(body.amount),
    });

    await db.insert(transactionsTable).values({
      sessionId,
      hash: tx.hash,
      fromAddress: body.from,
      toAddress: body.to,
      value: body.amount,
      symbol: body.symbol,
      type: "send",
      status: "pending",
      network: body.network,
    });

    res.json({
      hash: tx.hash,
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
    const provider = new ethers.JsonRpcProvider(RPC_URLS[body.network] || RPC_URLS.ethereum);
    
    const feeData = await provider.getFeeData();
    const gasLimit = 21000n; // Standard transfer
    const gasPrice = feeData.gasPrice || 20000000000n;
    
    const feeWei = gasLimit * gasPrice;
    const feeEth = ethers.formatEther(feeWei);

    res.json({
      gasLimit: gasLimit.toString(),
      gasPrice: gasPrice.toString(),
      estimatedFee: feeEth,
      estimatedFeeUsd: parseFloat(feeEth) * 3500,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
