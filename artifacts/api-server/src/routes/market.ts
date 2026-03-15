import { Router, type IRouter } from "express";
import { GetMarketPricesQueryParams, GetPriceChartQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

const MARKET_DATA = [
  { symbol: "BTC", name: "Bitcoin", price: 61780.50, change24h: -1.23, change7d: 4.56, marketCap: 1214000000000, volume24h: 31200000000, icon: "₿" },
  { symbol: "ETH", name: "Ethereum", price: 3390.21, change24h: 3.42, change7d: 8.21, marketCap: 407000000000, volume24h: 18900000000, icon: "Ξ" },
  { symbol: "BNB", name: "BNB Chain", price: 299.77, change24h: 1.87, change7d: -2.34, marketCap: 46200000000, volume24h: 1890000000, icon: "⬡" },
  { symbol: "MATIC", name: "Polygon", price: 0.8001, change24h: 5.21, change7d: 12.45, marketCap: 7870000000, volume24h: 598000000, icon: "⬡" },
  { symbol: "LINK", name: "Chainlink", price: 14.02, change24h: -0.88, change7d: 6.78, marketCap: 8290000000, volume24h: 490000000, icon: "⬡" },
  { symbol: "UNI", name: "Uniswap", price: 7.03, change24h: 2.15, change7d: -1.23, marketCap: 5320000000, volume24h: 212000000, icon: "⬡" },
  { symbol: "USDT", name: "Tether", price: 1.0, change24h: 0.01, change7d: 0.02, marketCap: 110000000000, volume24h: 67000000000, icon: "$" },
  { symbol: "USDC", name: "USD Coin", price: 1.0, change24h: -0.02, change7d: 0.01, marketCap: 31200000000, volume24h: 9870000000, icon: "$" },
];

router.get("/prices", async (req, res) => {
  try {
    const query = GetMarketPricesQueryParams.parse(req.query);
    let prices = MARKET_DATA;

    if (query.symbols) {
      const symbolList = query.symbols.split(",").map(s => s.trim().toUpperCase());
      prices = MARKET_DATA.filter(p => symbolList.includes(p.symbol));
    }

    const jitter = (val: number, pct: number = 0.002) => val * (1 + (Math.random() - 0.5) * pct);
    const liveprices = prices.map(p => ({ ...p, price: jitter(p.price) }));

    res.json({
      prices: liveprices,
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/gas-tracker", async (_req, res) => {
  const baseFee = 18 + Math.random() * 10;
  res.json({
    slow: Math.round(baseFee * 1.0),
    standard: Math.round(baseFee * 1.2),
    fast: Math.round(baseFee * 1.5),
    instant: Math.round(baseFee * 2.0),
    baseFee: parseFloat(baseFee.toFixed(2)),
    network: "ethereum",
    updatedAt: new Date().toISOString(),
  });
});

router.get("/chart", async (req, res) => {
  try {
    const query = GetPriceChartQueryParams.parse(req.query);
    const symbol = query.symbol.toUpperCase();
    const days = Number(query.days) || 7;
    const basePrice = MARKET_DATA.find(p => p.symbol === symbol)?.price || 1000;

    const now = Date.now();
    const pointsCount = days * 24;
    const data = [];
    let price = basePrice * (0.85 + Math.random() * 0.1);

    for (let i = pointsCount; i >= 0; i--) {
      price = price * (1 + (Math.random() - 0.48) * 0.02);
      data.push({
        timestamp: Math.floor((now - i * 3600000) / 1000),
        price: parseFloat(price.toFixed(2)),
      });
    }

    data[data.length - 1].price = basePrice;

    res.json({ symbol, days, data });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
