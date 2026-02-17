import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '../supabase';

export type Profile = {
    id: string;
    phone: string | null;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    is_active: boolean;
    is_host?: boolean;
    onboarded_at?: string | null;
};

type AuthContextType = {
    user: any | null; // Supabase user
    profile: Profile | null;
    loading: boolean;
    error: string | null;
    refreshProfile: () => Promise<void>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    error: null,
    refreshProfile: async () => { },
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) throw error;
            setProfile(data);
            return data;
        } catch (e: any) {
            setError(e.message);
            return null;
        }
    };

    const refreshProfile = async () => {
        if (user) {
            await loadProfile(user.id);
        }
    };

    useEffect(() => {
        let mounted = true;

        const init = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (mounted) {
                    setUser(session?.user ?? null);
                    if (session?.user) {
                        await loadProfile(session.user.id);
                    }
                }
            } catch (e: any) {
                if (mounted) setError(e.message);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        init();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (mounted) {
                setUser(session?.user ?? null);
                if (session?.user) {
                    await loadProfile(session.user.id);
                } else {
                    setProfile(null);
                }
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const value = useMemo(() => ({
        user,
        profile,
        loading,
        error,
        refreshProfile,
        signOut,
    }), [user, profile, loading, error]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
