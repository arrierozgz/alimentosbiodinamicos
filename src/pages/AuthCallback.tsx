import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Leaf } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from URL hash (OAuth callback)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Auth callback error:', sessionError);
          setError(sessionError.message);
          return;
        }

        if (session?.user) {
          // Check if user has any roles
          const { data: roles, error: rolesError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id);

          if (rolesError) {
            console.error('Error fetching roles:', rolesError);
          }

          // Redirect based on whether user has roles
          if (!roles || roles.length === 0) {
            // New user - needs to select roles
            navigate('/seleccionar-rol', { replace: true });
          } else {
            // Existing user - go to home
            navigate('/', { replace: true });
          }
        } else {
          // No session, redirect to auth
          navigate('/auth', { replace: true });
        }
      } catch (err) {
        console.error('Unexpected error in auth callback:', err);
        setError('Error inesperado durante la autenticación');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <Leaf className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">Error de autenticación</h1>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => navigate('/auth')}
            className="text-primary hover:underline"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <Leaf className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">Verificando sesión...</h1>
        <p className="text-muted-foreground">Un momento por favor</p>
      </div>
    </div>
  );
}

