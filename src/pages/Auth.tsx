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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const { user } = useAuth();
  const { roles, loading: rolesLoading } = useUserRoles();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !rolesLoading) {
      if (roles.length === 0) {
        navigate('/seleccionar-rol');
      } else {
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

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        toast.error('Error al iniciar sesión con Google');
        console.error('Google login error:', error);
      }
    } catch (err) {
      toast.error('Error inesperado');
      console.error(err);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) return;

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
              ¡Enlace enviado!
            </CardTitle>
            <CardDescription className="text-base">
              Hemos enviado un enlace de acceso a <strong>{email}</strong>.
              <br /><br />
              Revisa tu bandeja de entrada y haz clic en el enlace para entrar.
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
              className="w-full h-14 text-lg"
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
          <CardDescription className="text-base">
            Entra con tu cuenta de Google o con tu email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google Login - BIG and prominent */}
          <Button
            variant="outline"
            className="w-full h-16 text-lg gap-3 border-2 hover:bg-muted/50"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <span className="w-6 h-6 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
            ) : (
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Entrar con Google
          </Button>

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card px-4 text-muted-foreground">o con tu email</span>
            </div>
          </div>

          {/* Magic Link */}
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) validateEmail(e.target.value);
                  }}
                  className={`pl-12 h-14 text-lg ${emailError ? 'border-destructive' : ''}`}
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
              className="w-full h-14 text-lg"
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
              🔒 Sin contraseñas. Entra con Google o recibe un enlace en tu correo.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
