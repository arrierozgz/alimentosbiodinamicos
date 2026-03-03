import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import LanguageSwitcher from '@/components/LanguageSwitcher';

type AuthMode = 'login' | 'register';

export default function Auth() {
  const { t } = useTranslation();
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
      if (roles.length === 0) navigate('/seleccionar-rol');
      else {
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
      if (error) toast.error(error.message || t('auth.wrong_credentials'));
      else toast.success(t('auth.welcome'));
    } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (password.length < 6) { toast.error(t('auth.password_too_short')); return; }
    if (password !== confirmPassword) { toast.error(t('auth.passwords_mismatch')); return; }
    setLoading(true);
    try {
      const { error } = await signUp(email.trim(), password);
      if (error) toast.error(error.message);
      else toast.success(t('auth.account_created'));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4"><LanguageSwitcher /></div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Leaf className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="font-display text-2xl">
            {mode === 'login' ? t('auth.title_login') : t('auth.title_register')}
          </CardTitle>
          <CardDescription className="text-base">
            {mode === 'login' ? t('auth.subtitle_login') : t('auth.subtitle_register')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input type="email" placeholder={t('auth.email_placeholder')} value={email} onChange={e => setEmail(e.target.value)} className="pl-12 h-14 text-lg" required autoComplete="email" autoFocus />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input type={showPassword ? 'text' : 'password'} placeholder={mode === 'register' ? t('auth.password_min') : t('auth.password_placeholder')} value={password} onChange={e => setPassword(e.target.value)} className="pl-12 pr-12 h-14 text-lg" required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
              <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {mode === 'register' && (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input type={showPassword ? 'text' : 'password'} placeholder={t('auth.confirm_password')} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="pl-12 h-14 text-lg" required autoComplete="new-password" />
              </div>
            )}
            <Button type="submit" variant="earth" size="xl" className="w-full h-14 text-lg" disabled={loading || !email || !password || (mode === 'register' && !confirmPassword)}>
              {loading
                ? <span className="flex items-center gap-2"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{mode === 'login' ? t('auth.logging_in') : t('auth.creating')}</span>
                : mode === 'login' ? t('auth.btn_login') : t('auth.btn_register')
              }
            </Button>
          </form>
          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              {mode === 'login' ? t('auth.no_account') : t('auth.has_account')}{' '}
              <button className="text-primary font-medium hover:underline" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setPassword(''); setConfirmPassword(''); }}>
                {mode === 'login' ? t('auth.register_free') : t('auth.login_link')}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
