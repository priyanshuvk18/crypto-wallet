import { useGetMarketPrices, useGetGasTracker, useGetPriceChart } from '@workspace/api-client-react';
import { GlassCard } from '@/components/ui/glass-card';
import { LineChart as LineChartIcon, Activity, Flame } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Market() {
  const { data: prices, isLoading: pricesLoading } = useGetMarketPrices({ symbols: 'ETH,BTC,BNB,MATIC' });
  const { data: gas, isLoading: gasLoading } = useGetGasTracker();
  const { data: chartData } = useGetPriceChart({ symbol: 'ETH', days: 7 });

  const formatChartData = chartData?.data.map(d => ({
    time: new Date(d.timestamp).toLocaleDateString(),
    price: d.price
  }));

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      <header className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
          <LineChartIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-glow">Market Intel</h1>
          <p className="text-muted-foreground">Real-time network metrics and asset performance.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gas Tracker Widget */}
        <GlassCard className="col-span-1 border-primary/20">
          <div className="flex items-center gap-2 mb-6 text-primary">
            <Flame className="w-5 h-5" />
            <h2 className="font-bold text-lg">Network Gas</h2>
          </div>
          
          {gasLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-10 bg-white/5 rounded-lg" />
              <div className="h-10 bg-white/5 rounded-lg" />
              <div className="h-10 bg-white/5 rounded-lg" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10 hover:border-primary/50 transition-colors">
                <span className="font-medium text-success">Low</span>
                <span className="font-mono font-bold">{gas?.slow || 12} gwei</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-primary/10 rounded-xl border border-primary/30 relative overflow-hidden">
                <div className="absolute left-0 top-0 w-1 h-full bg-primary" />
                <span className="font-medium text-primary">Average</span>
                <span className="font-mono font-bold text-lg">{gas?.standard || 15} gwei</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10 hover:border-destructive/50 transition-colors">
                <span className="font-medium text-destructive">High</span>
                <span className="font-mono font-bold">{gas?.fast || 18} gwei</span>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-4">Base Fee: {gas?.baseFee || 14.2} gwei</p>
            </div>
          )}
        </GlassCard>

        {/* Main Chart */}
        <GlassCard className="col-span-1 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-lg">ETH/USD (7D)</h2>
            <div className="bg-white/5 rounded-lg p-1 flex gap-1">
              <button className="px-3 py-1 rounded text-xs font-medium text-muted-foreground hover:text-white">1D</button>
              <button className="px-3 py-1 rounded text-xs font-medium bg-white/10 text-white">7D</button>
              <button className="px-3 py-1 rounded text-xs font-medium text-muted-foreground hover:text-white">1M</button>
            </div>
          </div>
          <div className="h-[250px] w-full">
            {chartData ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatChartData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" hide />
                  <YAxis domain={['auto', 'auto']} hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: "hsl(var(--primary))", stroke: "#000", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-white/5 flex items-center gap-2">
           <Activity className="w-5 h-5 text-accent" />
           <h2 className="font-bold text-lg">Top Movers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Asset</th>
                <th className="px-6 py-4 font-medium text-right">Price</th>
                <th className="px-6 py-4 font-medium text-right">24h Change</th>
                <th className="px-6 py-4 font-medium text-right hidden sm:table-cell">Market Cap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pricesLoading ? (
                 <tr><td colSpan={4} className="p-8 text-center">Loading market data...</td></tr>
              ) : (
                prices?.prices?.map((coin) => (
                  <tr key={coin.symbol} className="hover:bg-white/5 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center font-bold">
                          {coin.symbol[0]}
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-primary transition-colors">{coin.name}</div>
                          <div className="text-muted-foreground">{coin.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-medium">
                      ${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${coin.change24h >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                        {coin.change24h >= 0 ? '↑' : '↓'} {Math.abs(coin.change24h).toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right hidden sm:table-cell text-muted-foreground">
                      ${((coin.marketCap || 0) / 1000000000).toFixed(2)}B
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
