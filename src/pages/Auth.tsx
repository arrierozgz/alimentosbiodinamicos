import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Mail, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().email('Por favor, introduce un email válido');

export default function Auth() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const { user } = useAuth();
  const { roles, loading: rolesLoading } = useUserRoles();
  const navigate = useNavigate();

  // Redirect authenticated users based on their roles
  useEffect(() => {
    if (user && !rolesLoading) {
      if (roles.length === 0) {
        // New user - needs role selection
        navigate('/seleccionar-rol');
      } else {
        // Existing user with roles
        navigate('/');
      }
    }
  }, [user, roles, rolesLoading, navigate]);

  const validateEmail = (value: string): boolean => {
    try {
      emailSchema.parse(value);
      setEmailError('');
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setEmailError(error.errors[0].message);
      }
      return false;
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        setMagicLinkSent(true);
        toast.success('¡Te hemos enviado un enlace mágico!');
      }
    } finally {
      setLoading(false);
    }
  };

  if (magicLinkSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="font-display text-2xl">
              ¡Enlace mágico enviado!
            </CardTitle>
            <CardDescription className="text-base">
              Hemos enviado un enlace de acceso a <strong>{email}</strong>. 
              <br /><br />
              Revisa tu bandeja de entrada y haz clic en el enlace para entrar directamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              <p className="font-medium mb-2">💡 Consejos:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Revisa también la carpeta de spam</li>
                <li>El enlace expira en 1 hora</li>
                <li>Solo funciona una vez</li>
              </ul>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setMagicLinkSent(false);
                setEmail('');
              }}
            >
              Usar otro email
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Leaf className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="font-display text-2xl">
            Accede a la Comunidad
          </CardTitle>
          <CardDescription>
            Introduce tu email y te enviaremos un enlace mágico para entrar sin contraseña
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) validateEmail(e.target.value);
                  }}
                  className={`pl-10 h-12 ${emailError ? 'border-destructive' : ''}`}
                  required
                  autoComplete="email"
                />
              </div>
              {emailError && (
                <p className="text-sm text-destructive">{emailError}</p>
              )}
            </div>
            <Button 
              type="submit" 
              variant="earth" 
              size="xl" 
              className="w-full"
              disabled={loading || !email}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enviando...
                </span>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Enviar enlace mágico
                </>
              )}
            </Button>
          </form>

          <div className="bg-muted/30 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">
              🔒 Sin contraseñas que recordar. Recibirás un enlace único en tu correo cada vez que quieras entrar.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
