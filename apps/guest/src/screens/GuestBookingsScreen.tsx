import * as React from 'react';
import { RefreshControl, ScrollView, View, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Text, useTheme, XStack, YStack, Divider } from '@weinn/ui';
import { supabase } from '@weinn/core';

export function GuestBookingsScreen() {
    const insets = useSafeAreaInsets();
    const theme = useTheme();

    const [loading, setLoading] = React.useState(false);
    const [cancellingId, setCancellingId] = React.useState<string | null>(null);
    const [status, setStatus] = React.useState<string>('');
    const [bookings, setBookings] = React.useState<
        Array<{
            id: string;
            reservation_code: string | null;
            status: string;
            created_at: string;
            property: { title: string | null } | null;
            room_type: { name: string | null } | null;
        }>
    >([]);

    const load = React.useCallback(async () => {
        try {
            setLoading(true);
            setStatus('');

            const { data, error } = await supabase
                .from('bookings')
                .select('id, reservation_code, status, created_at, properties(title), room_types(name)')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const rows = (data ?? []) as any[];
            setBookings(
                rows.map((b) => ({
                    id: b.id,
                    reservation_code: b.reservation_code ?? null,
                    status: b.status ?? 'confirmed',
                    created_at: b.created_at ?? '',
                    property: b.properties ?? null,
                    room_type: b.room_types ?? null,
                }))
            );
        } catch (e: any) {
            setBookings([]);
            setStatus(typeof e?.message === 'string' ? e.message : 'Failed to load bookings');
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        load();
    }, [load]);

    const cancelBooking = React.useCallback(
        async (bookingId: string) => {
            try {
                setCancellingId(bookingId);
                setStatus('');

                const { error } = await supabase.rpc('cancel_booking_as_guest', {
                    p_booking_id: bookingId,
                    p_reason: 'Cancelled by guest',
                });
                if (error) throw error;

                await load();
            } catch (e: any) {
                setStatus(typeof e?.message === 'string' ? e.message : 'Failed to cancel booking');
            } finally {
                setCancellingId(null);
            }
        },
        [load]
    );

    const [filter, setFilter] = React.useState<string>('upcoming');

    const filteredBookings = React.useMemo(() => {
        return bookings.filter(b => {
            const normalizedStatus = String(b.status ?? '').toLowerCase();
            if (filter === 'upcoming') return normalizedStatus === 'confirmed' || normalizedStatus === 'pending';
            if (filter === 'completed') return normalizedStatus === 'completed';
            if (filter === 'cancelled') return normalizedStatus === 'cancelled';
            return true;
        });
    }, [bookings, filter]);

    return (
        <View style={{ flex: 1, backgroundColor: theme.background.get() }}>
            <SafeAreaView edges={['top']} style={{ backgroundColor: theme.background.get() }}>
                <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
                    <Text variant="title" style={{ fontWeight: 'bold', color: theme.color.get() }}>My Trips</Text>
                </View>
                <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
                    <XStack gap="$2">
                        {['upcoming', 'completed', 'cancelled'].map((f) => (
                            <Button
                                key={f}
                                size="$3"
                                variant={filter === f ? 'primary' : 'outline'}
                                onPress={() => setFilter(f)}
                                flex={1}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </Button>
                        ))}
                    </XStack>
                </View>
            </SafeAreaView>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 24 + insets.bottom, gap: 16 }}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={load} colors={[theme.primary.get()]} />}
            >
                {status ? <Text style={{ color: theme.red10.get() }}>{status}</Text> : null}

                {loading && bookings.length === 0 ? (
                    <View style={{ padding: 32, alignItems: 'center' }}><Text>Loading trips...</Text></View>
                ) : filteredBookings.length > 0 ? (
                    filteredBookings.map((b) => {
                        const propertyTitle = b.property?.title ?? 'Property';
                        const roomTitle = b.room_type?.name ?? 'Room';
                        const code = b.reservation_code ?? '—';
                        const createdLabel = b.created_at ? new Date(b.created_at).toLocaleDateString() : '';
                        const normalizedStatus = String(b.status ?? '').toLowerCase();
                        const canCancel = normalizedStatus === 'confirmed' || normalizedStatus === 'pending';
                        const isCancelling = cancellingId === b.id;

                        let statusColor = theme.primary.get();
                        if (normalizedStatus === 'cancelled') statusColor = theme.red10.get();
                        if (normalizedStatus === 'completed') statusColor = theme.gray10.get();

                        return (
                            <Card key={b.id} variant="outlined" padding="$4">
                                <XStack height={100}>
                                    {/* Placeholder for Property Image */}
                                    <View style={{ width: 100, backgroundColor: theme.gray3.get(), alignItems: 'center', justifyContent: 'center', marginRight: 12, borderRadius: 8 }}>
                                        <Text fontSize={32}>🏠</Text>
                                    </View>
                                    <YStack flex={1} justifyContent="space-between" paddingVertical="$2">
                                        <YStack>
                                            <XStack justifyContent="space-between" alignItems="flex-start" gap="$2">
                                                <Text variant="body" fontWeight="bold" numberOfLines={1} flex={1}>{propertyTitle}</Text>
                                                <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, borderWidth: 1, borderColor: statusColor }}>
                                                    <Text style={{ color: statusColor, fontSize: 10, fontWeight: 'bold' }}>{b.status}</Text>
                                                </View>
                                            </XStack>
                                            <Text variant="label" style={{ color: theme.gray11.get(), marginTop: 4 }}>{roomTitle}</Text>
                                            <Text variant="label" style={{ color: theme.gray11.get(), marginTop: 4 }}>{createdLabel}</Text>
                                        </YStack>
                                    </YStack>
                                </XStack>

                                <Divider marginVertical="$3" />

                                <XStack justifyContent="space-between" alignItems="center">
                                    <YStack>
                                        <Text variant="label" style={{ color: theme.gray11.get() }}>Code</Text>
                                        <Text variant="body" style={{ fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontWeight: 'bold' }}>{code}</Text>
                                    </YStack>
                                    <XStack gap="$2">
                                        {canCancel ? (
                                            <Button
                                                variant="outline"
                                                size="$2"
                                                onPress={() => cancelBooking(b.id)}
                                                disabled={isCancelling}
                                                chromeless
                                                style={{ borderColor: theme.red10.get() }}
                                            >
                                                <Text style={{ color: theme.red10.get() }}>{isCancelling ? 'Cancelling...' : 'Cancel'}</Text>
                                            </Button>
                                        ) : null}
                                        <Button variant="outline" size="$2" onPress={() => { }}>Details</Button>
                                    </XStack>
                                </XStack>
                            </Card>
                        );
                    })
                ) : (
                    <View style={{ padding: 48, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: theme.gray3.get(), alignItems: 'center', justifyContent: 'center' }}>
                            <Text fontSize={40} style={{ opacity: 0.5 }}>✈️</Text>
                        </View>
                        <YStack alignItems="center" gap="$1">
                            <Text variant="title" style={{ fontWeight: 'bold', color: theme.color.get() }}>No trips found</Text>
                            <Text variant="body" style={{ color: theme.gray11.get(), textAlign: 'center' }}>
                                {filter === 'upcoming' ? "You don't have any upcoming trips." :
                                    filter === 'completed' ? "You haven't completed any trips yet." :
                                        "You don't have any cancelled trips."}
                            </Text>
                        </YStack>
                        {filter === 'upcoming' && (
                            <Button variant="primary" onPress={() => { /* Navigate to Home */ }}>
                                Start Exploring
                            </Button>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

