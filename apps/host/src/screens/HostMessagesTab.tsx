import React from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme, Text, Card, Button, Input, XStack, YStack, Avatar, IconButton } from '@weinn/ui';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '@weinn/core';

const MessagesStack = createNativeStackNavigator();
const TEST_OTHER_USER_ID = '0b947075-0601-4f02-bedd-be8cd633b9db';

type ConversationSummary = {
    conversation_id: string;
    other_user_id: string;
    other_first_name: string | null;
    other_last_name: string | null;
    last_message: string | null;
    last_message_at: string | null;
};

// --- Components ---

function ChatBubble({ direction, text }: { direction: 'in' | 'out'; text: string }) {
    const theme = useTheme();
    const isOut = direction === 'out';
    return (
        <View
            style={{
                alignSelf: isOut ? 'flex-end' : 'flex-start',
                backgroundColor: isOut ? theme.primary.get() : theme.surfaceVariant.get(),
                borderRadius: 16,
                borderBottomRightRadius: isOut ? 2 : 16,
                borderBottomLeftRadius: isOut ? 16 : 2,
                paddingHorizontal: 16,
                paddingVertical: 10,
                maxWidth: '80%',
                marginVertical: 4,
            }}
        >
            <Text variant="body" style={{ color: isOut ? theme.onPrimary.get() : theme.onSurfaceVariant.get() }}>
                {text}
            </Text>
        </View>
    );
}

// --- Screens ---

