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

const BookingItem = React.memo(({ item, theme }: { item: DashboardBooking, theme: any }) => (
    <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <Card variant="outlined" style={{ borderRadius: 12, backgroundColor: theme.background.get(), padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: theme.outlineVariant.get() }}>
            <Avatar
                size="$4"
                circular
                fallback={<Text style={{ color: theme.color.get(), fontWeight: '600' }}>{item.guestName.charAt(0)}</Text>}
            />
            <YStack flex={1}>
                <Text variant="body" fontWeight="700" fontSize={16}>{item.guestName}</Text>
                <Text variant="label" color="$gray11" fontSize={13} marginTop={2}>{item.propertyName}</Text>
                <XStack alignItems="center" marginTop={4} gap="$2">
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.action === 'check-in' ? theme.success.get() : theme.warning.get() }} />
                    <Text variant="label" color={item.action === 'check-in' ? '$success' : '$warning'} fontWeight="600" fontSize={12}>
                        {item.action === 'check-in' ? 'Check-in' : 'Check-out'} at {item.time}
                    </Text>
                </XStack>
            </YStack>
            <Button variant="secondary" size="$3" iconAfter={<Icon name="chevron-right" size={20} />} chromeless />
        </Card>
    </View>
));

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

    const renderItem = React.useCallback(({ item }: { item: DashboardBooking }) => (
        <BookingItem item={item} theme={theme} />
    ), [theme]);

    return (
        <View style={{ flex: 1, backgroundColor: theme.background.get() }}>
            <View style={{ paddingHorizontal: 16, paddingTop: insets.top + 16, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.background.get() }}>
                <Text variant="header" style={{ fontSize: 32, fontWeight: '800', letterSpacing: -1 }}>Dashboard</Text>
                <Avatar
                    circular
                    size="$4"
                    src="https://i.pravatar.cc/150?img=68"
                    onPress={() => navigation.navigate('Profile')}
                />
            </View>

            <FlatList
                data={displayedBookings}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}
                ListHeaderComponent={
                    <YStack gap="$4" paddingBottom="$4">
                        {/* Welcome Header */}
                        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
                            <Text variant="body" style={{ color: theme.gray11.get(), fontWeight: '500', textTransform: 'uppercase', fontSize: 12 }}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
                            <Text variant="header" style={{ fontWeight: '800', fontSize: 28, marginTop: 4 }}>Good morning, Host</Text>
                        </View>

                        {/* Stats Overview */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
                            <Card variant="outlined" style={{ padding: 16, borderRadius: 12, width: 150, backgroundColor: theme.background.get(), borderWidth: 1, borderColor: theme.outline.get() }}>
                                <Text variant="label" style={{ color: theme.gray11.get(), marginBottom: 4 }}>Earnings</Text>
                                <Text variant="header" style={{ fontWeight: '800', fontSize: 24 }}>${stats.earnings}</Text>
                            </Card>
                            <Card variant="outlined" style={{ padding: 16, borderRadius: 12, width: 140, backgroundColor: theme.background.get(), borderWidth: 1, borderColor: theme.outline.get() }}>
                                <Text variant="label" style={{ color: theme.gray11.get(), marginBottom: 4 }}>Occupancy</Text>
                                <Text variant="header" style={{ fontWeight: '800', fontSize: 24 }}>{stats.occupancy}%</Text>
                            </Card>
                            <Card variant="outlined" style={{ padding: 16, borderRadius: 12, width: 140, backgroundColor: theme.background.get(), borderWidth: 1, borderColor: theme.outline.get() }}>
                                <Text variant="label" style={{ color: theme.gray11.get(), marginBottom: 4 }}>Rating</Text>
                                <Text variant="header" style={{ fontWeight: '800', fontSize: 24 }}>{stats.rating} ★</Text>
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
                renderItem={renderItem}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', padding: 32 }}>
                        <Text variant="body" style={{ color: theme.gray11.get() }}>No {filter} today.</Text>
                    </View>
                }
                ListFooterComponent={
                    <View style={{ paddingHorizontal: 16, marginTop: 16, gap: 16 }}>
                        <Text variant="title" style={{ fontWeight: '800' }}>Quick Actions</Text>
                        <XStack gap="$3">
                            <Card variant="outlined" onPress={() => navigation.navigate('Listings', { screen: 'WizardV3_Intro' })} style={{ flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', gap: 12, borderColor: theme.outline.get() }}>
                                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.gray5.get(), alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon name="plus" size={24} color={theme.color.get()} />
                                </View>
                                <Text variant="label" style={{ fontWeight: '700', textAlign: 'center' }}>Create Listing</Text>
                            </Card>
                            <Card variant="outlined" onPress={() => navigation.navigate('Bookings')} style={{ flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', gap: 12, borderColor: theme.outline.get() }}>
                                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.gray5.get(), alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon name="calendar" size={24} color={theme.color.get()} />
                                </View>
                                <Text variant="label" style={{ fontWeight: '700', textAlign: 'center' }}>Calendar</Text>
                            </Card>
                        </XStack>
                    </View>
                }
            />

            <Button
                variant="primary"
                icon={<Icon name="plus" size={28} color="white" />}
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


