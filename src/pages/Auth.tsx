import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Mail, Sparkles, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().email('Por favor, introduce un email válido');
const passwordSchema = z.string().min(6, 'La contraseña debe tener al menos 6 caracteres');

type AuthMode = 'choose' | 'login' | 'register' | 'magic-link' | 'magic-link-sent' | 'forgot-password' | 'forgot-password-sent';

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('choose');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { user } = useAuth();
  const { roles, loading: rolesLoading } = useUserRoles();
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

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

  const validatePassword = (value: string): boolean => {
    try {
      passwordSchema.parse(value);
      setPasswordError('');
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setPasswordError(error.errors[0].message);
      }
      return false;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email) || !validatePassword(password)) return;

    setLoading(true);
    try {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        if (error.message.includes('Invalid login')) {
          toast.error('Email o contraseña incorrectos');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('¡Bienvenido/a!');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email) || !validatePassword(password)) return;

    if (password !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(email.trim(), password);
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Este email ya está registrado. ¿Quieres iniciar sesión?');
          setMode('login');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('¡Cuenta creada! Revisa tu email para confirmar.');
      }
    } finally {
      setLoading(false);
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
        setMode('magic-link-sent');
        toast.success('¡Te hemos enviado un enlace mágico!');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        setMode('forgot-password-sent');
        toast.success('¡Email de recuperación enviado!');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      toast.error('Error al conectar con Google');
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setEmailError('');
    setPasswordError('');
  };

  const goBack = () => {
    resetForm();
    setMode('choose');
  };

  // Magic link sent confirmation
  if (mode === 'magic-link-sent') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="font-display text-2xl">¡Enlace enviado!</CardTitle>
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
            <Button variant="outline" className="w-full h-14 text-lg" onClick={goBack}>
              Volver
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
            {mode === 'choose' && 'Accede a la Comunidad'}
            {mode === 'login' && 'Iniciar sesión'}
            {mode === 'register' && 'Crear cuenta'}
            {mode === 'magic-link' && 'Enlace mágico'}
            {mode === 'forgot-password' && 'Recuperar contraseña'}
            {mode === 'forgot-password-sent' && '¡Email enviado!'}
          </CardTitle>
          <CardDescription className="text-base">
            {mode === 'choose' && 'Elige cómo quieres acceder'}
            {mode === 'login' && 'Entra con tu email y contraseña'}
            {mode === 'register' && 'Regístrate gratis en la comunidad'}
            {mode === 'magic-link' && 'Te enviaremos un enlace a tu email'}
            {mode === 'forgot-password' && 'Introduce tu email y te enviaremos un enlace para restablecer tu contraseña'}
            {mode === 'forgot-password-sent' && ''}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Mode: Choose */}
          {mode === 'choose' && (
            <>
              <Button
                variant="earth"
                size="xl"
                className="w-full h-14 text-lg"
                onClick={() => setMode('login')}
              >
                <Mail className="w-5 h-5" />
                Entrar con email
              </Button>

              <Button
                variant="outline"
                size="xl"
                className="w-full h-14 text-lg"
                onClick={handleGoogleLogin}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </Button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">o</span>
                </div>
              </div>

              <Button
                variant="ghost"
                className="w-full h-12 text-base"
                onClick={() => setMode('magic-link')}
              >
                <Sparkles className="w-4 h-4" />
                Entrar sin contraseña (enlace mágico)
              </Button>

              <div className="text-center pt-2">
                <p className="text-sm text-muted-foreground">
                  ¿No tienes cuenta?{' '}
                  <button
                    className="text-primary font-medium hover:underline"
                    onClick={() => setMode('register')}
                  >
                    Regístrate gratis
                  </button>
                </p>
              </div>
            </>
          )}

          {/* Mode: Login */}
          {mode === 'login' && (
            <>
              <form onSubmit={handleLogin} className="space-y-4">
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
                  {emailError && <p className="text-sm text-destructive">{emailError}</p>}
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Contraseña"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) validatePassword(e.target.value);
                      }}
                      className={`pl-12 pr-12 h-14 text-lg ${passwordError ? 'border-destructive' : ''}`}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                </div>

                <Button
                  type="submit"
                  variant="earth"
                  size="xl"
                  className="w-full h-14 text-lg"
                  disabled={loading || !email || !password}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Entrando...
                    </span>
                  ) : (
                    'Iniciar sesión'
                  )}
                </Button>
              </form>

              <div className="text-center pt-1">
                <button
                  className="text-sm text-muted-foreground hover:text-primary hover:underline"
                  onClick={() => { setPassword(''); setPasswordError(''); setMode('forgot-password'); }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <div className="text-center space-y-2 pt-2">
                <p className="text-sm text-muted-foreground">
                  ¿No tienes cuenta?{' '}
                  <button
                    className="text-primary font-medium hover:underline"
                    onClick={() => { resetForm(); setMode('register'); }}
                  >
                    Regístrate
                  </button>
                </p>
              </div>

              <Button variant="ghost" className="w-full" onClick={goBack}>
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
            </>
          )}

          {/* Mode: Register */}
          {mode === 'register' && (
            <>
              <form onSubmit={handleRegister} className="space-y-4">
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
                  {emailError && <p className="text-sm text-destructive">{emailError}</p>}
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Contraseña (mín. 6 caracteres)"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) validatePassword(e.target.value);
                      }}
                      className={`pl-12 pr-12 h-14 text-lg ${passwordError ? 'border-destructive' : ''}`}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                </div>

                <div className="space-y-2">
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
                </div>

                <Button
                  type="submit"
                  variant="earth"
                  size="xl"
                  className="w-full h-14 text-lg"
                  disabled={loading || !email || !password || !confirmPassword}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creando cuenta...
                    </span>
                  ) : (
                    'Crear cuenta'
                  )}
                </Button>
              </form>

              <div className="text-center pt-2">
                <p className="text-sm text-muted-foreground">
                  ¿Ya tienes cuenta?{' '}
                  <button
                    className="text-primary font-medium hover:underline"
                    onClick={() => { resetForm(); setMode('login'); }}
                  >
                    Inicia sesión
                  </button>
                </p>
              </div>

              <Button variant="ghost" className="w-full" onClick={goBack}>
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
            </>
          )}

          {/* Mode: Forgot Password */}
          {mode === 'forgot-password' && (
            <>
              <form onSubmit={handleForgotPassword} className="space-y-4">
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
                  {emailError && <p className="text-sm text-destructive">{emailError}</p>}
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
                    'Enviar enlace de recuperación'
                  )}
                </Button>
              </form>

              <Button variant="ghost" className="w-full" onClick={() => { resetForm(); setMode('login'); }}>
                <ArrowLeft className="w-4 h-4" />
                Volver a iniciar sesión
              </Button>
            </>
          )}

          {/* Mode: Forgot Password Sent */}
          {mode === 'forgot-password-sent' && (
            <>
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <p className="text-base text-muted-foreground">
                  Si existe una cuenta con <strong>{email}</strong>, recibirás un email con un enlace para restablecer tu contraseña.
                </p>
                <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                  <p className="font-medium mb-2">💡 Consejos:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Revisa también la carpeta de spam</li>
                    <li>El enlace expira en 1 hora</li>
                    <li>Solo funciona una vez</li>
                  </ul>
                </div>
              </div>
              <Button variant="outline" className="w-full h-14 text-lg" onClick={goBack}>
                Volver
              </Button>
            </>
          )}

          {/* Mode: Magic Link */}
          {mode === 'magic-link' && (
            <>
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
                  {emailError && <p className="text-sm text-destructive">{emailError}</p>}
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
                  🔒 Sin contraseñas. Recibirás un enlace único en tu correo.
                </p>
              </div>

              <Button variant="ghost" className="w-full" onClick={goBack}>
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
