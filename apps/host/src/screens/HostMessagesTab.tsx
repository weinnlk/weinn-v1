import React from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme, Text, Card, Button, Input, XStack, YStack, Avatar, IconButton } from '@weinn/ui';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useInbox, useChat, supabase } from '@weinn/core';
import { Conversation, Message } from '@weinn/core';

const MessagesStack = createNativeStackNavigator();

// --- Components ---

function ChatBubble({ isMe, message }: { isMe: boolean; message: Message }) {
    const theme = useTheme();
    const time = new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <View style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%', marginBottom: 12 }}>
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
                {message.content.type === 'text' && (
                    <Text variant="body" style={{ color: isMe ? theme.onPrimary.get() : theme.onSecondaryContainer.get() }}>
                        {message.content.text}
                    </Text>
                )}
                {/* Future: Handle image/system messages */}
            </Card>
            <Text variant="label" style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', marginTop: 4, marginHorizontal: 4, opacity: 0.6, fontSize: 10 }}>
                {time}
            </Text>
        </View>
    );
}

// --- Screens ---

function InboxScreen({ authUserId, navigation }: { authUserId: string | null; navigation: any }) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const { conversations, loading, refresh } = useInbox(authUserId);

    if (!authUserId) {
        return (
            <View style={{ flex: 1, backgroundColor: theme.background.get(), alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                <Avatar size="$6" circular backgroundColor="$surfaceVariant" marginBottom="$4">
                    <Icon name="message-lock-outline" size={40} color={theme.onSurfaceVariant.get()} />
                </Avatar>
                <Text variant="title" style={{ fontWeight: 'bold' }}>Messages</Text>
                <Text variant="body" style={{ color: theme.onSurfaceVariant.get(), textAlign: 'center', marginTop: 8 }}>
                    Sign in to start messaging with your guests.
                </Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: theme.background.get() }}>
            {/* Header */}
            <View style={{
                paddingHorizontal: 16,
                paddingTop: insets.top + 16,
                paddingBottom: 16,
                backgroundColor: theme.background.get(),
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: theme.borderColor.get()
            }}>
                <Text variant="title" style={{ fontSize: 28, fontWeight: 'bold' }}>Inbox</Text>
            </View>

            <FlatList
                data={conversations}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
                refreshing={loading}
                onRefresh={refresh}
                ListEmptyComponent={
                    !loading ? (
                        <View style={{ padding: 48, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                            <Avatar size="$8" circular backgroundColor="$surfaceVariant">
                                <Icon name="message-outline" size={40} color={theme.onSurfaceVariant.get()} />
                            </Avatar>
                            <Text variant="title" style={{ color: theme.onSurfaceVariant.get() }}>No messages yet</Text>
                            <Text variant="body" style={{ color: theme.onSurfaceVariant.get(), textAlign: 'center', maxWidth: 250 }}>
                                Messages from your guests will appear here.
                            </Text>
                        </View>
                    ) : null
                }
                renderItem={({ item }) => {
                    const lastMsg = item?.last_message?.content;
                    const previewText = lastMsg?.type === 'text' ? lastMsg.text : (lastMsg?.type === 'image' ? '📷 Image' : 'Start a conversation');
                    const time = item.last_message_at ? new Date(item.last_message_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
                    const isUnread = item.is_unread;

                    return (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Chat', { conversationId: item.id, otherUserId: item.other_user_id })}
                            activeOpacity={0.7}
                            style={{ flexDirection: 'row', padding: 16, alignItems: 'center', backgroundColor: isUnread ? theme.surfaceVariant.get() : 'transparent' }}
                        >
                            <Avatar size="$5" circular backgroundColor={isUnread ? "$primary" : "$surfaceVariant"}>
                                <Text color={isUnread ? "$onPrimary" : "$onSurfaceVariant"}>
                                    {(item.other_user_email?.[0] || 'G').toUpperCase()}
                                </Text>
                            </Avatar>

                            <YStack marginLeft="$3" flex={1}>
                                <XStack justifyContent="space-between" alignItems="center">
                                    <Text variant="body" fontWeight="bold">
                                        {item.other_user_email?.split('@')[0] || 'Guest'}
                                    </Text>
                                    <Text variant="label" color="$onSurfaceVariant" style={{ fontSize: 12 }}>{time}</Text>
                                </XStack>
                                <XStack alignItems="center" marginTop={2}>
                                    <Text
                                        variant="body"
                                        numberOfLines={1}
                                        style={{
                                            flex: 1,
                                            color: isUnread ? theme.onSurface.get() : theme.onSurfaceVariant.get(),
                                            fontWeight: isUnread ? '600' : '400'
                                        }}
                                    >
                                        {previewText}
                                    </Text>
                                    {isUnread && (
                                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.primary.get(), marginLeft: 8 }} />
                                    )}
                                </XStack>
                            </YStack>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
}

function ChatScreen({ authUserId, route, navigation }: { authUserId: string | null; route: any; navigation: any }) {
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const { conversationId } = route.params;

    const { messages, loading, sendMessage } = useChat(conversationId, authUserId);
    const [text, setText] = React.useState('');
    const listRef = React.useRef<FlatList>(null);

    const handleSend = () => {
        if (!text.trim()) return;
        sendMessage({ type: 'text', text: text.trim() });
        setText('');
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.background.get() }}>
            {/* Header */}
            <View style={{
                paddingHorizontal: 8,
                paddingTop: insets.top + 8,
                paddingBottom: 8,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.surface.get(),
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: theme.borderColor.get()
            }}>
                <Button variant="ghost" icon={<Icon name="arrow-left" size={24} color={theme.color.get()} />} onPress={() => navigation.goBack()} width={48} height={48} />
                <Text variant="title" style={{ fontWeight: 'bold', marginLeft: 8 }}>Chat</Text>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <FlatList
                    ref={listRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <ChatBubble isMe={item.sender_id === authUserId} message={item} />}
                    contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
                    onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
                    onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
                />

                <View style={{
                    padding: 8,
                    paddingBottom: Math.max(insets.bottom, 8),
                    backgroundColor: theme.surface.get(),
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: theme.borderColor.get(),
                    flexDirection: 'row',
                    alignItems: 'flex-end'
                }}>
                    <Input
                        placeholder="Type a message..."
                        value={text}
                        onChangeText={setText}
                        style={{ flex: 1, maxHeight: 100, borderRadius: 20, backgroundColor: theme.surfaceVariant.get(), borderWidth: 0 }}
                        multiline
                    />
                    <Button
                        variant="ghost"
                        circular
                        icon={<Icon name="send" size={24} color={text.trim() ? theme.primary.get() : theme.onSurfaceVariant.get()} />}
                        onPress={handleSend}
                        disabled={!text.trim()}
                        style={{ marginLeft: 8, marginBottom: 4 }}
                    />
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

export function HostMessagesTab({ authUserId }: { authUserId: string | null }) {
    return (
        <MessagesStack.Navigator screenOptions={{ headerShown: false }}>
            <MessagesStack.Screen name="Inbox">
                {(props) => <InboxScreen {...props} authUserId={authUserId} />}
            </MessagesStack.Screen>
            <MessagesStack.Screen name="Chat">
                {(props) => <ChatScreen {...props} authUserId={authUserId} />}
            </MessagesStack.Screen>
        </MessagesStack.Navigator>
    );
}
