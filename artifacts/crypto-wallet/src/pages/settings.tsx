import { GlassCard } from '@/components/ui/glass-card';
import { Settings as SettingsIcon, Shield, Globe, Bell, LogOut, Wallet } from 'lucide-react';
import { useWalletStore } from '@/store/wallet-store';
import { useLocation } from 'wouter';

export default function Settings() {
  const [_, setLocation] = useLocation();
  const { wallets, activeWalletId, setActiveWallet, removeWallet } = useWalletStore();

  const handleLogout = () => {
    if (confirm("Are you sure you want to remove this wallet? Make sure you have your seed phrase saved!")) {
      if (activeWalletId) {
         removeWallet(activeWalletId);
         setLocation('/wallet-setup');
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <header className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/20">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-glow">System Configuration</h1>
          <p className="text-muted-foreground">Manage your Nexus parameters.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/10 text-white rounded-xl font-medium border border-white/20">
            <Wallet className="w-5 h-5 text-primary" /> Wallets
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-muted-foreground hover:text-white rounded-xl font-medium transition-colors">
            <Globe className="w-5 h-5" /> Networks
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-muted-foreground hover:text-white rounded-xl font-medium transition-colors">
            <Shield className="w-5 h-5" /> Security
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-muted-foreground hover:text-white rounded-xl font-medium transition-colors">
            <Bell className="w-5 h-5" /> Notifications
          </button>
        </div>

        <div className="md:col-span-2 space-y-6">
          <GlassCard>
            <h2 className="text-xl font-bold mb-6">Managed Wallets</h2>
            <div className="space-y-4">
              {wallets.map(wallet => (
                <div key={wallet.id} className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${wallet.id === activeWalletId ? 'bg-primary/10 border-primary/30' : 'bg-white/5 border-white/10'}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{wallet.name}</span>
                      {wallet.id === activeWalletId && <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded font-bold uppercase">Active</span>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 font-mono">{wallet.address}</div>
                  </div>
                  {wallet.id !== activeWalletId && (
                     <button 
                       onClick={() => setActiveWallet(wallet.id)}
                       className="text-sm px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                     >
                       Switch
                     </button>
                  )}
                </div>
              ))}

              <button 
                onClick={() => setLocation('/wallet-setup')}
                className="w-full py-4 border-2 border-dashed border-white/10 hover:border-white/30 text-muted-foreground hover:text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
              >
                + Add New Wallet
              </button>
            </div>
          </GlassCard>

          <GlassCard className="border-destructive/20">
            <h2 className="text-xl font-bold text-destructive mb-2">Danger Zone</h2>
            <p className="text-sm text-muted-foreground mb-6">Remove your current active wallet from this device. This action cannot be undone unless you have your seed phrase.</p>
            
            <button 
              onClick={handleLogout}
              className="px-6 py-3 bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive hover:text-white rounded-xl font-bold transition-all flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" /> Disconnect Active Wallet
            </button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
