'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import pb from '@/lib/pocketbase';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage (pocketbase handles this automatically)
    if (pb.authStore.isValid && pb.authStore.record) {
      const record = pb.authStore.record;
      setUser({
        id: record['id'] as string,
        email: record['email'] as string,
        name: (record['name'] as string) || (record['email'] as string),
        avatar: record['avatar'] as string | undefined,
      });
      // Ensure cookie is present if PB session is still valid
      document.cookie = 'pb_authenticated=1; path=/; max-age=604800; SameSite=Lax';
    }
    setLoading(false);

    // Listen for auth changes
    const unsub = pb.authStore.onChange(() => {
      if (pb.authStore.isValid && pb.authStore.record) {
        const record = pb.authStore.record;
        setUser({
          id: record['id'] as string,
          email: record['email'] as string,
          name: (record['name'] as string) || (record['email'] as string),
          avatar: record['avatar'] as string | undefined,
        });
      } else {
        setUser(null);
      }
    });

    return () => unsub();
  }, []);

  async function login(email: string, password: string) {
    await pb.collection('users').authWithPassword(email, password);
    // Set a lightweight cookie so the middleware can guard SSR routes
    document.cookie = 'pb_authenticated=1; path=/; max-age=604800; SameSite=Lax';
  }

  function logout() {
    pb.authStore.clear();
    // Remove the guard cookie
    document.cookie = 'pb_authenticated=; path=/; max-age=0';
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
