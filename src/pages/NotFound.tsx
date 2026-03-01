import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Leaf, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404: Ruta no encontrada:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Leaf className="w-10 h-10 text-primary" />
        </div>
        <h1 className="mb-2 text-5xl font-display font-bold text-foreground">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">Página no encontrada</p>
        <Link to="/">
          <Button variant="earth" size="xl" className="h-14 text-lg gap-2">
            <Home className="w-5 h-5" />
            Volver al inicio
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
