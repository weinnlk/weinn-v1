import * as React from 'react';
import { FlatList, KeyboardAvoidingView, Platform, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Divider, Text, Input, useTheme, XStack, YStack, Chip } from '@weinn/ui';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '@weinn/core';

// --- Types ---
type Profile = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
};

// Local Avatar Component
const Avatar = ({
    size = 40,
    label,
    icon,
    color,
    backgroundColor
}: {
    size?: number;
    label?: string;
    icon?: string;
    color?: string;
    backgroundColor?: string;
}) => (
    <View style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: backgroundColor || '#ccc',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
    }}>
        {icon ? (
            <Icon name={icon} size={size * 0.6} color={color || 'white'} />
        ) : (
            <Text style={{ color: color || 'white', fontSize: size * 0.4, fontWeight: 'bold' }}>
                {label}
            </Text>
        )}
    </View>
);

// --- Guest Conversations Screen ---

export function GuestConversationsScreen({ navigation, authUserId }: { navigation: any; authUserId: string | null }) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const [conversations, setConversations] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                setLoading(true);
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Fetch conversations where guest_id is current user
                const { data, error } = await supabase
                    .from('conversations')
                    .select('id, property_id, host_id, created_at, updated_at, properties(title)')
                    .eq('guest_id', user.id)
                    .order('updated_at', { ascending: false });

                if (error) throw error;
                if (!cancelled) setConversations(data ?? []);
            } catch (e) {
                // error handling
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: theme.background.get() }}>
            <SafeAreaView edges={['top']} style={{ backgroundColor: theme.background.get() }}>
                <XStack paddingHorizontal="$4" paddingVertical="$3" alignItems="center" justifyContent="center">
                    <Text variant="title" style={{ fontWeight: 'bold' }}>Messages</Text>
                </XStack>
                <Divider />
            </SafeAreaView>

            <FlatList
                data={conversations}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: insets.bottom }}
                ListEmptyComponent={
                    <View style={{ padding: 48, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                        <Avatar size={80} icon="message-outline" backgroundColor={theme.gray3.get()} color={theme.gray11.get()} />
                        <Text variant="title" style={{ color: theme.gray11.get() }}>No messages yet</Text>
                        <Text variant="body" style={{ color: theme.gray11.get(), textAlign: 'center', maxWidth: 250 }}>
                            When you contact a host, your conversations will appear here.
                        </Text>
                    </View>
                }
                renderItem={({ item }) => {
                    const propertyTitle = item.properties?.title ?? 'Property Host';
                    const lastActive = new Date(item.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

                    return (
                        <>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Chat', { conversationId: item.id, title: propertyTitle })}
                                style={{ paddingHorizontal: 16, paddingVertical: 12 }}
                            >
                                <XStack alignItems="center" gap="$3">
                                    <Avatar size={48} label={propertyTitle.substring(0, 1)} backgroundColor={theme.primary.get()} color="white" />
                                    <YStack flex={1} gap="$1">
                                        <Text variant="body" style={{ fontWeight: 'bold' }}>{propertyTitle}</Text>
                                        <Text variant="label" style={{ color: theme.gray11.get() }}>Tap to view conversation</Text>
                                    </YStack>
                                    <Text variant="label" style={{ color: theme.gray11.get() }}>{lastActive}</Text>
                                </XStack>
                            </TouchableOpacity>
                            <Divider style={{ marginLeft: 80 }} />
                        </>
                    );
                }}
            />
        </View>
    );
}

// --- Guest Chat Screen ---

export function GuestChatScreen({ route, navigation, authUserId }: { route: any; navigation: any; authUserId: string | null }) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const conversationId = route.params.conversationId;
    const title = route.params.title ?? 'Chat';

    const [messages, setMessages] = React.useState<any[]>([]);
    const [inputText, setInputText] = React.useState('');
    const [sending, setSending] = React.useState(false);
    const [userId, setUserId] = React.useState<string | null>(null);

    React.useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    }, []);

    React.useEffect(() => {
        if (!conversationId) return;

        // Initial load
        const load = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });
            if (data) setMessages(data);
        };
        load();

        // Subscribe
        const sub = supabase.channel(`chat:${conversationId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, (payload) => {
                setMessages((prev) => [...prev, payload.new]);
            })
            .subscribe();

        return () => { supabase.removeChannel(sub); };
    }, [conversationId]);

    const sendMessage = async () => {
        if (!inputText.trim() || !userId || sending) return;
        setSending(true);
        try {
            const { error } = await supabase.from('messages').insert({
                conversation_id: conversationId,
                sender_id: userId,
                content: inputText.trim(),
            });
            if (error) throw error;
            setInputText('');
        } catch (e) {
            // alert error
        } finally {
            setSending(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.background.get() }}>
            <SafeAreaView edges={['top']} style={{ backgroundColor: theme.background.get() }}>
                <XStack paddingHorizontal="$2" paddingVertical="$2" alignItems="center">
                    <Button variant="outline" chromeless onPress={() => navigation.goBack()} icon={<Icon name="arrow-left" size={24} color={theme.color.get()} />} size="$3" />
                    <Text variant="title" style={{ fontWeight: 'bold', marginLeft: 8 }}>{title}</Text>
                </XStack>
                <Divider />
            </SafeAreaView>

            <FlatList
                data={messages}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 24 }}
                renderItem={({ item }) => {
                    const isMe = item.sender_id === userId;
                    return (
                        <View style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                            <View
                                style={{
                                    paddingHorizontal: 16,
                                    paddingVertical: 10,
                                    borderRadius: 20,
                                    borderBottomRightRadius: isMe ? 4 : 20,
                                    borderBottomLeftRadius: isMe ? 20 : 4,
                                    backgroundColor: isMe ? theme.primary.get() : theme.gray3.get(),
                                }}
                            >
                                <Text variant="body" style={{ color: isMe ? 'white' : theme.color.get() }}>
                                    {item.content}
                                </Text>
                            </View>
                            <Text variant="label" style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', marginTop: 4, marginHorizontal: 4, opacity: 0.6 }}>
                                {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                    );
                }}
            />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
                <View style={{ padding: 8, paddingHorizontal: 16, paddingBottom: 8 + insets.bottom, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.background.get(), borderTopWidth: 1, borderTopColor: theme.borderColor.get() }}>
                    <Input
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Message..."
                        style={{ flex: 1, maxHeight: 100, borderRadius: 24 }}
                        multiline
                    />
                    <Button
                        variant="primary"
                        onPress={sendMessage}
                        disabled={!inputText.trim() || sending}
                        icon={<Icon name="send" size={20} color="white" />}
                        size="$3"
                        circular
                    />
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

// --- Guest Profile Screen ---

export function GuestProfileScreen({
    authUserId,
    profileName,
    onSignOut,
}: {
    authUserId: string | null;
    profileName: string;
    onSignOut: () => void;
}) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    const initials = profileName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

    const renderMenuItem = (title: string, icon: string, onPress: () => void) => (
        <>
            <TouchableOpacity onPress={onPress}>
                <XStack paddingHorizontal="$4" paddingVertical="$3" alignItems="center" justifyContent="space-between">
                    <XStack gap="$3" alignItems="center">
                        <Icon name={icon} size={24} color={theme.gray11.get()} />
                        <Text variant="body">{title}</Text>
                    </XStack>
                    <Icon name="chevron-right" size={24} color={theme.gray11.get()} />
                </XStack>
            </TouchableOpacity>
            <Divider />
        </>
    );

    return (
        <View style={{ flex: 1, backgroundColor: theme.background.get() }}>
            <SafeAreaView edges={['top']} style={{ backgroundColor: theme.background.get() }}>
                <XStack paddingHorizontal="$4" paddingVertical="$3" alignItems="center" justifyContent="space-between">
                    <Text variant="title" style={{ fontWeight: 'bold' }}>Profile</Text>
                    <TouchableOpacity onPress={() => { }}>
                        <Icon name="cog-outline" size={24} color={theme.color.get()} />
                    </TouchableOpacity>
                </XStack>
                <Divider />
            </SafeAreaView>

            <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
                <View style={{ padding: 24, alignItems: 'center', gap: 16 }}>
                    <View>
                        <Avatar size={80} label={initials} backgroundColor={theme.primary.get()} color="white" />
                        <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: theme.gray3.get(), borderRadius: 12, padding: 4 }}>
                            <Icon name="pencil" size={20} color={theme.color.get()} />
                        </View>
                    </View>

                    <View style={{ alignItems: 'center', gap: 4 }}>
                        <Text variant="header" style={{ fontWeight: 'bold', fontSize: 24, lineHeight: 32 }}>{profileName}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            {authUserId && (
                                <Chip icon="check-decagram" variant="filled">
                                    Verified Guest
                                </Chip>
                            )}
                            <Text variant="label" style={{ color: theme.gray11.get() }}>Member since 2024</Text>
                        </View>
                    </View>
                </View>

                <View style={{ paddingHorizontal: 16 }}>
                    <Text variant="label" style={{ color: theme.primary.get(), fontWeight: 'bold', marginBottom: 8, marginLeft: 16 }}>Account Settings</Text>
                    <Card variant="outlined" style={{ borderRadius: 16, overflow: 'hidden', padding: 0 }}>
                        {renderMenuItem("Personal Information", "account-circle-outline", () => { })}
                        {renderMenuItem("Payments & Payouts", "credit-card-outline", () => { })}
                        {renderMenuItem("Notifications", "bell-outline", () => { })}
                        {renderMenuItem("Privacy & Sharing", "shield-check-outline", () => { })}
                    </Card>

                    <View style={{ height: 24 }} />

                    <Text variant="label" style={{ color: theme.primary.get(), fontWeight: 'bold', marginBottom: 8, marginLeft: 16 }}>Support</Text>
                    <Card variant="outlined" style={{ borderRadius: 16, overflow: 'hidden', padding: 0 }}>
                        {renderMenuItem("Help Center", "help-circle-outline", () => { })}
                        {renderMenuItem("Give us Feedback", "message-alert-outline", () => { })}
                    </Card>

                    <View style={{ height: 32 }} />

                    <Button
                        variant="outline"
                        onPress={onSignOut}
                        style={{ borderColor: theme.red10.get(), marginHorizontal: 16 }}
                    >
                        <Text style={{ color: theme.red10.get() }}>Log Out</Text>
                    </Button>

                    <Text variant="label" style={{ color: theme.gray11.get(), textAlign: 'center', marginTop: 16, opacity: 0.6 }}>
                        Version 2.4.0 (Ag Refactor)
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
