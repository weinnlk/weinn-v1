import * as React from 'react';
import { FlatList, Image, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Card, useTheme, Button, YStack, XStack, View } from '@weinn/ui';
import { supabase } from '@weinn/core';
import { PropertyCard } from '../components/PropertyCard';

type HomeContentApp = 'guest' | 'host';
type HomeContentPlacement = 'home_top_carousel' | 'home_mid';
type HomeContentType = 'promo_hero' | 'article_modal';

type HomeContentAction =
    | { type: 'navigate_tab'; tab: 'Home' | 'Bookings' | 'Messages' | 'Profile' }
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
        if (tab === 'Home' || tab === 'Bookings' || tab === 'Messages' || tab === 'Profile') {
            return { label, action: { type: 'navigate_tab', tab } };
        }
    }

    if (action.type === 'open_article_modal') {
        return { label, action: { type: 'open_article_modal' } };
    }

    return null;
}

export function GuestHomeScreen({ navigation }: { navigation: any }) {
    const insets = useSafeAreaInsets();
    const theme = useTheme();

    const [top, setTop] = React.useState<HomeContentItem[]>([]);
    const [mid, setMid] = React.useState<HomeContentItem[]>([]);

    const [approvedProps, setApprovedProps] = React.useState<
        Array<{
            id: string;
            title: string | null;
            location_text: string | null;
            property_type: string | null;
            star_rating: string | null;
            villa_price_per_night: number | null;
            thumbnail_uri: string | null;
        }>
    >([]);

    React.useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const { data, error } = await supabase
                    .from('home_content_items')
                    .select('id, app, placement, type, title, subtitle, image_url, payload, priority')
                    .eq('app', 'guest')
                    .in('placement', ['home_top_carousel', 'home_mid'])
                    .order('priority', { ascending: false });
                if (error) throw error;
                if (cancelled) return;

                const items = (data ?? []) as any as HomeContentItem[];
                setTop(items.filter((x) => x.placement === 'home_top_carousel'));
                setMid(items.filter((x) => x.placement === 'home_mid'));
            } catch {
                if (!cancelled) {
                    setTop([]);
                    setMid([]);
                }
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    React.useEffect(() => {
        let cancelled = false;

        const loadApproved = async () => {
            try {
                const { data: propsRows, error: propsErr } = await supabase
                    .from('properties')
                    .select('id, title, location_text, property_type, star_rating, villa_price_per_night')
                    .eq('status', 'approved')
                    .eq('is_listed', true)
                    .order('approved_at', { ascending: false })
                    .limit(20);
                if (propsErr) throw propsErr;
                if (cancelled) return;

                const rows = (propsRows ?? []) as any[];
                const ids = rows.map((r) => r.id).filter(Boolean);

                const thumbsById: Record<string, string> = {};
                if (ids.length) {
                    const { data: photoRows, error: photoErr } = await supabase
                        .from('property_photos')
                        .select('property_id, uri, sort_order')
                        .in('property_id', ids)
                        .order('sort_order', { ascending: true });
                    if (photoErr) throw photoErr;

                    for (const p of (photoRows ?? []) as any[]) {
                        const pid = p.property_id as string;
                        const uri = p.uri as string;
                        if (!pid || !uri) continue;
                        if (!thumbsById[pid]) thumbsById[pid] = uri;
                    }
                }

                setApprovedProps(
                    rows.map((r) => ({
                        id: r.id,
                        title: r.title ?? null,
                        location_text: r.location_text ?? null,
                        property_type: r.property_type ?? null,
                        star_rating: r.star_rating ?? null,
                        villa_price_per_night: r.villa_price_per_night ?? null,
                        thumbnail_uri: thumbsById[r.id] ?? null,
                    }))
                );
            } catch {
                if (!cancelled) setApprovedProps([]);
            }
        };

        loadApproved();
        return () => {
            cancelled = true;
        };
    }, []);

    const openArticle = (item: HomeContentItem) => {
        navigation.navigate('ContentModal', { item });
    };

    const handleAction = (item: HomeContentItem, action: HomeContentAction) => {
        if (action.type === 'navigate_tab') {
            navigation.navigate('Tabs', { screen: action.tab });
            return;
        }
        if (action.type === 'open_article_modal') {
            openArticle(item);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FBFDF9' }} edges={['top']}>
            <FlatList
                data={mid}
                keyExtractor={(k) => k.id}
                contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}
                ListHeaderComponent={
                    <View>
                        {/* Hero Carousel */}
                        {top.length ? (
                            <View style={{ marginBottom: 32, marginTop: 16 }}>
                                <FlatList
                                    data={top}
                                    keyExtractor={(k) => k.id}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
                                    snapToInterval={320 + 16}
                                    decelerationRate="fast"
                                    renderItem={({ item }) => {
                                        const cta = getCta(item);
                                        const hasImage = !!item.image_url;

                                        return (
                                            <Card
                                                width={320}
                                                height={180}
                                                borderRadius="$6"
                                                overflow="hidden"
                                                backgroundColor={item?.payload?.background_color || '$primaryContainer'}
                                                justifyContent="flex-end"
                                                elevation="$2"
                                            >
                                                {hasImage && (
                                                    <Image
                                                        source={{ uri: item.image_url! }}
                                                        style={{ ...StyleSheet.absoluteFillObject }}
                                                        resizeMode="cover"
                                                    />
                                                )}

                                                {/* Gradient Overlay */}
                                                <View style={{
                                                    ...StyleSheet.absoluteFillObject,
                                                    backgroundColor: hasImage ? 'rgba(0,0,0,0.3)' : 'transparent',
                                                }} />

                                                <YStack padding="$4" gap="$1">
                                                    <Text variant="header" color={hasImage ? '#fff' : '$onPrimaryContainer'}>
                                                        {item.title ?? ''}
                                                    </Text>
                                                    {item.subtitle ? (
                                                        <Text variant="body" color={hasImage ? 'rgba(255,255,255,0.9)' : '$onPrimaryContainer'} opacity={0.9} marginBottom="$2">
                                                            {item.subtitle}
                                                        </Text>
                                                    ) : null}

                                                    {cta ? (
                                                        <Button
                                                            variant={hasImage ? "primary" : "secondary"}
                                                            onPress={() => handleAction(item, cta.action)}
                                                            alignSelf="flex-start"
                                                            borderRadius="$4"
                                                            backgroundColor={hasImage ? '$primary' : undefined}
                                                        >
                                                            {cta.label}
                                                        </Button>
                                                    ) : null}
                                                </YStack>
                                            </Card>
                                        );
                                    }}
                                />
                            </View>
                        ) : (
                            <View style={{ height: 16 }} />
                        )}

                        {/* Stays Header */}
                        {approvedProps.length > 0 && (
                            <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                                <Text variant="header" color="$onSurface">
                                    Stays
                                </Text>
                            </View>
                        )}
                    </View>
                }
                renderItem={({ item }) => {
                    return (
                        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                            <Card borderRadius="$4" overflow="hidden" elevation="$0">
                                <Pressable onPress={() => openArticle(item)} android_ripple={{ color: 'rgba(0,0,0,0.1)' }}>
                                    <XStack height={110}>
                                        {item.image_url ? (
                                            <Image source={{ uri: item.image_url }} style={{ width: 110, height: '100%' }} resizeMode="cover" />
                                        ) : null}
                                        <YStack flex={1} padding="$4" justifyContent="center" gap="$1">
                                            <Text variant="title" color="$onSurfaceVariant">
                                                {item.title ?? ''}
                                            </Text>
                                            {item.subtitle ? (
                                                <Text variant="header" color="$onSurfaceVariant">
                                                    {item.subtitle}
                                                </Text>
                                            ) : null}
                                        </YStack>
                                    </XStack>
                                </Pressable>
                            </Card>
                        </View>
                    );
                }}
                ListFooterComponent={
                    approvedProps.length ? (
                        <YStack paddingHorizontal="$4" gap="$0">
                            {approvedProps.map((p) => {
                                const nightly = p.villa_price_per_night != null ? Number(p.villa_price_per_night) : 0;
                                const address = p.location_text ?? '';

                                return (
                                    <PropertyCard
                                        key={p.id}
                                        title={p.title ?? 'Untitled'}
                                        location={address}
                                        thumbnailUri={p.thumbnail_uri}
                                        pricePerNight={nightly}
                                        rating={p.star_rating ? Number(p.star_rating) : undefined}
                                        onPress={() => {
                                            navigation.navigate('PropertyDetails', { propertyId: p.id, title: p.title ?? 'Property' });
                                        }}
                                    />
                                );
                            })}
                        </YStack>
                    ) : (
                        <View style={{ padding: 32, alignItems: 'center' }}>
                            <Text variant="body" color="$onSurfaceVariant">
                                No stays found at the moment.
                            </Text>
                        </View>
                    )
                }
            />
        </SafeAreaView>
    );
}

