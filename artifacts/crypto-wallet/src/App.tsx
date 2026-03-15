import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";

// Pages
import Dashboard from "@/pages/dashboard";
import WalletSetup from "@/pages/wallet-setup";
import Send from "@/pages/send";
import Receive from "@/pages/receive";
import History from "@/pages/history";
import Market from "@/pages/market";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/wallet-setup" component={WalletSetup} />
      
      <Route path="/">
        {() => <AppLayout><Dashboard /></AppLayout>}
      </Route>
      <Route path="/send">
        {() => <AppLayout><Send /></AppLayout>}
      </Route>
      <Route path="/receive">
        {() => <AppLayout><Receive /></AppLayout>}
      </Route>
      <Route path="/history">
        {() => <AppLayout><History /></AppLayout>}
      </Route>
      <Route path="/market">
        {() => <AppLayout><Market /></AppLayout>}
      </Route>
      <Route path="/settings">
        {() => <AppLayout><Settings /></AppLayout>}
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
