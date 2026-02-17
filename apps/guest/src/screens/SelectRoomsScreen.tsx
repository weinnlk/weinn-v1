import * as React from 'react';
import { FlatList, Image, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Text, useTheme, XStack, YStack } from '@weinn/ui';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '@weinn/core';

export function SelectRoomsScreen({ route, navigation }: { route: any; navigation: any }) {
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const propertyId = (route?.params?.propertyId ?? null) as string | null;
    const title = (route?.params?.title ?? 'Choose your stay') as string;

    const ctaHeight = 80;

    const [loading, setLoading] = React.useState(false);
    const [roomTypes, setRoomTypes] = React.useState<any[]>([]);
    const [selectedRoomTypeId, setSelectedRoomTypeId] = React.useState<string | null>(null);
    const [roomThumbById, setRoomThumbById] = React.useState<Record<string, string>>({});
    const [remainingById, setRemainingById] = React.useState<Record<string, number>>({});

    React.useEffect(() => {
        let cancelled = false;
        if (!propertyId) return;

        const load = async () => {
            try {
                setLoading(true);

                const { data: rtRows, error: rtErr } = await supabase
                    .from('room_types')
                    .select('id, property_id, name, max_guests, bathroom_count, room_count, price_per_night, amenities, smoking_allowed')
                    .eq('property_id', propertyId)
                    .order('created_at', { ascending: true });
                if (rtErr) throw rtErr;
                if (cancelled) return;

                const roomTypeIds = ((rtRows ?? []) as any[]).map((r) => r.id).filter(Boolean);
                const thumbs: Record<string, string> = {};
                const beds: Record<string, string[]> = {};

                if (roomTypeIds.length) {
                    const { data: rtPhotoRows, error: rtPhotoErr } = await supabase
                        .from('room_type_photos')
                        .select('room_type_id, uri, sort_order')
                        .in('room_type_id', roomTypeIds)
                        .order('sort_order', { ascending: true });
                    if (rtPhotoErr) throw rtPhotoErr;

                    for (const p of (rtPhotoRows ?? []) as any[]) {
                        const id = p.room_type_id as string;
                        const uri = p.uri as string;
                        if (!id || !uri) continue;
                        if (!thumbs[id]) thumbs[id] = uri;
                    }

                    // Fetch beds
                    const { data: bedRows, error: bedErr } = await supabase
                        .from('beds')
                        .select('room_type_id, bed_type, quantity')
                        .in('room_type_id', roomTypeIds);

                    if (!bedErr && bedRows) {
                        const bedMap: Record<string, { type: string; count: number }[]> = {};
                        for (const b of (bedRows as any[])) {
                            const rid = b.room_type_id as string;
                            if (!bedMap[rid]) bedMap[rid] = [];
                            bedMap[rid].push({ type: b.bed_type, count: b.quantity });
                        }

                        // Format bed strings
                        for (const [rid, configs] of Object.entries(bedMap)) {
                            beds[rid] = configs.map(c => {
                                const typeName = c.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                                return `${c.count} ${typeName} Bed${c.count > 1 ? 's' : ''}`;
                            });
                        }
                    }

                    const { data: availRows, error: availErr } = await supabase.rpc('get_room_type_availability', { p_room_type_ids: roomTypeIds });
                    if (availErr) throw availErr;
                    const remaining: Record<string, number> = {};
                    for (const r of (availRows ?? []) as any[]) {
                        const id = r.room_type_id as string;
                        if (!id) continue;
                        remaining[id] = typeof r.remaining_count === 'number' ? r.remaining_count : Number(r.remaining_count ?? 0);
                    }
                    if (!cancelled) setRemainingById(remaining);
                }

                // Attach formatted beds to room types for easier access in render
                const enrichedRooms = ((rtRows ?? []) as any[]).map(r => ({
                    ...r,
                    formattedBeds: beds[r.id] ?? []
                }));

                setRoomTypes(enrichedRooms);
                setRoomThumbById(thumbs);
            } catch {
                if (!cancelled) {
                    setRoomTypes([]);
                    setRoomThumbById({});
                    setRemainingById({});
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [propertyId]);

    const selectedRoom = React.useMemo(() => {
        if (!selectedRoomTypeId) return null;
        return roomTypes.find((r) => r.id === selectedRoomTypeId) ?? null;
    }, [roomTypes, selectedRoomTypeId]);

    const selectedPrice = selectedRoom?.price_per_night != null ? Number(selectedRoom.price_per_night) : 0;
    const hasSelectedPrice = selectedPrice > 0;

    return (
        <View style={{ flex: 1, backgroundColor: theme.background.val }}>
            <View style={{ paddingTop: insets.top }}>
                <XStack paddingHorizontal="$2" paddingVertical="$2" alignItems="center">
                    <Button variant="outline" onPress={() => navigation.goBack()} size="$3" icon={<Icon name="arrow-left" size={20} />} chromeless>
                        Back
                    </Button>
                </XStack>

                <YStack paddingHorizontal="$4" paddingBottom="$4">
                    <Text variant="header" style={{ fontWeight: '700', color: '$onSurface' }}>Choose your room</Text>
                    <Text variant="body" style={{ color: '$onSurfaceVariant', marginTop: 4 }}>{title}</Text>
                </YStack>
            </View>

            <FlatList
                data={roomTypes}
                keyExtractor={(k) => k.id}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: ctaHeight + 32 + insets.bottom, gap: 16 }}
                ListEmptyComponent={
                    <View style={{ paddingVertical: 24 }}>
                        <Text variant="body" style={{ textAlign: 'center', color: '$onSurfaceVariant' }}>
                            {loading ? 'Loading…' : 'No room types yet.'}
                        </Text>
                    </View>
                }
                renderItem={({ item }) => {
                    const isSelected = selectedRoomTypeId === item.id;
                    const roomName = (item?.name ?? 'Room') as string;
                    const maxGuests = item?.max_guests != null ? Number(item.max_guests) : null;
                    const bathrooms = item?.bathroom_count != null ? Number(item.bathroom_count) : null;
                    const price = item?.price_per_night != null ? Number(item.price_per_night) : 0;
                    const hasPrice = price > 0;
                    const amenities = (Array.isArray(item?.amenities) ? item.amenities : []) as string[];
                    const thumb = roomThumbById[item.id] ?? null;
                    const remaining = typeof remainingById[item.id] === 'number' ? remainingById[item.id] : null;
                    const hasRemaining = remaining != null && Number.isFinite(remaining);
                    const showRemaining = hasRemaining && remaining >= 0;

                    const borderColor = isSelected ? '$primary' : 'transparent';
                    const borderWidth = isSelected ? 3 : 0;
                    const imageSource = thumb ? { uri: thumb } : { uri: 'https://picsum.photos/seed/weinn-room-fallback/400/300' };

                    return (
                        <Card
                            elevation="$1"
                            backgroundColor="$surface"
                            borderRadius="$4"
                            overflow="hidden"
                            borderWidth={borderWidth}
                            borderColor={borderColor}
                            padding={0}
                        >
                            <Pressable
                                onPress={() => setSelectedRoomTypeId(item.id)}
                                disabled={showRemaining && remaining === 0}
                                style={{ opacity: showRemaining && remaining === 0 ? 0.6 : 1, flexDirection: 'row' }}
                            >
                                {/* Left Image */}
                                <View style={{ width: 120, height: 120 }}>
                                    <Image source={imageSource} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                </View>

                                {/* Right Content */}
                                <YStack flex={1} padding="$3" justifyContent="space-between">
                                    <YStack>
                                        <XStack justifyContent="space-between" alignItems="flex-start">
                                            <Text variant="title" numberOfLines={2} style={{ fontWeight: '700', color: '$onSurface', flex: 1, marginRight: 8 }}>
                                                {roomName}
                                            </Text>
                                        </XStack>

                                        <Text variant="label" style={{ color: '$onSurfaceVariant', marginTop: 4 }}>
                                            {[
                                                maxGuests != null ? `${maxGuests} Guests` : null,
                                                item.formattedBeds && item.formattedBeds.length > 0 ? item.formattedBeds.join(', ') : null,
                                                bathrooms != null ? `${bathrooms} Bath` : null
                                            ].filter(Boolean).join(' • ')}
                                        </Text>

                                        <XStack gap="$2" marginTop="$1" flexWrap="wrap">
                                            {amenities.slice(0, 2).map((a, i) => (
                                                <Text key={i} variant="label" style={{ color: '$onSurfaceVariant', fontSize: 11 }}>
                                                    • {a}
                                                </Text>
                                            ))}
                                            {item.smoking_allowed != null && (
                                                <Text variant="label" style={{ color: item.smoking_allowed ? '$error' : '$success', fontSize: 11 }}>
                                                    • {item.smoking_allowed ? 'Smoking Allowed' : 'Non-smoking'}
                                                </Text>
                                            )}
                                            {item.room_count > 1 && (
                                                <Text variant="label" style={{ color: '$onSurfaceVariant', fontSize: 11 }}>
                                                    • {item.room_count} units
                                                </Text>
                                            )}
                                        </XStack>
                                    </YStack>

                                    <XStack justifyContent="space-between" alignItems="flex-end" marginTop="$2">
                                        <YStack>
                                            {showRemaining && remaining <= 3 && remaining > 0 && (
                                                <Text variant="label" style={{ color: '$error', fontWeight: '700', marginBottom: 2 }}>
                                                    Only {remaining} left
                                                </Text>
                                            )}
                                            <Text variant="title" style={{ fontWeight: '700', color: '$primary' }}>
                                                {hasPrice ? `$${price}` : 'TBD'}
                                                {hasPrice && <Text variant="label" style={{ color: '$onSurfaceVariant' }}> / night</Text>}
                                            </Text>
                                        </YStack>

                                        {showRemaining && remaining === 0 ? (
                                            <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, backgroundColor: theme.errorContainer.val }}>
                                                <Text variant="label" style={{ color: '$onErrorContainer', fontWeight: 'bold' }}>Sold Out</Text>
                                            </View>
                                        ) : isSelected ? (
                                            <View style={{ backgroundColor: theme.primaryContainer.val, borderRadius: 100, padding: 4 }}>
                                                <Text variant="label" style={{ color: '$onPrimaryContainer', paddingHorizontal: 8 }}>Selected</Text>
                                            </View>
                                        ) : null}
                                    </XStack>
                                </YStack>
                            </Pressable>
                        </Card>
                    );
                }}
            />

            <Card
                elevation="$4"
                position="absolute"
                left={0}
                right={0}
                bottom={0}
                paddingHorizontal="$4"
                paddingTop="$4"
                paddingBottom={Math.max(insets.bottom, 16)}
                backgroundColor="$surface"
                borderTopWidth={1}
                borderTopColor="$outline"
                borderRadius={0}
            >
                <XStack alignItems="center" justifyContent="space-between" gap="$4">
                    <YStack flex={1}>
                        <Text variant="label" style={{ color: '$onSurfaceVariant' }}>Total</Text>
                        <Text variant="header" style={{ fontWeight: '700', color: '$onSurface' }}>
                            {selectedRoomTypeId ? (hasSelectedPrice ? `$${selectedPrice}` : 'Price TBD') : '$0'}
                        </Text>
                    </YStack>
                    <Button
                        variant="primary"
                        disabled={!selectedRoomTypeId}
                        onPress={() => {
                            navigation.navigate('BookingDetails', {
                                propertyId,
                                roomTypeId: selectedRoomTypeId,
                                propertyTitle: title,
                                roomTitle: selectedRoom?.name ?? 'Room',
                                pricePerNight: selectedRoom?.price_per_night != null ? Number(selectedRoom.price_per_night) : null,
                            });
                        }}
                        borderRadius="$10"
                        height="$5"
                    >
                        Reserve
                    </Button>
                </XStack>
            </Card>
        </View>
    );
}