function HostConversationsScreen({ authUserId, navigation }: { authUserId: string | null; navigation: any }) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const [status, setStatus] = React.useState<string>('');
    const [items, setItems] = React.useState<ConversationSummary[]>([]);
    const [loading, setLoading] = React.useState(false);

    const load = React.useCallback(async () => {
        if (!authUserId) return;
        const { data, error } = await supabase.rpc('get_conversation_summaries');
        if (error) throw error;
        setItems((data ?? []) as any);
    }, [authUserId]);

    React.useEffect(() => {
        if (!authUserId) return;
        let cancelled = false;
        (async () => {
            setLoading(true);
            setStatus('');
            try {
                await load();
            } catch (e: any) {
                if (!cancelled) setStatus(e?.message ?? 'Failed to load conversations');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        const channel = supabase
            .channel('conversation_summaries')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                const m = payload.new as any;
                const conversationId = m?.conversation_id as string | undefined;
                const ciphertext = m?.ciphertext as string | undefined;
                const createdAt = m?.created_at as string | undefined;
                if (!conversationId) return;

                setItems((prev) => {
                    const idx = prev.findIndex((x) => x.conversation_id === conversationId);
                    if (idx < 0) return prev;
                    const nextItem: ConversationSummary = {
                        ...prev[idx],
                        last_message: ciphertext ?? prev[idx].last_message,
                        last_message_at: createdAt ?? prev[idx].last_message_at,
                    };
                    const next = [...prev.slice(0, idx), ...prev.slice(idx + 1)];
                    return [nextItem, ...next];
                });
            })
            .subscribe();
        return () => {
            cancelled = true;
            supabase.removeChannel(channel);
        };
    }, [authUserId, load]);

    if (!authUserId) {
        return (
            <View style={{ flex: 1, backgroundColor: theme.background.get(), alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                <Avatar size="$6" circular backgroundColor="$surfaceVariant" marginBottom="$4">
                    <Icon name="message-lock-outline" size={40} color={theme.onSurfaceVariant.get()} />
                </Avatar>
                <Text variant="title" style={{ fontWeight: 'bold' }}>Messages</Text>
                <Text variant="body" style={{ color: theme.onSurfaceVariant.get(), textAlign: 'center' }}>Sign in to start messaging with your guests.</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: theme.background.get() }}>
            <View style={{ paddingHorizontal: 16, paddingTop: insets.top + 8, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.background.get(), borderBottomWidth: 1, borderBottomColor: theme.borderColor.get() }}>
                <View style={{ width: 48 }} />
                <Text variant="title" style={{ fontWeight: 'bold' }}>Messages</Text>
                <Button variant="ghost" icon={<Icon name="plus" size={24} color={theme.color.get()} />} onPress={async () => {
                    if (!authUserId) return;
                    try {
                        const { data, error } = await supabase.rpc('create_conversation_with_user', {
                            other_user_id: TEST_OTHER_USER_ID,
                        });
                        if (error) throw error;
                        const convId = (data as any)?.conversation_id as string | undefined;
                        if (convId) navigation.navigate('Chat', { conversationId: convId, title: 'Test chat' });
                    } catch (e: any) {
                        // ignore
                    }
                }} width={48} height={48} />
            </View>

            <FlatList
                data={items}
                keyExtractor={(item) => item.conversation_id}
                contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
                ListEmptyComponent={
                    <View style={{ padding: 48, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                        <Avatar size="$8" circular backgroundColor="$surfaceVariant">
                            <Icon name="message-outline" size={40} color={theme.onSurfaceVariant.get()} />
                        </Avatar>
                        <Text variant="title" style={{ color: theme.onSurfaceVariant.get() }}>No messages yet</Text>
                        <Text variant="body" style={{ color: theme.onSurfaceVariant.get(), textAlign: 'center', maxWidth: 250 }}>
                            Messages from your guests will appear here.
                        </Text>
                    </View>
                }
                renderItem={({ item }) => {
                    const name = `${(item.other_first_name ?? '').trim()} ${(item.other_last_name ?? '').trim()}`.trim() || 'Guest';
                    const lastTime = item.last_message_at ? new Date(item.last_message_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';

                    return (
                        <>
                            <Button
                                variant="ghost"
                                style={{ paddingVertical: 12, height: 'auto', justifyContent: 'flex-start' }}
                                onPress={() => navigation.navigate('Chat', { conversationId: item.conversation_id, title: name })}
                            >
                                <XStack alignItems="center" width="100%">
                                    <Avatar size="$5" circular backgroundColor="$primaryContainer">
                                        <Text color="$onPrimaryContainer">{name[0]}</Text>
                                    </Avatar>
                                    <YStack marginLeft="$3" flex={1}>
                                        <Text variant="body" fontWeight="bold">{name}</Text>
                                        <Text variant="label" color="$onSurfaceVariant" numberOfLines={1}>{item.last_message ?? 'No messages yet'}</Text>
                                    </YStack>
                                    <Text variant="label" color="$onSurfaceVariant">{lastTime}</Text>
                                </XStack>
                            </Button>
                            <View style={{ marginLeft: 72, height: StyleSheet.hairlineWidth, backgroundColor: theme.borderColor.get() }} />
                        </>
                    );
                }}
            />
        </View>
    );
}

function HostChatScreen({ authUserId, route, navigation }: { authUserId: string | null; route: any; navigation: any }) {
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const conversationId = route?.params?.conversationId as string | undefined;
    const title = route?.params?.title as string | undefined;

    const [status, setStatus] = React.useState<string>('');
    const [loading, setLoading] = React.useState(false);
    const [messages, setMessages] = React.useState<
        { id: string; sender_user_id: string; ciphertext: string; created_at: string }[]
    >([]);
    const [draft, setDraft] = React.useState('');
    const listRef = React.useRef<FlatList>(null);

    const loadMessages = React.useCallback(async () => {
        if (!conversationId) return;
        const { data, error } = await supabase
            .from('messages')
            .select('id, sender_user_id, ciphertext, created_at')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });
        if (error) throw error;
        setMessages((data ?? []) as any);
    }, [conversationId]);

    React.useEffect(() => {
        if (!conversationId) return;
        let cancelled = false;
        (async () => {
            try {
                await loadMessages();
            } catch (e: any) {
                if (!cancelled) setStatus(e?.message ?? 'Failed to load messages');
            }
        })();

        const channel = supabase
            .channel(`messages:${conversationId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
                (payload) => {
                    const m = payload.new as any;
                    setMessages((prev) => {
                        if (prev.some((x) => x.id === m.id)) return prev;
                        return [...prev, m];
                    });
                }
            )
            .subscribe();

        return () => {
            cancelled = true;
            supabase.removeChannel(channel);
        };
    }, [conversationId, loadMessages]);

    React.useEffect(() => {
        if (!messages.length) return;
        const t = setTimeout(() => {
            listRef.current?.scrollToEnd({ animated: true });
        }, 100);
        return () => clearTimeout(t);
    }, [messages.length]);

    const sendMessage = async () => {
        if (!authUserId || !conversationId) return;
        if (!draft.trim()) return;
        const text = draft.trim();
        const optimisticId = `local_${Date.now()}`;
        const optimisticMessage = {
            id: optimisticId,
            sender_user_id: authUserId,
            ciphertext: text,
            created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, optimisticMessage]);
        setDraft('');

        setLoading(true);
        setStatus('');
        try {
            const { data, error } = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    sender_user_id: authUserId,
                    ciphertext: text,
                    algo: 'PLAINTEXT_V0',
                })
                .select('id, sender_user_id, ciphertext, created_at')
                .single();
            if (error) throw error;

            const inserted = (data ?? null) as any;
            if (inserted?.id) {
                setMessages((prev) => {
                    if (prev.some((x) => x.id === inserted.id)) {
                        return prev.filter((x) => x.id !== optimisticId);
                    }
                    return prev.map((x) => (x.id === optimisticId ? inserted : x));
                });
            }
        } catch (e: any) {
            setStatus(e?.message ?? 'Failed to send message');
            setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
            setDraft(text);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.background.get() }}>
            <View style={{ paddingHorizontal: 16, paddingTop: insets.top + 8, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.surface.get(), borderBottomWidth: 1, borderBottomColor: theme.borderColor.get() }}>
                <Button variant="ghost" icon={<Icon name="arrow-left" size={24} color={theme.color.get()} />} onPress={() => navigation.goBack()} width={48} height={48} />
                <Text variant="title" style={{ fontWeight: 'bold' }}>{title ?? 'Chat'}</Text>
                <View style={{ width: 48 }} />
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
                <FlatList
                    ref={listRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        const isMe = item.sender_user_id === authUserId;
                        return (
                            <View style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                                <Card
                                    variant="filled"
                                    style={{
                                        paddingHorizontal: 16,
                                        paddingVertical: 10,
                                        borderRadius: 20,
                                        borderBottomRightRadius: isMe ? 4 : 20,
                                        borderBottomLeftRadius: isMe ? 20 : 4,
                                        backgroundColor: isMe ? theme.primary.get() : theme.secondaryContainer.get(),
                                    }}
                                >
                                    <Text variant="body" style={{ color: isMe ? theme.onPrimary.get() : theme.onSecondaryContainer.get() }}>
                                        {item.ciphertext}
                                    </Text>
                                </Card>
                                <Text variant="label" style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', marginTop: 4, marginHorizontal: 4, opacity: 0.6 }}>
                                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                        );
                    }}
                    contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 24 }}
                    onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
                />

                <Card variant="filled" style={{ padding: 8, paddingHorizontal: 16, paddingBottom: 8 + insets.bottom, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.surface.get(), borderTopWidth: 1, borderTopColor: theme.borderColor.get() }}>
                    <Input
                        placeholder="Message..."
                        value={draft}
                        onChangeText={setDraft}
                        flex={1}
                        multiline
                    />
                    <Button
                        variant="primary"
                        circular
                        icon={<Icon name="send" size={20} color={theme.onPrimary.get()} />}
                        width={40}
                        height={40}
                        onPress={sendMessage}
                        disabled={!draft.trim() || loading}
                    />
                </Card>
            </KeyboardAvoidingView>
        </View>
    );
}

export function HostMessagesTab({ authUserId }: { authUserId: string | null }) {
    return (
        <MessagesStack.Navigator>
            <MessagesStack.Screen name="Conversations" options={{ headerShown: false }}>
                {(props) => <HostConversationsScreen {...props} authUserId={authUserId} />}
            </MessagesStack.Screen>
            <MessagesStack.Screen name="Chat" options={{ headerShown: false }}>
                {(props) => <HostChatScreen {...props} authUserId={authUserId} />}
            </MessagesStack.Screen>
        </MessagesStack.Navigator>
    );
}
