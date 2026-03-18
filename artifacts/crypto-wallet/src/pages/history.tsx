import { useWalletStore } from '@/store/wallet-store';
import { useGetTransactionHistory, getGetTransactionHistoryQueryKey } from '@workspace/api-client-react';
import { GlassCard } from '@/components/ui/glass-card';
import { History as HistoryIcon, ArrowUpRight, ArrowDownRight, RefreshCcw, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

export default function History() {
  const activeWallet = useWalletStore(state => state.getActiveWallet());
  
  const { data, isLoading } = useGetTransactionHistory(
    { address: activeWallet?.address || '0x0', page: 1, limit: 20 },
    { 
      query: { 
        enabled: !!activeWallet,
        queryKey: getGetTransactionHistoryQueryKey({ address: activeWallet?.address || '0x0', page: 1, limit: 20 })
      } 
    }
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'send': return <ArrowUpRight className="w-5 h-5 text-destructive" />;
      case 'receive': return <ArrowDownRight className="w-5 h-5 text-success" />;
      case 'swap': return <RefreshCcw className="w-5 h-5 text-primary" />;
      default: return <HistoryIcon className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-success/20 text-success border-success/30';
      case 'pending': return 'bg-warning/20 text-warning border-warning/30';
      case 'failed': return 'bg-destructive/20 text-destructive border-destructive/30';
      default: return 'bg-white/10 text-white border-white/20';
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/20">
          <HistoryIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-glow">Transaction Ledger</h1>
          <p className="text-muted-foreground">Immutable history of your interactions.</p>
        </div>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 w-full bg-white/5 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {data?.transactions?.map((tx) => (
              <div key={tx.hash} className="p-4 sm:p-6 hover:bg-white/5 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    {getIcon(tx.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold capitalize">{tx.type}</h4>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm border ${getStatusColor(tx.status)}`}>
                        {tx.status}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      {format(new Date(tx.timestamp), 'MMM d, yyyy HH:mm')}
                    </div>
                  </div>
                </div>
                
                <div className="text-right flex items-center gap-4">
                  <div>
                    <div className={`font-bold ${tx.type === 'receive' ? 'text-success' : 'text-white'}`}>
                      {tx.type === 'send' ? '-' : '+'}{tx.value} {tx.symbol}
                    </div>
                    {tx.valueUsd && (
                      <div className="text-sm text-muted-foreground">
                        ${tx.valueUsd.toFixed(2)}
                      </div>
                    )}
                  </div>
                  <a href={`#${tx.hash}`} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-muted-foreground hover:text-primary">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}

            {(!data?.transactions || data.transactions.length === 0) && (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                <HistoryIcon className="w-12 h-12 mb-4 opacity-20" />
                <p>No transactions found on this network.</p>
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
