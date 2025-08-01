import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import InitiativeForm from "./pages/InitiativeForm";
import Initiatives from "./pages/Initiatives";
import Workflow from "./pages/Workflow";
import Timeline from "./pages/Timeline";
import KPI from "./pages/KPI";
import Reports from "./pages/Reports";
import Teams from "./pages/Teams";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/initiative/new" element={<InitiativeForm />} />
            <Route path="/initiatives" element={<Initiatives />} />
            <Route path="/workflow" element={<Workflow />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/kpi" element={<KPI />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/teams" element={<Teams />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
