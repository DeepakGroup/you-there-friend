import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import AuthPage from "./components/auth/AuthPage";
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

interface User {
  id: string;
  email: string;
  fullName: string;
  site: string;
  discipline: string;
  role: string;
  roleName: string;
}

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("opex_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem("opex_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("opex_user");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading OpEx Hub...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthPage onLogin={handleLogin} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout user={user} onLogout={handleLogout}>
            <Routes>
              <Route path="/" element={<Dashboard user={user} />} />
              <Route path="/initiative/new" element={<InitiativeForm user={user} />} />
              <Route path="/initiatives" element={<Initiatives user={user} />} />
              <Route path="/workflow" element={<Workflow user={user} />} />
              <Route path="/timeline" element={<Timeline user={user} />} />
              <Route path="/kpi" element={<KPI user={user} />} />
              <Route path="/reports" element={<Reports user={user} />} />
              <Route path="/teams" element={<Teams user={user} />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;