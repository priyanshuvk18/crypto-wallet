import { Router, type IRouter } from "express";
import { GetTokenListQueryParams, GetTokenBalancesQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

const SUPPORTED_TOKENS = [
  { address: "0xdac17f958d2ee523a2206206994597c13d831ec7", symbol: "USDT", name: "Tether USD", decimals: 6, network: "ethereum", logoURI: "/icons/usdt.svg" },
  { address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", symbol: "USDC", name: "USD Coin", decimals: 6, network: "ethereum", logoURI: "/icons/usdc.svg" },
  { address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984", symbol: "UNI", name: "Uniswap", decimals: 18, network: "ethereum", logoURI: "/icons/uni.svg" },
  { address: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0", symbol: "MATIC", name: "Polygon", decimals: 18, network: "ethereum", logoURI: "/icons/matic.svg" },
  { address: "0x514910771af9ca656af840dff83e8264ecf986ca", symbol: "LINK", name: "Chainlink", decimals: 18, network: "ethereum", logoURI: "/icons/link.svg" },
  { address: "0x2b591e99afe9f32eaa6214f7b7629768c40eeb39", symbol: "HEX", name: "HEX", decimals: 8, network: "ethereum", logoURI: "/icons/hex.svg" },
  { address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", symbol: "WBNB", name: "Wrapped BNB", decimals: 18, network: "bsc", logoURI: "/icons/bnb.svg" },
  { address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", symbol: "USDC", name: "USD Coin", decimals: 18, network: "bsc", logoURI: "/icons/usdc.svg" },
];

const TOKEN_MOCK_BALANCES: Record<string, { balance: string; balanceUsd: number; price: number }> = {
  USDT: { balance: "503.25", balanceUsd: 503.25, price: 1.0 },
  USDC: { balance: "250.00", balanceUsd: 250.0, price: 1.0 },
  UNI: { balance: "42.5", balanceUsd: 298.75, price: 7.03 },
  MATIC: { balance: "1842.0", balanceUsd: 1473.86, price: 0.8001 },
  LINK: { balance: "18.34", balanceUsd: 257.12, price: 14.02 },
  WBNB: { balance: "5.2", balanceUsd: 1558.80, price: 299.77 },
};

router.get("/list", async (req, res) => {
  try {
    const query = GetTokenListQueryParams.parse(req.query);
    const filtered = query.network
      ? SUPPORTED_TOKENS.filter(t => t.network === query.network)
      : SUPPORTED_TOKENS;

    res.json({ tokens: filtered, total: filtered.length });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/balance", async (req, res) => {
  try {
    const query = GetTokenBalancesQueryParams.parse(req.query);
    const tokens = query.network
      ? SUPPORTED_TOKENS.filter(t => t.network === query.network)
      : SUPPORTED_TOKENS;

    const balances = tokens.map(token => {
      const mockBal = TOKEN_MOCK_BALANCES[token.symbol] || { balance: "0", balanceUsd: 0, price: 0 };
      return {
        token,
        balance: mockBal.balance,
        balanceUsd: mockBal.balanceUsd,
        price: mockBal.price,
      };
    });

    res.json({ address: query.address, balances });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
