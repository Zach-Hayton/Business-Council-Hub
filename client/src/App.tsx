import { Footer, Header } from "@/components/layout";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/lib/app";
import Admin from "@/pages/admin";
import Credits from "@/pages/credits";
import Discover from "@/pages/discover";
import Guide from "@/pages/guide";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import OpportunityPage from "@/pages/opportunity";
import OrgPage from "@/pages/org";
import Organizations from "@/pages/organizations";
import Today, { ScreenMode } from "@/pages/today";
import Workspace from "@/pages/workspace";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { Redirect, Route, Router, Switch, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
function Shell() {
  const [loc] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [loc]);
  if (loc === "/screen") return <ScreenMode />;
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main")?.focus();
        }}
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-background focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/discover" component={Discover} />
          <Route path="/opportunity/:id" component={OpportunityPage} />
          <Route path="/organizations" component={Organizations} />
          <Route path="/organizations/:slug" component={OrgPage} />
          <Route path="/for-you">
            <Redirect to="/discover" />
          </Route>
          <Route path="/today" component={Today} />
          <Route path="/workspace" component={Workspace} />
          <Route path="/admin" component={Admin} />
          <Route path="/guide" component={Guide} />
          <Route path="/about">
            <Redirect to="/organizations" />
          </Route>
          <Route path="/credits" component={Credits} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <Toaster />
          <Router hook={useHashLocation}>
            <Shell />
          </Router>
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
