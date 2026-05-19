import { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BookOpen, Blocks, CheckCircle, Code, Info, Network, Shield } from 'lucide-react';
import { UrvDemo } from '@/components/blockchain/UrvDemo';
import { UrvPresetPanel } from '@/components/blockchain/UrvPresetPanel';
import { URV_CHAIN_CONFIG } from '@/config/urvChain';

import '@solana/wallet-adapter-react-ui/styles.css';

export default function BlockchainRegistry() {
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);
  const endpoint = useMemo(() => URV_CHAIN_CONFIG.clusterUrl, []);

  return (
    <AppLayout>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <div className="container max-w-6xl py-6 space-y-6">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="text-xs font-medium text-primary uppercase tracking-wider">Universal URV Matrix</span>
                  </div>
                  <h1 className="text-3xl font-bold">UHS Health OS — URV Chain</h1>
                  <p className="text-muted-foreground mt-2 max-w-2xl">
                    Canonical Solana-based proof and value network for Rhema Care Flow and official derivatives.
                    Interfaces may vary; the URV matrix stays universal.
                  </p>
                </div>
              </div>

              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <Blocks className="h-8 w-8 text-primary" />
                  <div>
                    <h2 className="text-2xl font-bold">URV Health Value Chain</h2>
                    <p className="text-muted-foreground">
                      Proof registry, auditability and healthcare value signals without PHI on-chain.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary">{URV_CHAIN_CONFIG.networkMode}</Badge>
                  <Badge variant="outline">Solana</Badge>
                  <Badge variant="outline">Anchor</Badge>
                  <Badge variant={URV_CHAIN_CONFIG.canonicalMatrix ? 'outline' : 'destructive'}>
                    {URV_CHAIN_CONFIG.canonicalMatrix ? 'Canonical Matrix' : 'Non-canonical'}
                  </Badge>
                </div>
              </div>

              <Tabs defaultValue="demo" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="demo"><Blocks className="h-4 w-4 mr-2" />Demo</TabsTrigger>
                  <TabsTrigger value="preset"><Network className="h-4 w-4 mr-2" />Preset</TabsTrigger>
                  <TabsTrigger value="docs"><BookOpen className="h-4 w-4 mr-2" />Docs</TabsTrigger>
                  <TabsTrigger value="architecture"><Code className="h-4 w-4 mr-2" />Architecture</TabsTrigger>
                </TabsList>

                <TabsContent value="demo" className="mt-6">
                  <UrvDemo />
                </TabsContent>

                <TabsContent value="preset" className="mt-6">
                  <UrvPresetPanel />
                </TabsContent>

                <TabsContent value="docs" className="mt-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" />Privacy Design</CardTitle>
                      <CardDescription>URV Chain stores proofs and value signals, not clinical plaintext.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                      <p>
                        No PHI/PII should be stored on-chain. Patient identity, open diagnosis, prescription text and clinical notes remain off-chain.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="rounded-lg border p-4">
                          <h4 className="font-semibold mb-2">Allowed on-chain</h4>
                          <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                            <li>SHA-256 hashes</li>
                            <li>Encrypted URI pointers</li>
                            <li>URV score and confidence bps</li>
                            <li>Schema version, timestamps and PDAs</li>
                          </ul>
                        </div>
                        <div className="rounded-lg border p-4">
                          <h4 className="font-semibold mb-2">Never on-chain</h4>
                          <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                            <li>Name, CPF, address or phone</li>
                            <li>Open medical record text</li>
                            <li>Identifiable diagnosis or prescription</li>
                            <li>Any directly identifying clinical data</li>
                          </ul>
                        </div>
                      </div>
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Split-key is future security, not a development blocker</AlertTitle>
                        <AlertDescription>
                          The physical token and virtual token are reserved for future production-grade auditability.
                          They remain disabled by default so mock, devnet, CI and app development continue normally.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="architecture" className="mt-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Canonical URV Program Surface</CardTitle>
                      <CardDescription>Minimal Anchor/Solana operations expected by official derivatives.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      {[
                        ['State PDA', 'Seeds: [state, admin_pubkey]'],
                        ['Record PDA', 'Seeds: [rec, owner_pubkey, data_hash]'],
                        ['Update PDA', 'Seeds: [upd, state_pubkey, new_score_hash]'],
                        ['init_state', 'Initialize global state with admin and oracle'],
                        ['create_record', 'Register an off-chain event proof'],
                        ['post_score_update', 'Record chained URV score updates'],
                      ].map(([title, desc]) => (
                        <div key={title} className="flex items-start gap-3 rounded-lg border p-3">
                          <CheckCircle className="h-4 w-4 text-success shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold">{title}</p>
                            <p className="text-muted-foreground font-mono text-xs break-all">{desc}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </AppLayout>
  );
}
