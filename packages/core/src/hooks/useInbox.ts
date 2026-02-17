// d:\weinn-v2\packages\core\src\hooks\useInbox.ts

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase';
import { Conversation } from '../types/messaging';

export function useInbox(userId: string | null) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchInbox = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            // Use the RPC we created
            const { data, error } = await supabase.rpc('get_inbox');
            if (error) throw error;
            setConversations(data as Conversation[]);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // Initial Load & Realtime Subscription
    useEffect(() => {
        fetchInbox();

        if (!userId) return;

        // Subscribe to changes in conversations (e.g. new message updates updated_at)
        // We can also subscribe to 'participants' to see if unread status changes
        const channel = supabase
            .channel('inbox_updates')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to INSERT/UPDATE on conversations or participants?
                    schema: 'public',
                    table: 'conversations' // Simplification: Refresh list when any conversation updates
                },
                () => {
                    fetchInbox();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, fetchInbox]);

    return { conversations, loading, error, refresh: fetchInbox };
}
