import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

type AppRole = 'consumidor' | 'agricultor' | 'ganadero' | 'elaborador' | 'admin';

interface UserRolesContextType {
  roles: AppRole[];
  activeRole: AppRole | null;
  loading: boolean;
  setActiveRole: (role: AppRole) => void;
  addRole: (role: AppRole) => Promise<{ error: Error | null }>;
  removeRole: (role: AppRole) => Promise<{ error: Error | null }>;
  hasRole: (role: AppRole) => boolean;
  refreshRoles: () => Promise<void>;
}

const UserRolesContext = createContext<UserRolesContextType | undefined>(undefined);

const ACTIVE_ROLE_KEY = 'biodinamico_active_role';

// Auto-admin emails - these users get admin role automatically
const ADMIN_EMAILS = [
  'mcarlosmorales@hotmail.com',
  'aragonbiodinamica@gmail.com', 
  'lumicasalola@gmail.com',
  'lumi@casarurallola.com',
  'aragobiodinamica@gmail.com'  // Added per Carlos request
];

export function UserRolesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [activeRole, setActiveRoleState] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRoles = useCallback(async () => {
    if (!user) {
      setRoles([]);
      setActiveRoleState(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) throw error;

      let userRoles = data?.map(r => r.role) || [];
      
      // Auto-add admin role for specific emails
      const userEmail = user.email?.toLowerCase() || '';
      if (ADMIN_EMAILS.includes(userEmail) && !userRoles.includes('admin')) {
        await supabase
          .from('user_roles')
          .insert({ user_id: user.id, role: 'admin' });
        userRoles = [...userRoles, 'admin'];
      }
      
      setRoles(userRoles);

      // Restore active role from localStorage or default to first role
      const savedActiveRole = localStorage.getItem(ACTIVE_ROLE_KEY) as AppRole | null;
      if (savedActiveRole && userRoles.includes(savedActiveRole)) {
        setActiveRoleState(savedActiveRole);
      } else if (userRoles.length > 0) {
        setActiveRoleState(userRoles[0]);
      } else {
        setActiveRoleState(null);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const setActiveRole = (role: AppRole) => {
    if (roles.includes(role)) {
      setActiveRoleState(role);
      localStorage.setItem(ACTIVE_ROLE_KEY, role);
    }
  };

  const addRole = async (role: AppRole): Promise<{ error: Error | null }> => {
    if (!user) return { error: new Error('No autenticado') };
    
    if (roles.includes(role)) {
      return { error: null }; // Already has this role
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: user.id, role });

      if (error) throw error;

      await fetchRoles();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const removeRole = async (role: AppRole): Promise<{ error: Error | null }> => {
    if (!user) return { error: new Error('No autenticado') };

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.id)
        .eq('role', role);

      if (error) throw error;

      await fetchRoles();
      
      // If we removed the active role, switch to another
      if (activeRole === role) {
        const remaining = roles.filter(r => r !== role);
        if (remaining.length > 0) {
          setActiveRole(remaining[0]);
        } else {
          setActiveRoleState(null);
          localStorage.removeItem(ACTIVE_ROLE_KEY);
        }
      }
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const hasRole = (role: AppRole): boolean => {
    return roles.includes(role);
  };

  const refreshRoles = async () => {
    await fetchRoles();
  };

  return (
    <UserRolesContext.Provider value={{
      roles,
      activeRole,
      loading,
      setActiveRole,
      addRole,
      removeRole,
      hasRole,
      refreshRoles,
    }}>
      {children}
    </UserRolesContext.Provider>
  );
}

export function useUserRoles() {
  const context = useContext(UserRolesContext);
  if (context === undefined) {
    throw new Error('useUserRoles must be used within a UserRolesProvider');
  }
  return context;
}
