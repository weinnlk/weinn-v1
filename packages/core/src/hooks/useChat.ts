// d:\weinn-v2\packages\core\src\hooks\useChat.ts

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../supabase';
import { Message, MessageContent } from '../types/messaging';

export function useChat(conversationId: string | null, userId: string | null) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load initial messages
    useEffect(() => {
        if (!conversationId) return;

        let cancelled = false;

        const load = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('messages')
                    .select('*')
                    .eq('conversation_id', conversationId)
                    .order('created_at', { ascending: true });

                if (error) throw error;
                if (!cancelled) setMessages(data as Message[]);
            } catch (err: any) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();

        // Mark as read on enter
        if (userId) {
            supabase.rpc('mark_conversation_read', { conv_id: conversationId });
        }

        return () => {
            cancelled = true;
        };
    }, [conversationId, userId]);

    // Subscribe to Realtime Updates
    useEffect(() => {
        if (!conversationId) return;

        const channel = supabase
            .channel(`chat:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                (payload) => {
                    const newMessage = payload.new as Message;
                    setMessages((prev) => {
                        // Avoid duplicates (e.g. from optimistic updates confirming)
                        if (prev.some(m => m.id === newMessage.id)) return prev;
                        return [...prev, newMessage];
                    });
                    // Mark as read if we are looking at it
                    if (userId && newMessage.sender_id !== userId) {
                        supabase.rpc('mark_conversation_read', { conv_id: conversationId });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId, userId]);

    // Send Message Function
    const sendMessage = useCallback(async (content: MessageContent) => {
        if (!conversationId || !userId) return;

        const optimisticId = `temp_${Date.now()}`;
        const optimisticMessage: Message = {
            id: optimisticId,
            conversation_id: conversationId,
            sender_id: userId,
            content,
            created_at: new Date().toISOString(),
            is_edited: false
        };

        // Optimistic Update
        setMessages((prev) => [...prev, optimisticMessage]);

        try {
            const { data, error } = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    sender_id: userId,
                    content
                })
                .select()
                .single();

            if (error) throw error;

            // Replace optimistic message with real one
            setMessages((prev) =>
                prev.map(m => m.id === optimisticId ? (data as Message) : m)
            );

        } catch (err: any) {
            setError(err.message);
            // Rollback
            setMessages((prev) => prev.filter(m => m.id !== optimisticId));
        }
    }, [conversationId, userId]);

    return { messages, loading, error, sendMessage };
}
