import React from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Text, Card, Button, Input } from '@weinn/ui';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useChat, Message } from '@weinn/core';

export function ChatBubble({ isMe, message }: { isMe: boolean; message: Message }) {
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
                    backgroundColor: isMe ? theme.primary?.get() : theme.secondaryContainer?.get(),
                }}
            >
                {message.content.type === 'text' && (
                    <Text variant="body" style={{ color: isMe ? theme.onPrimary?.get() : theme.onSecondaryContainer?.get() }}>
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

export function ChatScreen({ authUserId, route, navigation }: { authUserId: string | null; route: any; navigation: any }) {
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
