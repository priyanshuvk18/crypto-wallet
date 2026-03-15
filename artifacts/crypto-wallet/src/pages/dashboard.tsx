import { useLocation, Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, RefreshCcw, CreditCard, Activity } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { useWalletStore } from '@/store/wallet-store';
import { useGetWalletBalance } from '@workspace/api-client-react';

export default function Dashboard() {
  const [location, setLocation] = useLocation();
  const activeWallet = useWalletStore(state => state.getActiveWallet());

  // Redirect if no wallet
  if (!activeWallet && location !== '/wallet-setup') {
    setLocation('/wallet-setup');
    return null;
  }

  const { data: balanceData, isLoading } = useGetWalletBalance(
    { address: activeWallet?.address || '0x0' },
    { query: { enabled: !!activeWallet } }
  );

  return (
    <div className="space-y-6 relative z-10">
      <header className="mb-8 pt-4">
        <h2 className="text-sm font-medium text-primary tracking-widest uppercase mb-1">Total Balance</h2>
        {isLoading ? (
          <div className="h-14 w-64 bg-white/10 animate-pulse rounded-lg" />
        ) : (
          <div className="flex items-baseline gap-4">
            <h1 className="text-5xl md:text-7xl font-display font-bold text-glow tracking-tighter">
              ${balanceData?.totalUsd?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </h1>
            <span className="text-success flex items-center font-medium bg-success/10 px-2 py-1 rounded-md text-sm border border-success/20">
              <Activity className="w-4 h-4 mr-1" /> +5.24%
            </span>
          </div>
        )}
      </header>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link href="/send">
          <GlassCard interactive className="flex flex-col items-center justify-center p-4 gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-1">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <span className="font-medium text-sm">Send</span>
          </GlassCard>
        </Link>
        <Link href="/receive">
          <GlassCard interactive className="flex flex-col items-center justify-center p-4 gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent mb-1">
              <ArrowDownRight className="w-6 h-6" />
            </div>
            <span className="font-medium text-sm">Receive</span>
          </GlassCard>
        </Link>
        <GlassCard interactive className="flex flex-col items-center justify-center p-4 gap-3 text-center opacity-70">
          <div className="w-12 h-12 rounded-full bg-secondary/40 flex items-center justify-center text-white mb-1">
            <RefreshCcw className="w-6 h-6" />
          </div>
          <span className="font-medium text-sm">Swap</span>
        </GlassCard>
        <GlassCard interactive className="flex flex-col items-center justify-center p-4 gap-3 text-center opacity-70">
          <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center text-success mb-1">
            <CreditCard className="w-6 h-6" />
          </div>
          <span className="font-medium text-sm">Buy</span>
        </GlassCard>
      </div>

      {/* Assets List */}
      <h3 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        Digital Assets
      </h3>
      
      <GlassCard className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-16 w-full bg-white/5 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {balanceData?.assets?.map((asset, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={asset.symbol} 
                className="flex items-center justify-between p-4 sm:p-6 hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors">
                    {/* Placeholder icon */}
                    <span className="font-display font-bold text-lg">{asset.symbol[0]}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg leading-tight">{asset.name}</h4>
                    <span className="text-sm text-muted-foreground font-mono">{asset.balance} {asset.symbol}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">${asset.balanceUsd?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                  <div className={`text-sm font-medium flex items-center justify-end gap-1 ${asset.change24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {asset.change24h >= 0 ? '↑' : '↓'} {Math.abs(asset.change24h)}%
                  </div>
                </div>
              </motion.div>
            ))}
            
            {(!balanceData?.assets || balanceData.assets.length === 0) && (
              <div className="p-12 text-center text-muted-foreground">
                No assets found on this network.
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
