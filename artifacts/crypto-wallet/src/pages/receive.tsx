import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { GlassCard } from '@/components/ui/glass-card';
import { useWalletStore } from '@/store/wallet-store';
import { ArrowDownRight, Copy, CheckCircle2, Share2 } from 'lucide-react';

export default function Receive() {
  const activeWallet = useWalletStore(state => state.getActiveWallet());
  const [copied, setCopied] = useState(false);

  const address = activeWallet?.address || '0x0000000000000000000000000000000000000000';

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent">
          <ArrowDownRight className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-glow-accent">Receive</h1>
          <p className="text-muted-foreground">Scan QR to receive assets</p>
        </div>
      </div>

      <GlassCard glowColor="accent" className="flex flex-col items-center p-8 text-center">
        
        <div className="bg-white p-4 rounded-2xl mb-8 border-4 border-accent/30 shadow-[0_0_30px_rgba(255,0,255,0.2)]">
          <QRCodeSVG 
            value={address} 
            size={200}
            bgColor={"#ffffff"}
            fgColor={"#000000"}
            level={"Q"}
          />
        </div>

        <div className="w-full bg-background border border-white/10 rounded-xl p-4 relative overflow-hidden group mb-6">
          <div className="text-xs text-muted-foreground mb-1 text-left">Your Address</div>
          <div className="font-mono text-sm break-all pr-10 text-left">{address}</div>
          
          <button 
            onClick={handleCopy}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-accent hover:text-white rounded-lg transition-colors text-muted-foreground"
          >
            {copied ? <CheckCircle2 className="w-5 h-5 text-success" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex gap-4 w-full">
          <button 
            onClick={handleCopy}
            className="flex-1 py-3 rounded-xl font-bold bg-white/5 text-white hover:bg-white/10 transition-all border border-white/10 flex items-center justify-center gap-2"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <button 
            className="flex-1 py-3 rounded-xl font-bold bg-accent text-accent-foreground hover:shadow-lg hover:shadow-accent/30 transition-all flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>

        <div className="mt-6 text-xs text-muted-foreground bg-warning/10 text-warning/80 p-3 rounded-lg border border-warning/20">
          Only send assets matching the selected network to this address. Sending unsupported assets will result in permanent loss.
        </div>
      </GlassCard>
    </div>
  );
}
