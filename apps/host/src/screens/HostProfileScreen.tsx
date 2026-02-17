import React from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useTheme, Text, Card, Button, Chip, XStack, YStack, Avatar, Divider, IconButton } from '@weinn/ui';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { HostPaymentsScreen } from './HostPaymentsScreen';

const ListItem = ({ title, description, leftIcon, rightIcon, onPress, isLast }: { title: string, description?: string, leftIcon?: string, rightIcon?: string, onPress: () => void, isLast?: boolean }) => {
    const theme = useTheme();
    return (
        <View>
            <Button variant="ghost" onPress={onPress} style={{ paddingVertical: 16, height: 'auto', justifyContent: 'flex-start', borderRadius: 0 }}>
                <XStack alignItems="center" width="100%" gap="$3">
                    {leftIcon && <Icon name={leftIcon} size={24} color={theme.color.get()} />}
                    <YStack flex={1}>
                        <Text variant="body" style={{ fontWeight: '600', fontSize: 16 }}>{title}</Text>
                        {description && <Text variant="label" style={{ color: theme.gray11.get(), marginTop: 2 }}>{description}</Text>}
                    </YStack>
                    {rightIcon && <Icon name={rightIcon} size={20} color={theme.gray8.get()} />}
                </XStack>
            </Button>
            {!isLast && <Divider marginVertical={0} />}
        </View>
    )
}

export function HostProfileScreen({ profileName, onSignOut }: { profileName: string; onSignOut: () => void }) {
    const insets = useSafeAreaInsets();
    const theme = useTheme();

    const [showPayments, setShowPayments] = React.useState(false);
    const [payhereUrl, setPayhereUrl] = React.useState<string | null>(null);
    const [payhereHtml, setPayhereHtml] = React.useState<string | null>(null);
    const [paymentsRefreshToken, setPaymentsRefreshToken] = React.useState(0);

    if (payhereUrl || payhereHtml) {
        const closeCheckout = () => {
            setPayhereUrl(null);
            setPayhereHtml(null);
            setPaymentsRefreshToken((x) => x + 1);
        };

        return (
            <View style={{ flex: 1, backgroundColor: theme.background.get() }}>
                <View style={{ paddingHorizontal: 16, paddingTop: insets.top + 8, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.background.get(), borderBottomWidth: 1, borderBottomColor: theme.borderColor.get() }}>
                    <Text variant="title" style={{ fontWeight: 'bold' }}>Pay commission</Text>
                    <IconButton icon="close" onPress={closeCheckout} />
                </View>
                <View style={{ flex: 1 }}>
                    <WebView
                        originWhitelist={['*']}
                        source={payhereHtml ? { html: payhereHtml } : { uri: payhereUrl ?? 'about:blank' }}
                        startInLoadingState
                        onMessage={(evt) => {
                            const msg = String((evt as any)?.nativeEvent?.data ?? '');
                            if (msg === 'payhere:return' || msg === 'payhere:cancel') {
                                closeCheckout();
                            }
                        }}
                        onNavigationStateChange={(nav) => {
                            const url = typeof nav?.url === 'string' ? nav.url : '';
                            if (!url) return;
                            if (url.includes('/payhere/return') || url.includes('/payhere/cancel')) {
                                closeCheckout();
                            }
                        }}
                    />
                </View>
            </View>
        );
    }

    if (showPayments) {
        return (
            <HostPaymentsScreen
                onBack={() => setShowPayments(false)}
                onOpenPayHere={(html) => {
                    setPayhereHtml(html);
                }}
                refreshToken={paymentsRefreshToken}
            />
        );
    }

    // Main Profile Screen
    const initials = profileName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

    return (
        <View style={{ flex: 1, backgroundColor: theme.background.get() }}>
            <View style={{ paddingHorizontal: 16, paddingTop: insets.top + 16, paddingBottom: 16, backgroundColor: theme.background.get() }}>
                <Text variant="header" style={{ fontSize: 32, fontWeight: '800', letterSpacing: -1 }}>Profile</Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
                <View style={{ padding: 24, alignItems: 'center', gap: 16 }}>
                    <View>
                        <Avatar size="$8" circular fallback={<Text variant="header" fontSize={32}>{initials}</Text>} />
                        <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: theme.background.get(), borderRadius: 20, padding: 2 }}>
                            <View style={{ backgroundColor: 'black', borderRadius: 18, padding: 6 }}>
                                <Icon name="pencil" size={16} color="white" />
                            </View>
                        </View>
                    </View>

                    <View style={{ alignItems: 'center', gap: 4 }}>
                        <Text variant="header" style={{ fontWeight: '800', fontSize: 24 }}>{profileName}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <XStack backgroundColor="black" paddingHorizontal="$2" paddingVertical="$1" borderRadius="$4" alignItems="center" gap="$1">
                                <Icon name="check-decagram" size={14} color="white" />
                                <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>Verified Host</Text>
                            </XStack>
                            <Text variant="body" style={{ color: theme.gray11.get() }}>Joined 2024</Text>
                        </View>
                    </View>
                </View>

                <View style={{ paddingHorizontal: 16, gap: 24 }}>
                    <YStack gap="$2">
                        <Text variant="label" style={{ color: theme.gray11.get(), fontWeight: '700', marginLeft: 4, textTransform: 'uppercase', fontSize: 12 }}>Account</Text>
                        <Card variant="outlined" style={{ borderRadius: 16, overflow: 'hidden', backgroundColor: theme.background.get(), padding: 0, borderColor: theme.outlineVariant.get() }}>
                            <ListItem
                                title="Personal Information"
                                leftIcon="account-circle-outline"
                                rightIcon="chevron-right"
                                onPress={() => { }}
                            />
                            <ListItem
                                title="Payments & Commission"
                                description="Manage monthly dues"
                                leftIcon="credit-card-outline"
                                rightIcon="chevron-right"
                                onPress={() => setShowPayments(true)}
                            />
                            <ListItem
                                title="Notifications"
                                leftIcon="bell-outline"
                                rightIcon="chevron-right"
                                onPress={() => { }}
                                isLast
                            />
                        </Card>
                    </YStack>

                    <YStack gap="$2">
                        <Text variant="label" style={{ color: theme.gray11.get(), fontWeight: '700', marginLeft: 4, textTransform: 'uppercase', fontSize: 12 }}>Support</Text>
                        <Card variant="outlined" style={{ borderRadius: 16, overflow: 'hidden', backgroundColor: theme.background.get(), padding: 0, borderColor: theme.outlineVariant.get() }}>
                            <ListItem
                                title="Host Help Center"
                                leftIcon="help-circle-outline"
                                rightIcon="chevron-right"
                                onPress={() => { }}
                            />
                            <ListItem
                                title="Give us Feedback"
                                leftIcon="message-alert-outline"
                                rightIcon="chevron-right"
                                onPress={() => { }}
                                isLast
                            />
                        </Card>
                    </YStack>

                    <Button
                        variant="outline"
                        onPress={onSignOut}
                        style={{ borderColor: theme.error.get(), height: 48, borderRadius: 12 }}
                        icon={<Icon name="logout" size={20} color={theme.error.get()} />}
                    >
                        <Text style={{ color: theme.error.get(), fontWeight: 'bold' }}>Sign Out</Text>
                    </Button>

                    <Text variant="label" style={{ color: theme.gray11.get(), textAlign: 'center', opacity: 0.6 }}>
                        Version 2.4.0 (Host)
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
