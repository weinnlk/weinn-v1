import React from 'react';
import { View, Image, Pressable, FlatList, StyleSheet, Animated, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Card, Button, useTheme, XStack, YStack, Avatar, IconButton } from '@weinn/ui';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Markdown from 'react-native-markdown-display';
import { supabase } from '@weinn/core';

// Types
type HomeContentApp = 'guest' | 'host';
type HomeContentPlacement = 'home_top_carousel' | 'home_mid';
type HomeContentType = 'promo_card' | 'article_card';
type HomeContentAction =
    | { type: 'navigate_tab'; tab: 'Today' | 'Bookings' | 'Listings' | 'Messages' | 'Profile' }
    | { type: 'open_article_modal' };

type HomeContentItem = {
    id: string;
    app: HomeContentApp;
    placement: HomeContentPlacement;
    type: HomeContentType;
    title: string | null;
    subtitle: string | null;
    image_url: string | null;
    payload: any;
    priority: number;
};

function getCta(item: HomeContentItem): { label: string; action: HomeContentAction } | null {
    const cta = item?.payload?.cta;
    if (!cta) return null;

    const label = typeof cta?.label === 'string' ? cta.label : '';
    const action = cta?.action;

    if (!label || !action || typeof action !== 'object') return null;

    if (action.type === 'navigate_tab' && typeof action.tab === 'string') {
        const tab = action.tab as any;
        if (tab === 'Today' || tab === 'Bookings' || tab === 'Listings' || tab === 'Messages' || tab === 'Profile') {
            return { label, action: { type: 'navigate_tab', tab } };
        }
    }

    if (action.type === 'open_article_modal') {
        return { label, action: { type: 'open_article_modal' } };
    }

    return null;
}

// Types
type BookingAction = 'check-in' | 'check-out' | 'none';

type DashboardBooking = {
    id: string;
    guestName: string;
    propertyName: string;
    time: string; // e.g., "3:00 PM"
    status: string;
    action: BookingAction;
};

