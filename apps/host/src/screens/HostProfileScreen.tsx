import React from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useTheme, Text, Card, Button, Chip, XStack, YStack, Avatar, Divider } from '@weinn/ui';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { HostPaymentsScreen } from './HostPaymentsScreen';

const ListItem = ({ title, description, leftIcon, rightIcon, onPress }: { title: string, description?: string, leftIcon?: string, rightIcon?: string, onPress: () => void }) => {
    const theme = useTheme();
    return (
        <Button variant="ghost" onPress={onPress} style={{ paddingVertical: 12, height: 'auto', justifyContent: 'flex-start' }}>
            <XStack alignItems="center" width="100%">
                {leftIcon && <Icon name={leftIcon} size={24} color={theme.color.get()} />}
                <YStack flex={1} marginLeft={leftIcon ? "$3" : "$0"}>
                    <Text variant="body" style={{ fontWeight: 'bold' }}>{title}</Text>
                    {description && <Text variant="label" style={{ color: theme.gray11.get() }}>{description}</Text>}
                </YStack>
                {rightIcon && <Icon name={rightIcon} size={24} color={theme.gray8.get()} />}
            </XStack>
        </Button>
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
                <View style={{ paddingHorizontal: 16, paddingTop: insets.top + 8, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.surface.get(), borderBottomWidth: 1, borderBottomColor: theme.borderColor.get() }}>
                    <Text variant="title" style={{ fontWeight: 'bold' }}>Pay commission</Text>
                    <Button variant="ghost" icon={<Icon name="close" size={24} color={theme.color.get()} />} onPress={closeCheckout} width={48} height={48} />
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
            <View style={{ paddingHorizontal: 16, paddingTop: insets.top + 8, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.surface.get(), borderBottomWidth: 1, borderBottomColor: theme.borderColor.get() }}>
                <Text variant="title" style={{ fontWeight: 'bold' }}>Profile</Text>
                <Button variant="ghost" icon={<Icon name="cog-outline" size={24} color={theme.color.get()} />} onPress={() => { }} width={48} height={48} />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
                <View style={{ padding: 24, alignItems: 'center', gap: 16 }}>
                    <View>
                        <Avatar size="$8" circular backgroundColor="$primaryContainer">
                            <Text variant="title" style={{ fontSize: 32, color: theme.onPrimaryContainer.get() }}>{initials}</Text>
                        </Avatar>
                        <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: theme.secondaryContainer.get(), borderRadius: 12, padding: 4 }}>
                            <Icon name="pencil" size={20} color={theme.onSecondaryContainer.get()} />
                        </View>
                    </View>

                    <View style={{ alignItems: 'center', gap: 4 }}>
                        <Text variant="title" style={{ fontWeight: 'bold', fontSize: 24 }}>{profileName}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Chip icon={<Icon name="check-decagram" size={16} color={theme.onTertiaryContainer.get()} />} style={{ backgroundColor: theme.tertiaryContainer.get() }}>
                                <Text style={{ color: theme.onTertiaryContainer.get(), fontSize: 12 }}>Verified Host</Text>
                            </Chip>
                            <Text variant="body" style={{ color: theme.gray11.get() }}>Joined 2024</Text>
                        </View>
                    </View>
                </View>

                <View style={{ paddingHorizontal: 16 }}>
                    <Text variant="label" style={{ color: theme.primary.get(), fontWeight: 'bold', marginBottom: 8, marginLeft: 16 }}>Account Settings</Text>
                    <Card variant="filled" style={{ borderRadius: 16, overflow: 'hidden', backgroundColor: theme.surface.get(), padding: 0 }}>
                        <ListItem
                            title="Personal Information"
                            leftIcon="account-circle-outline"
                            rightIcon="chevron-right"
                            onPress={() => { }}
                        />
                        <Divider />
                        <ListItem
                            title="Payments & Commission"
                            description="Manage monthly dues"
                            leftIcon="credit-card-outline"
                            rightIcon="chevron-right"
                            onPress={() => setShowPayments(true)}
                        />
                        <Divider />
                        <ListItem
                            title="Notifications"
                            leftIcon="bell-outline"
                            rightIcon="chevron-right"
                            onPress={() => { }}
                        />
                    </Card>

                    <View style={{ height: 24 }} />

                    <Text variant="label" style={{ color: theme.primary.get(), fontWeight: 'bold', marginBottom: 8, marginLeft: 16 }}>Support</Text>
                    <Card variant="filled" style={{ borderRadius: 16, overflow: 'hidden', backgroundColor: theme.surface.get(), padding: 0 }}>
                        <ListItem
                            title="Host Help Center"
                            leftIcon="help-circle-outline"
                            rightIcon="chevron-right"
                            onPress={() => { }}
                        />
                        <Divider />
                        <ListItem
                            title="Give us Feedback"
                            leftIcon="message-alert-outline"
                            rightIcon="chevron-right"
                            onPress={() => { }}
                        />
                    </Card>

                    <View style={{ height: 32 }} />

                    <Button
                        variant="outline"
                        onPress={onSignOut}
                        style={{ borderColor: theme.error.get(), marginHorizontal: 16, height: 48 }}
                        icon={<Icon name="logout" size={20} color={theme.error.get()} />}
                    >
                        <Text style={{ color: theme.error.get(), fontWeight: 'bold' }}>Sign Out</Text>
                    </Button>

                    <Text variant="label" style={{ color: theme.gray11.get(), textAlign: 'center', marginTop: 16, opacity: 0.6 }}>
                        Version 2.4.0 (Host)
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
