import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import NotFound from '@/pages/not-found';
import Vault from '@/pages/Vault';
import Login from '@/pages/Login';

const queryClient = new QueryClient();

function AuthGate() {
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json() as { authenticated: boolean };
        setAuthState(data.authenticated ? 'authenticated' : 'unauthenticated');
      } else {
        setAuthState('unauthenticated');
      }
    } catch {
      setAuthState('unauthenticated');
    }
  };

  useEffect(() => {
    void checkAuth();
  }, []);

  if (authState === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center font-mono">
          <div className="text-2xl font-black uppercase tracking-widest mb-2">CredVault</div>
          <div className="text-muted-foreground text-sm uppercase tracking-wider">Loading...</div>
        </div>
      </div>
    );
  }

  if (authState === 'unauthenticated') {
    return <Login onSuccess={() => setAuthState('authenticated')} />;
  }

  return (
    <Switch>
      <Route path="/" component={Vault} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <AuthGate />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