export function HostTodayScreen({ navigation }: { navigation: any }) {
    const insets = useSafeAreaInsets();
    const theme = useTheme();

    const [loading, setLoading] = React.useState(false);
    const [todaysBookings, setTodaysBookings] = React.useState<DashboardBooking[]>([]);
    const [stats, setStats] = React.useState({ earnings: 1240, occupancy: 85, rating: 4.9 }); // Dummy stats for now
    const [filter, setFilter] = React.useState<'check-ins' | 'check-outs'>('check-ins');

    const load = React.useCallback(async () => {
        try {
            setLoading(true);
            const today = new Date().toISOString().split('T')[0];

            // In a real app, we'd query simpler, or use a specific RPC
            // For now, let's fetch recent bookings and mock "today" logic or checking status
            const { data, error } = await supabase
                .from('bookings')
                .select('id, first_name, last_name, status, check_in_date, check_out_date, properties(title)')
                .order('check_in_date', { ascending: false })
                .limit(20);

            if (error) throw error;

            const rows = (data ?? []) as any[];

            // Mocking "Happening Today" logic for demo purposes since we might not have actual bookings today
            // We will map checking/checkout bookings to our DashboardBooking type
            const mapped: DashboardBooking[] = rows.map((b, i) => {
                // Logic to simulate today for demo if dates don't match, or use real dates
                // For MVP redesign visuals, we'll format them nicely.
                const isCheckIn = i % 2 === 0; // Fake alternation for demo if dates aren't today

                return {
                    id: b.id,
                    guestName: `${b.first_name} ${b.last_name}`,
                    propertyName: b.properties?.title ?? 'Property',
                    time: isCheckIn ? '3:00 PM' : '11:00 AM',
                    status: b.status,
                    action: isCheckIn ? 'check-in' : 'check-out'
                };
            });

            setTodaysBookings(mapped);

        } catch (e) {
            // handle error
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        load();
    }, [load]);

    const displayedBookings = todaysBookings.filter(b =>
        filter === 'check-ins' ? b.action === 'check-in' : b.action === 'check-out'
    );

    return (
        <View style={{ flex: 1, backgroundColor: theme.background.get() }}>
            <View style={{ paddingHorizontal: 16, paddingTop: insets.top + 8, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.background.get() }}>
                <Button variant="ghost" icon={<Icon name="menu" size={24} color={theme.color.get()} />} onPress={() => { }} width={48} height={48} />
                <Text variant="title" style={{ fontWeight: 'bold' }}>Dashboard</Text>
                <Button variant="ghost" icon={<Icon name="account-circle-outline" size={24} color={theme.color.get()} />} onPress={() => navigation.navigate('Profile')} width={48} height={48} />
            </View>

            <FlatList
                data={displayedBookings}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}
                ListHeaderComponent={
                    <YStack gap="$4" paddingBottom="$4">
                        {/* Welcome Header */}
                        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
                            <Text variant="header" style={{ fontWeight: 'bold', color: theme.color.get() }}>Good morning, Host</Text>
                            <Text variant="body" style={{ color: theme.gray11.get() }}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
                        </View>

                        {/* Stats Overview */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
                            <Card variant="filled" style={{ padding: 16, borderRadius: 16, width: 140, backgroundColor: theme.primaryContainer.get() }} elevation={1}>
                                <Text variant="label" style={{ color: theme.onPrimaryContainer.get() }}>Earnings</Text>
                                <Text variant="title" style={{ fontWeight: 'bold', color: theme.onPrimaryContainer.get() }}>${stats.earnings}</Text>
                            </Card>
                            <Card variant="filled" style={{ padding: 16, borderRadius: 16, width: 140, backgroundColor: theme.background.get() }} elevation={1}>
                                <Text variant="label" style={{ color: theme.gray11.get() }}>Occupancy</Text>
                                <Text variant="title" style={{ fontWeight: 'bold' }}>{stats.occupancy}%</Text>
                            </Card>
                            <Card variant="filled" style={{ padding: 16, borderRadius: 16, width: 140, backgroundColor: theme.background.get() }} elevation={1}>
                                <Text variant="label" style={{ color: theme.gray11.get() }}>Rating</Text>
                                <Text variant="title" style={{ fontWeight: 'bold' }}>{stats.rating} ★</Text>
                            </Card>
                        </ScrollView>

                        {/* Happening Today */}
                        <View style={{ paddingHorizontal: 16, gap: 12 }}>
                            <Text variant="title" style={{ fontWeight: 'bold' }}>Happening Today</Text>
                            {/* Custom Segmented Control */}
                            <XStack backgroundColor="$gray3" borderRadius="$4" padding="$1">
                                <Button
                                    flex={1}
                                    variant={filter === 'check-ins' ? 'secondary' : 'ghost'}
                                    onPress={() => setFilter('check-ins')}
                                    size="$3"
                                    icon={<Icon name="login" size={18} color={filter === 'check-ins' ? theme.onSecondary.get() : theme.gray11.get()} />}
                                >
                                    Check-ins
                                </Button>
                                <Button
                                    flex={1}
                                    variant={filter === 'check-outs' ? 'secondary' : 'ghost'}
                                    onPress={() => setFilter('check-outs')}
                                    size="$3"
                                    icon={<Icon name="logout" size={18} color={filter === 'check-outs' ? theme.onSecondary.get() : theme.gray11.get()} />}
                                >
                                    Check-outs
                                </Button>
                            </XStack>
                        </View>
                    </YStack>
                }
                renderItem={({ item }) => (
                    <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
                        <Card variant="filled" style={{ borderRadius: 12, backgroundColor: theme.surfaceVariant.get(), padding: 12 }}>
                            <XStack alignItems="center" gap="$3">
                                <Avatar size={40} backgroundColor={theme.secondaryContainer.get()}>
                                    <Icon name="account" size={24} color={theme.onSecondaryContainer.get()} />
                                </Avatar>
                                <YStack flex={1}>
                                    <Text variant="body" fontWeight="bold">{item.guestName}</Text>
                                    <Text variant="label" color="$gray11">{item.propertyName} • {item.time}</Text>
                                </YStack>
                                <IconButton icon="message-outline" size={20} color={theme.primary.get()} onPress={() => navigation.navigate('Messages')} />
                            </XStack>
                        </Card>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', padding: 32 }}>
                        <Text variant="body" style={{ color: theme.gray11.get() }}>No {filter} today.</Text>
                    </View>
                }
                ListFooterComponent={
                    <View style={{ paddingHorizontal: 16, marginTop: 16, gap: 16 }}>
                        <Text variant="title" style={{ fontWeight: 'bold' }}>Quick Actions</Text>
                        <XStack gap="$3">
                            <Card variant="elevated" onPress={() => navigation.navigate('Listings', { screen: 'WizardV3_Intro' })} style={{ flex: 1, padding: 16, borderRadius: 16, alignItems: 'center', gap: 8 }}>
                                <Avatar size={48} backgroundColor={theme.primaryContainer.get()}>
                                    <Icon name="plus" size={24} color={theme.onPrimaryContainer.get()} />
                                </Avatar>
                                <Text variant="label" style={{ fontWeight: 'bold', textAlign: 'center' }}>Create Listing</Text>
                            </Card>
                            <Card variant="elevated" onPress={() => navigation.navigate('Bookings')} style={{ flex: 1, padding: 16, borderRadius: 16, alignItems: 'center', gap: 8 }}>
                                <Avatar size={48} backgroundColor={theme.secondaryContainer.get()}>
                                    <Icon name="calendar" size={24} color={theme.onSecondaryContainer.get()} />
                                </Avatar>
                                <Text variant="label" style={{ fontWeight: 'bold', textAlign: 'center' }}>Calendar</Text>
                            </Card>
                        </XStack>
                    </View>
                }
            />

            <Button
                variant="primary"
                icon={<Icon name="plus" size={24} color="white" />}
                circular
                size="$5"
                position="absolute"
                right={16}
                bottom={16}
                onPress={() => navigation.navigate('Listings', { screen: 'WizardV3_Intro' })}
            />
        </View>
    );
}

export function ContentModalScreen({ route, navigation }: { route: any; navigation: any }) {
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const item = (route?.params?.item ?? null) as HomeContentItem | null;
    const cta = item ? getCta(item) : null;

    if (!item) return null;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background.get() }} edges={['top']}>
            <Pressable
                onPress={() => navigation.goBack()}
                hitSlop={12}
                style={{
                    position: 'absolute',
                    right: 12,
                    zIndex: 10,
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: 'rgba(17, 24, 39, 0.55)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    top: insets.top + 8,
                }}
            >
                <Text
                    style={{
                        color: '#fff',
                        fontSize: 22,
                        lineHeight: 22,
                        fontWeight: '700',
                        marginTop: -2,
                    }}
                >
                    ×
                </Text>
            </Pressable>
            <Animated.ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}>
                {item.image_url ? (
                    <Image source={{ uri: item.image_url }} style={{ width: '100%', height: 220, resizeMode: 'cover' }} />
                ) : null}

                <View style={{ paddingHorizontal: 16, paddingTop: 16, gap: 12 }}>
                    <View style={{ gap: 6 }}>
                        <Text variant="header" style={{ fontWeight: '800' }}>
                            {item.title ?? ''}
                        </Text>
                        {item.subtitle ? (
                            <Text variant="body" style={{ color: theme.gray11.get() }}>
                                {item.subtitle}
                            </Text>
                        ) : null}
                    </View>

                    <Markdown
                        style={{
                            body: { color: theme.color.get() },
                            heading1: { color: theme.color.get() },
                            heading2: { color: theme.color.get() },
                            paragraph: { color: theme.color.get() },
                        }}
                    >
                        {typeof item?.payload?.body_markdown === 'string' ? item.payload.body_markdown : ''}
                    </Markdown>

                    {cta ? (
                        <Button
                            variant="primary"
                            onPress={() => {
                                if (cta.action.type === 'navigate_tab') {
                                    navigation.navigate('Tabs', { screen: cta.action.tab });
                                    return;
                                }
                            }}
                            marginTop="$2"
                        >
                            {cta.label}
                        </Button>
                    ) : null}
                </View>
            </Animated.ScrollView>
        </SafeAreaView>
    );
}
