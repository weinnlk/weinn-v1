import * as React from 'react';
import { Animated, FlatList, Image, Pressable, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Text, useTheme, Divider, Chip, IconButton, YStack, XStack } from '@weinn/ui';
import { supabase } from '@weinn/core';

export function PropertyDetailsScreen({ route, navigation }: { route: any; navigation: any }) {
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const { width } = useWindowDimensions();
    const propertyId = (route?.params?.propertyId ?? null) as string | null;

    const ctaHeight = 80;

    const [loading, setLoading] = React.useState(false);
    const [property, setProperty] = React.useState<any | null>(null);
    const [photos, setPhotos] = React.useState<Array<{ uri: string }>>([]);
    const [heroIndex, setHeroIndex] = React.useState(0);

    React.useEffect(() => {
        let cancelled = false;
        if (!propertyId) return;

        const load = async () => {
            try {
                setLoading(true);

                const { data: propRow, error: propErr } = await supabase
                    .from('properties')
                    .select(
                        'id, status, title, location_text, location_address, location_lat, location_lng, description, amenities, property_type, star_rating, villa_price_per_night, villa_guest_count, villa_bathrooms, villa_size, villa_size_unit, languages, breakfast_included, breakfast_served, pets_allowed, children_allowed, check_in_from, check_in_until, check_out_from, check_out_until'
                    )
                    .eq('id', propertyId)
                    .maybeSingle();
                if (propErr) throw propErr;
                if (cancelled) return;

                const { data: photoRows, error: photoErr } = await supabase
                    .from('property_photos')
                    .select('uri, sort_order')
                    .eq('property_id', propertyId)
                    .order('sort_order', { ascending: true });
                if (photoErr) throw photoErr;
                if (cancelled) return;

                setProperty(propRow ?? null);
                setPhotos(((photoRows ?? []) as any[]).map((p) => ({ uri: p.uri })).filter((p) => !!p.uri));
            } catch {
                if (!cancelled) {
                    setProperty(null);
                    setPhotos([]);
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

    const title = (property?.title ?? 'Property') as string;
    const locationText = (property?.location_text ?? property?.location_address ?? '') as string;
    const nightly = property?.villa_price_per_night != null ? Number(property.villa_price_per_night) : 0;
    const hasPrice = nightly > 0;
    const description = (property?.description ?? '') as string;
    const amenities = (Array.isArray(property?.amenities) ? property.amenities : []) as string[];
    const amenityPreview = amenities.slice(0, 6);
    const descriptionPreview = description.trim().length ? description.trim().slice(0, 220) : '';

    const lat = typeof property?.location_lat === 'number' ? (property.location_lat as number) : null;
    const lng = typeof property?.location_lng === 'number' ? (property.location_lng as number) : null;
    const address = (property?.location_address ?? '') as string;

    return (
        <View style={{ flex: 1, backgroundColor: theme.background.val }}>
            <Animated.ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: ctaHeight + 32 + insets.bottom }}>
                {/* Hero Section */}
                <View style={{ height: 300, backgroundColor: theme.surfaceVariant.val }}>
                    {photos.length ? (
                        <FlatList
                            data={photos}
                            keyExtractor={(k, i) => `${k.uri}-${i}`}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={(e) => {
                                const next = Math.round(e.nativeEvent.contentOffset.x / Math.max(1, width));
                                setHeroIndex(next);
                            }}
                            renderItem={({ item }) => <Image source={{ uri: item.uri }} style={{ width, height: 300, resizeMode: 'cover' }} />}
                        />
                    ) : (
                        <Image source={{ uri: 'https://picsum.photos/seed/weinn-property-fallback/1200/800' }} style={{ width, height: 300, resizeMode: 'cover' }} />
                    )}

                    {/* Back Button Overlay */}
                    <View
                        style={{
                            position: 'absolute',
                            top: insets.top + 8,
                            left: 16,
                            borderRadius: 24,
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <IconButton
                            icon="arrow-left"
                            color="#fff"
                            size={24}
                            onPress={() => navigation.goBack()}
                        />
                    </View>

                    {/* Photo Counter */}
                    <View style={{
                        position: 'absolute',
                        right: 16,
                        bottom: 16,
                        borderRadius: 8,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                    }}>
                        <Text variant="label" style={{ color: '#fff' }}>
                            {photos.length ? `${Math.min(photos.length, heroIndex + 1)} / ${photos.length}` : '1 / 1'}
                        </Text>
                    </View>
                </View>

                <YStack paddingHorizontal="$4" paddingTop="$4" gap="$4">
                    {/* Header Section */}
                    <YStack gap="$2">
                        <Text variant="header" style={{ fontWeight: '700', color: '$onSurface' }}>
                            {title}
                        </Text>
                        <XStack alignItems="center" gap="$1">
                            <IconButton icon="map-marker" size={18} color={theme.primary.val} style={{ margin: 0, padding: 0, width: 24, height: 24 }} />
                            <Text variant="body" style={{ color: '$onSurfaceVariant', flex: 1 }}>
                                {locationText}
                            </Text>
                        </XStack>

                        <XStack gap="$2" marginTop="$2" flexWrap="wrap">
                            {property?.property_type && (
                                <Chip icon="home-outline" variant="filled" color="$onSecondaryContainer" backgroundColor="$secondaryContainer">
                                    {property.property_type}
                                </Chip>
                            )}
                            {property?.star_rating && (
                                <Chip icon="star" variant="filled" color="$onTertiaryContainer" backgroundColor="$tertiaryContainer">
                                    {property.star_rating}
                                </Chip>
                            )}
                        </XStack>
                    </YStack>

                    <Divider />

                    {/* About Section */}
                    <YStack gap="$2">
                        <Text variant="title" style={{ fontWeight: '600', color: '$onSurface' }}>About this place</Text>
                        <Text variant="body" style={{ color: '$onSurfaceVariant', lineHeight: 24 }}>
                            {descriptionPreview || 'No description provided.'}
                            {description.trim().length > descriptionPreview.length ? '...' : ''}
                        </Text>
                        {description.trim().length > descriptionPreview.length && (
                            <Button
                                variant="secondary"
                                chromeless
                                onPress={() => navigation.navigate('PropertyDescription', { title, description })}
                                alignSelf="flex-start"
                                marginLeft={-8}
                            >
                                Read more
                            </Button>
                        )}
                    </YStack>

                    <Divider />

                    {/* Amenities Section */}
                    <YStack gap="$3">
                        <Text variant="title" style={{ fontWeight: '600', color: '$onSurface' }}>What this place offers</Text>
                        {amenityPreview.length > 0 ? (
                            <XStack flexWrap="wrap" gap="$2.5">
                                {amenityPreview.map((amenity, index) => (
                                    <XStack key={index}
                                        alignItems="center"
                                        width="46%"
                                        gap="$2"
                                    >
                                        <IconButton icon="check-circle-outline" size={20} color={theme.onSurfaceVariant.val} style={{ margin: 0 }} />
                                        <Text variant="body" style={{ color: '$onSurface' }}>{amenity}</Text>
                                    </XStack>
                                ))}
                            </XStack>
                        ) : (
                            <Text variant="body" style={{ color: '$onSurfaceVariant' }}>No amenities listed.</Text>
                        )}

                        {amenities.length > amenityPreview.length && (
                            <Button
                                variant="outline"
                                onPress={() => navigation.navigate('PropertyAmenities', { title, amenities })}
                                borderColor="$outline"
                            >
                                Show all {amenities.length} amenities
                            </Button>
                        )}
                    </YStack>

                    <Divider />

                    {/* House Rules & Policies */}
                    <YStack gap="$3">
                        <Text variant="title" style={{ fontWeight: '600', color: '$onSurface' }}>House rules</Text>
                        <YStack gap="$2">
                            <RuleRow icon="clock-time-four-outline" label="Check-in" value={property?.check_in_from || property?.check_in_until ? `${property?.check_in_from ?? ''} - ${property?.check_in_until ?? ''}` : 'Flexible'} theme={theme} />
                            <RuleRow icon="clock-time-eight-outline" label="Check-out" value={property?.check_out_from || property?.check_out_until ? `${property?.check_out_from ?? ''} - ${property?.check_out_until ?? ''}` : 'Flexible'} theme={theme} />
                            <RuleRow icon="paw" label="Pets" value={property?.pets_allowed === true ? 'Allowed' : property?.pets_allowed === false ? 'Not allowed' : 'Contact host'} theme={theme} />
                            <RuleRow icon="baby-face-outline" label="Children" value={property?.children_allowed === true ? 'Allowed' : property?.children_allowed === false ? 'Not suitable' : 'Contact host'} theme={theme} />
                        </YStack>
                    </YStack>

                    <Divider />

                    {/* Map / Location */}
                    <YStack gap="$2">
                        <Text variant="title" style={{ fontWeight: '600', color: '$onSurface' }}>Where you'll be</Text>
                        <Text variant="body" style={{ color: '$onSurface' }}>{locationText || address}</Text>
                        {!!address && <Text variant="label" style={{ color: '$onSurfaceVariant' }}>{address}</Text>}
                        {/* Placeholder for actual MapView */}
                        <Card height={200} backgroundColor="$surfaceVariant" borderRadius="$4" alignItems="center" justifyContent="center">
                            <IconButton icon="map" size={40} color={theme.onSurfaceVariant.val} />
                            <Text variant="label" style={{ color: '$onSurfaceVariant' }}>Map view available shortly</Text>
                        </Card>
                    </YStack>
                </YStack>
            </Animated.ScrollView>

            {/* Sticky Footer */}
            <Card
                elevation="$4"
                paddingHorizontal="$4"
                paddingTop="$3"
                paddingBottom={Math.max(insets.bottom, 16)}
                backgroundColor="$surface"
                borderTopWidth={1}
                borderTopColor="$surfaceVariant"
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                borderRadius={0}
            >
                <View>
                    <Text variant="header" style={{ fontWeight: '700', color: '$onSurface' }}>
                        {hasPrice ? `$${nightly}` : 'Contact'}
                        {hasPrice && <Text variant="body" style={{ fontWeight: '400', color: '$onSurfaceVariant' }}> / night</Text>}
                    </Text>
                    {hasPrice && (
                        <Text variant="label" style={{ textDecorationLine: 'underline', color: '$onSurface' }}>
                            See dates
                        </Text>
                    )}
                </View>
                <Button
                    variant="primary"
                    onPress={() => navigation.navigate('SelectRooms', { propertyId, title })}
                    borderRadius="$3"
                    // contentStyle={{ paddingHorizontal: 8, height: 48 }}
                    // labelStyle={{ fontSize: 16, fontWeight: '600' }}
                    disabled={!propertyId}
                >
                    Check availability
                </Button>
            </Card>
        </View>
    );
}

function RuleRow({ icon, label, value, theme }: { icon: string, label: string, value: string, theme: any }) {
    return (
        <XStack alignItems="center" justifyContent="space-between">
            <XStack alignItems="center" gap="$2">
                <IconButton icon={icon} size={24} color={theme.onSurfaceVariant.val} style={{ margin: 0 }} />
                <Text variant="body" style={{ color: '$onSurface' }}>{label}</Text>
            </XStack>
            <Text variant="body" style={{ color: '$onSurfaceVariant' }}>{value}</Text>
        </XStack>
    );
}

