import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { Navbar } from "@/components/Navbar";
import { Checkout } from './pages/Checkout'; // Adjust this path if you saved it in a 'pages' folder instead
import { Success } from './components/Success';

import Home from "@/pages/Home";
import Collections from "@/pages/Collections";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/collections" component={Collections} />
      <Route path="/contact" component={Contact} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/success" component={Success} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <div className="min-h-[100dvh] bg-[#0a0a0a] flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Router />
              </main>
              <footer className="border-t border-white/10 py-6 text-center">
                <p className="text-white/40 text-xs tracking-widest uppercase">&copy; {new Date().getFullYear()} TheAbdurrahaman. All rights reserved.</p>
              </footer>
            </div>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
