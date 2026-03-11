import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SlotControlsProvider } from "@/context/SlotControlsContext";
import { RgsProvider } from "@/context/RgsContext";
import License from "./pages/License";
import LicenseGuard from "./components/LicenseGuard";
import Welcome from "./pages/Welcome";
import Pro from "./pages/Pro";
import Amateur from "./pages/Amateur";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RgsProvider>
        <SlotControlsProvider>
          <Routes>
            <Route path="/" element={<License />} />
            <Route path="/welcome" element={<LicenseGuard><Welcome /></LicenseGuard>} />
            <Route path="/pro" element={<LicenseGuard><Pro /></LicenseGuard>} />
            <Route path="/amateur" element={<LicenseGuard><Amateur /></LicenseGuard>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SlotControlsProvider>
        </RgsProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
