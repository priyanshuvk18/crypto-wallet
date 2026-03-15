import { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { useWalletStore } from '@/store/wallet-store';
import { useEstimateGas, useSendTransaction } from '@workspace/api-client-react';
import { ArrowUpRight, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Send() {
  const activeWallet = useWalletStore(state => state.getActiveWallet());
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  
  const estimateGas = useEstimateGas();
  const sendTx = useSendTransaction();
  
  const [txHash, setTxHash] = useState('');

  const handleReview = async () => {
    if (!recipient || !amount) return;
    
    // Trigger gas estimation
    try {
      await estimateGas.mutateAsync({
        data: {
          from: activeWallet?.address || '',
          to: recipient,
          value: amount,
          network: 'ethereum'
        }
      });
      setStep(2);
    } catch (e) {
      console.error(e);
      // Proceed anyway for demo
      setStep(2);
    }
  };

  const handleConfirm = async () => {
    try {
      const result = await sendTx.mutateAsync({
        data: {
          from: activeWallet?.address || '',
          to: recipient,
          amount: amount,
          symbol: 'ETH',
          network: 'ethereum',
          signedTx: '0xmock_signed_tx_data_because_we_dont_have_pk'
        }
      });
      setTxHash(result.hash);
      setStep(3);
    } catch (e) {
      alert("Transaction failed to broadcast");
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
          <ArrowUpRight className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-glow">Send Crypto</h1>
          <p className="text-muted-foreground">Transfer assets across the grid</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <GlassCard>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Asset</label>
                  <div className="w-full bg-background border border-white/10 rounded-xl p-4 flex items-center justify-between cursor-not-allowed opacity-80">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">ETH</div>
                      <span className="font-bold">Ethereum</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Balance: 1.45 ETH</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Recipient Address</label>
                  <input 
                    type="text" 
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="0x... or ENS name"
                    className="w-full bg-background border border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Amount</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-background border border-white/10 rounded-xl p-4 pl-8 text-2xl font-bold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">Ξ</span>
                    <button onClick={() => setAmount('1.45')} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">MAX</button>
                  </div>
                </div>

                <button 
                  onClick={handleReview}
                  disabled={!recipient || !amount || estimateGas.isPending}
                  className="w-full py-4 rounded-xl font-bold bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50"
                >
                  {estimateGas.isPending ? "Calculating Route..." : "Review Transfer"}
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <GlassCard glowColor="primary">
              <h2 className="text-xl font-display font-bold mb-6">Review Transaction</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between p-4 bg-white/5 rounded-xl">
                  <span className="text-muted-foreground">Sending</span>
                  <span className="font-bold text-xl">{amount} ETH</span>
                </div>
                
                <div className="flex justify-between p-4 bg-white/5 rounded-xl">
                  <span className="text-muted-foreground">To</span>
                  <span className="font-mono text-sm truncate max-w-[200px]">{recipient}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-primary/10 border border-primary/20 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    <span className="text-primary font-medium">Est. Network Fee</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{estimateGas.data?.estimatedFee || '0.0015'} ETH</div>
                    <div className="text-xs text-muted-foreground">${estimateGas.data?.estimatedFeeUsd || '3.42'}</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 rounded-xl font-bold bg-white/5 text-white hover:bg-white/10 transition-all border border-white/10"
                >
                  Back
                </button>
                <button 
                  onClick={handleConfirm}
                  disabled={sendTx.isPending}
                  className="flex-[2] py-4 rounded-xl font-bold bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {sendTx.isPending && <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />}
                  {sendTx.isPending ? "Broadcasting..." : "Confirm Send"}
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <GlassCard className="text-center py-12" glowColor="primary">
              <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center text-success mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-display font-bold text-glow mb-2">Transaction Sent</h2>
              <p className="text-muted-foreground mb-8">Your transfer is broadcasting to the network.</p>
              
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8">
                <div className="text-xs text-muted-foreground mb-1">Transaction Hash</div>
                <div className="font-mono text-sm break-all text-primary">{txHash || '0x7f2c...mock...hash'}</div>
              </div>
              
              <button 
                onClick={() => { setStep(1); setAmount(''); setRecipient(''); }}
                className="py-3 px-8 rounded-xl font-bold bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10"
              >
                Send Another
              </button>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
