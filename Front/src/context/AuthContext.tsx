import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  register: (email: string, password: string, name: string, avatar: string, bio?: string, province?: string) => Promise<{ success: boolean; message: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; message: string }>;
  recoverPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  updateUser: (updatedProfile: Partial<UserProfile>) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = async (userId: string) => {
    if (import.meta.env.DEV) console.log("[AuthContext] fetchProfile started for user", userId);
    try {
      const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
      if (import.meta.env.DEV) console.log("[AuthContext] fetchProfile db result", { data, error });
      if (data) {
        setUser({
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role || 'Colaborador',
          province: data.province || 'Capital Federal',
          isAdmin: data.role === 'admin' || data.role === 'Superadmin',
          avatar: data.avatar || '⚽',
          points: 0,
          accuracy: 0,
          streak: 0,
          bio: 'Listo para competir con mis compañeros.',
        });
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error('Error fetching profile:', e);
      setUser(null);
    } finally {
      if (import.meta.env.DEV) console.log("[AuthContext] fetchProfile finally block, setting loading false");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      if (import.meta.env.DEV) console.log("[AuthContext] initSession started");
      try {
        const { data, error } = await supabase.auth.getSession();
        if (import.meta.env.DEV) console.log("[AuthContext] getSession resolved", { data, error, mounted });
        if (!mounted) return;
        
        if (error) {
          console.error("Auth session error:", error);
          setIsLoading(false);
          return;
        }

        if (data?.session?.user) {
          if (import.meta.env.DEV) console.log("[AuthContext] session found, fetching profile");
          await fetchProfile(data.session.user.id);
        } else {
          if (import.meta.env.DEV) console.log("[AuthContext] no session found, setting loading false");
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Unexpected error during initSession:", err);
        if (mounted) setIsLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer execution to avoid supabase-js auth lock deadlock
      setTimeout(async () => {
        if (!mounted) return;
        try {
          if (session?.user) {
            if (import.meta.env.DEV) console.log("[AuthContext] onAuthStateChange session found, fetching profile");
            await fetchProfile(session.user.id);
          } else {
            if (import.meta.env.DEV) console.log("[AuthContext] onAuthStateChange no session, setting user null");
            setUser(null);
            setIsLoading(false);
          }
        } catch (err) {
          console.error("Unexpected error during onAuthStateChange:", err);
          setUser(null);
          setIsLoading(false);
        }
      }, 0);
    });

    // Safety fallback: if for ANY reason it takes more than 3 seconds, force unblock
    const fallbackTimer = setTimeout(() => {
      if (mounted) {
        if (import.meta.env.DEV) console.warn("[AuthContext] Safety fallback triggered! Force unblocking loading state.");
        setIsLoading(false);
      }
    }, 3000);

    return () => {
      mounted = false;
      clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, []);

  const register = async (email: string, password: string, name: string, avatar: string, bio?: string, province?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            // Security (#7): Never send 'role' in metadata — trigger always sets 'user'
            avatar: avatar || '⚽',
            province: province || 'Capital Federal'
          }
        }
      });

      if (error) return { success: false, message: error.message };
      if (!data.user) return { success: false, message: 'No se pudo crear el usuario.' };

      await fetchProfile(data.user.id);

      return { success: true, message: '¡Cuenta creada y autenticada con éxito!' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Error interno.' };
    }
  };

  const getRedirectUrl = () => {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    return (isLocalhost ? window.location.origin : (import.meta.env.VITE_APP_URL || window.location.origin)).trim().replace(/\/$/, "");
  };

  const recoverPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getRedirectUrl(),
      });
      if (error) return { success: false, message: error.message };
      return { success: true, message: 'Correo de recuperación enviado.' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Error en la conexión.' };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          return { success: false, message: 'Tu cuenta requiere confirmación de email. Desactivá "Confirm email" en Supabase > Auth > Providers > Email.' };
        }
        return { success: false, message: 'Correo o contraseña incorrectos.' };
      }
      return { success: true, message: '¡Sesión iniciada con éxito!' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Error en la conexión.' };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getRedirectUrl()
        }
      });
      if (error) return { success: false, message: error.message };
      return { success: true, message: 'Redirigiendo a Google...' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Error en la conexión.' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateUser = async (updatedFields: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const updates: any = {};
      if (updatedFields.name) updates.name = updatedFields.name;
      if (updatedFields.avatar) updates.avatar = updatedFields.avatar;
      if (updatedFields.province) updates.province = updatedFields.province;

      await supabase.from('users').update(updates).eq('id', session.user.id);
      await fetchProfile(session.user.id);
    } catch (e) {
      console.error('Error modifying user profile:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, register, login, loginWithGoogle, recoverPassword, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider wrapper.');
  }
  return context;
}
