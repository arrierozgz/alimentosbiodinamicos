import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

type AuthMode = 'login' | 'register';

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, signIn, signUp } = useAuth();
  const { roles, loading: rolesLoading } = useUserRoles();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !rolesLoading) {
      if (roles.length === 0) {
        navigate('/seleccionar-rol');
      } else {
        const primary = roles[0];
        if (primary === 'consumidor') navigate('/consumidor');
        else if (primary === 'agricultor' || primary === 'ganadero') navigate('/agricultor');
        else if (primary === 'elaborador') navigate('/elaborador');
        else navigate('/');
      }
    }
  }, [user, roles, rolesLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        toast.error(error.message || 'Email o contraseña incorrectos');
      } else {
        toast.success('¡Bienvenido/a!');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      const { error } = await signUp(email.trim(), password);
      if (error) {
        toast.error(error.message || 'Error al crear cuenta');
      } else {
        toast.success('¡Cuenta creada!');
      }
    } finally {
      setLoading(false);
    }
  };

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
            {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </CardTitle>
          <CardDescription className="text-base">
            {mode === 'login'
              ? 'Entra con tu email y contraseña'
              : 'Regístrate gratis en la comunidad'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 h-14 text-lg"
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder={mode === 'register' ? 'Contraseña (mín. 6 caracteres)' : 'Contraseña'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 pr-12 h-14 text-lg"
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {mode === 'register' && (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repetir contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-12 h-14 text-lg"
                  required
                  autoComplete="new-password"
                />
              </div>
            )}

            <Button
              type="submit"
              variant="earth"
              size="xl"
              className="w-full h-14 text-lg"
              disabled={loading || !email || !password || (mode === 'register' && !confirmPassword)}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === 'login' ? 'Entrando...' : 'Creando cuenta...'}
                </span>
              ) : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </Button>
          </form>

          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
              <button
                className="text-primary font-medium hover:underline"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setPassword('');
                  setConfirmPassword('');
                }}
              >
                {mode === 'login' ? 'Regístrate gratis' : 'Inicia sesión'}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
