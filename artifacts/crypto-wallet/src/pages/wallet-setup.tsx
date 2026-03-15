import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { ShieldAlert, Key, Copy, CheckCircle2, ArrowRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { useWalletStore } from '@/store/wallet-store';
import { useCreateWallet, useImportWallet } from '@workspace/api-client-react';

export default function WalletSetup() {
  const [, setLocation] = useLocation();
  const addWallet = useWalletStore(state => state.addWallet);
  const [mode, setMode] = useState<'select' | 'create' | 'import'>('select');
  
  // Create Wallet State
  const [mnemonic, setMnemonic] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [saved, setSaved] = useState(false);
  
  // Import Wallet State
  const [importInput, setImportInput] = useState('');
  
  const createMutation = useCreateWallet();
  const importMutation = useImportWallet();

  const handleGenerate = () => {
    const wallet = ethers.Wallet.createRandom();
    setMnemonic(wallet.mnemonic?.phrase || '');
    setAddress(wallet.address);
    setMode('create');
  };

  const confirmCreate = async () => {
    if (!saved) return;
    try {
      const result = await createMutation.mutateAsync({
        data: { name: 'Nexus Wallet 1', network: 'ethereum' }
      });
      
      // Store in local state manager with generated keys
      addWallet({
        id: result.id,
        name: result.name,
        address: address, // use actual generated
        network: result.network,
        mnemonic: mnemonic
      });
      
      setLocation('/');
    } catch (e) {
      console.error(e);
    }
  };

  const handleImport = async () => {
    try {
      let wallet;
      if (importInput.includes(' ')) {
        wallet = ethers.Wallet.fromPhrase(importInput);
      } else {
        wallet = new ethers.Wallet(importInput);
      }

      const result = await importMutation.mutateAsync({
        data: { name: 'Imported Wallet', mnemonic: importInput, network: 'ethereum' }
      });

      addWallet({
        id: result.id,
        name: result.name,
        address: wallet.address,
        network: result.network,
      });

      setLocation('/');
    } catch (e) {
      alert("Invalid seed phrase or private key");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-glow mb-2">Nexus Node</h1>
          <p className="text-muted-foreground">Initialize your connection to the grid.</p>
        </div>

        {mode === 'select' && (
          <div className="space-y-4">
            <GlassCard 
              interactive 
              glowColor="primary"
              onClick={handleGenerate}
              className="flex items-center p-6 gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Create New Wallet</h3>
                <p className="text-sm text-muted-foreground">Generate a fresh cryptographic identity.</p>
              </div>
            </GlassCard>

            <GlassCard 
              interactive 
              glowColor="accent"
              onClick={() => setMode('import')}
              className="flex items-center p-6 gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Import Existing</h3>
                <p className="text-sm text-muted-foreground">Connect via seed phrase or private key.</p>
              </div>
            </GlassCard>
          </div>
        )}

        {mode === 'create' && (
          <GlassCard glowColor="primary">
            <h2 className="text-2xl font-display font-bold mb-4 text-primary">Secret Recovery Phrase</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Write down these 12 words in order. Do not share them with anyone. If you lose them, your assets are gone forever.
            </p>
            
            <div className="grid grid-cols-3 gap-3 mb-6">
              {mnemonic.split(' ').map((word, i) => (
                <div key={i} className="bg-background/50 border border-white/10 rounded-lg p-2 text-center relative overflow-hidden group">
                  <span className="absolute top-1 left-2 text-[10px] text-white/30">{i + 1}</span>
                  <span className="font-mono text-sm font-medium pt-2 block">{word}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 mb-6 bg-warning/10 text-warning p-4 rounded-xl border border-warning/20">
              <ShieldAlert className="w-6 h-6 flex-shrink-0" />
              <p className="text-xs font-medium">Never disclose this phrase. Anyone with this phrase can steal your assets.</p>
            </div>

            <button 
              onClick={() => setSaved(!saved)}
              className={`w-full py-3 px-4 rounded-xl font-medium mb-4 flex items-center justify-center gap-2 transition-colors ${saved ? 'bg-success/20 text-success border border-success/30' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}
            >
              {saved ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {saved ? "Saved Securely" : "I have written this down"}
            </button>

            <button
              disabled={!saved || createMutation.isPending}
              onClick={confirmCreate}
              className="w-full py-4 rounded-xl font-bold bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {createMutation.isPending ? "Initializing..." : "Initialize Wallet"}
              {!createMutation.isPending && <ArrowRight className="w-5 h-5" />}
            </button>
            
            <button onClick={() => setMode('select')} className="w-full mt-4 text-sm text-muted-foreground hover:text-white transition-colors">
              Cancel
            </button>
          </GlassCard>
        )}

        {mode === 'import' && (
          <GlassCard glowColor="accent">
            <h2 className="text-2xl font-display font-bold mb-4 text-accent">Import Wallet</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Enter your 12 or 24-word secret recovery phrase, or your raw private key.
            </p>
            
            <textarea
              value={importInput}
              onChange={(e) => setImportInput(e.target.value)}
              placeholder="e.g. apple banana cherry..."
              className="w-full h-32 bg-background/50 border border-white/10 rounded-xl p-4 font-mono text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 mb-6 resize-none"
            />

            <button
              disabled={!importInput || importMutation.isPending}
              onClick={handleImport}
              className="w-full py-4 rounded-xl font-bold bg-accent text-accent-foreground hover:shadow-lg hover:shadow-accent/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {importMutation.isPending ? "Connecting..." : "Connect Wallet"}
            </button>
            
            <button onClick={() => setMode('select')} className="w-full mt-4 text-sm text-muted-foreground hover:text-white transition-colors">
              Cancel
            </button>
          </GlassCard>
        )}
      </motion.div>
    </div>
  );
}
