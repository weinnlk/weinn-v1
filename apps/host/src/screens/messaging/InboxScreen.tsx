import React from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Text, Avatar, YStack, XStack } from '@weinn/ui';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useInbox } from '@weinn/core';

export function InboxScreen({ authUserId, navigation }: { authUserId: string | null; navigation: any }) {
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
