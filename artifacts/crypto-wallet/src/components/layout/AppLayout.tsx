import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Send, 
  ArrowDownToLine, 
  History, 
  LineChart, 
  Settings,
  Wallet as WalletIcon
} from 'lucide-react';
import { SceneBackground } from '../3d/SceneBackground';
import { useWalletStore } from '@/store/wallet-store';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/send', label: 'Send', icon: Send },
  { path: '/receive', label: 'Receive', icon: ArrowDownToLine },
  { path: '/history', label: 'History', icon: History },
  { path: '/market', label: 'Market', icon: LineChart },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const activeWallet = useWalletStore(state => state.getActiveWallet());

  return (
    <div className="min-h-screen text-foreground selection:bg-primary selection:text-background flex">
      <SceneBackground />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 glass-panel border-r-white/10 z-10 p-6 h-screen sticky top-0">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <WalletIcon className="text-white w-6 h-6" />
          </div>
          <h1 className="font-display font-bold text-xl tracking-tight text-glow">NEXUS</h1>
        </div>

        {activeWallet && (
          <div className="mb-8 p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Active Wallet</div>
            <div className="font-medium text-sm truncate">{activeWallet.name}</div>
            <div className="text-xs text-white/50 truncate mt-1">{activeWallet.address}</div>
          </div>
        )}

        <nav className="flex-1 flex flex-col gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`
                  flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300
                  ${isActive 
                    ? 'bg-primary/10 text-primary border border-primary/20 box-glow' 
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="active-nav" 
                    className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative z-0 h-screen overflow-y-auto pb-24 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t-white/10 z-50 px-2 py-3 pb-safe flex justify-around">
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`
                flex flex-col items-center gap-1 p-2 rounded-lg
                ${isActive ? 'text-primary' : 'text-muted-foreground'}
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
