/**
 * App.tsx — Kampüs Fırsat Uygulaması (DropBite Tasarımı)
 * Design: Koyu tema, turuncu aksentler, stok yönetimi
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DealsProvider } from "./contexts/DealsContext";
import ConsumerFeed from "./pages/ConsumerFeed";
import DealDetail from "./pages/DealDetail";
import Wallet from "./pages/Wallet";
import Business from "./pages/Business";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ConsumerFeed} />
      <Route path="/deal/:id" component={DealDetail} />
      <Route path="/wallet" component={Wallet} />
      <Route path="/business" component={Business} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <DealsProvider>
          <TooltipProvider>
            <Toaster position="top-center" richColors />
            <Router />
          </TooltipProvider>
        </DealsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
