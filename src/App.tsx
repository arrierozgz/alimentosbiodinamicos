import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { UserRolesProvider } from "@/hooks/useUserRoles";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import RoleSelection from "./pages/RoleSelection";
import Agricultor from "./pages/Agricultor";
import Explorar from "./pages/Explorar";
import Preparados from "./pages/Preparados";
import SobreNosotros from "./pages/SobreNosotros";
import MiPerfil from "./pages/MiPerfil";
import Elaborador from "./pages/Elaborador";
import Tienda from "./pages/Tienda";
import Consumidor from "./pages/Consumidor";
import Mensajes from "./pages/Mensajes";
import ResetPassword from "./pages/ResetPassword";
import Mapa from "./pages/Mapa";
import Producto from "./pages/Producto";
import Privacidad from "./pages/Privacidad";
import Terminos from "./pages/Terminos";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <UserRolesProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/seleccionar-rol" element={<RoleSelection />} />
              <Route path="/consumidor" element={<Consumidor />} />
              <Route path="/agricultor" element={<Agricultor />} />
              <Route path="/explorar" element={<Explorar />} />
              <Route path="/preparados" element={<Preparados />} />
              <Route path="/sobre-nosotros" element={<SobreNosotros />} />
              <Route path="/mi-perfil" element={<MiPerfil />} />
              <Route path="/elaborador" element={<Elaborador />} />
              <Route path="/tienda" element={<Tienda />} />
              <Route path="/mensajes" element={<Mensajes />} />
              <Route path="/mapa" element={<Mapa />} />
              <Route path="/producto/:id" element={<Producto />} />
              <Route path="/privacidad" element={<Privacidad />} />
              <Route path="/terminos" element={<Terminos />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </UserRolesProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
