import React from 'react';
import { View, Image, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Text, Card, Button, Chip, XStack, YStack, IconButton } from '@weinn/ui';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '@weinn/core';

const ListingItem = React.memo(({ item, imageUri, theme, navigation }: { item: any, imageUri: string | null, theme: any, navigation: any }) => {
    const isDraft = item.status === 'draft' || item.status === 'rejected';

    return (
        <Card variant="outlined" style={{ borderRadius: 12, backgroundColor: theme.background.get(), overflow: 'hidden', padding: 0, flexDirection: 'row', borderColor: theme.outlineVariant.get() }}>
            {/* Image Section */}
            <View style={{ width: 120, backgroundColor: theme.gray5.get() }}>
                {imageUri ? (
                    <Image source={{ uri: imageUri ?? undefined }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                ) : (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="image-off-outline" size={32} color={theme.gray8.get()} />
                    </View>
                )}
            </View>

            {/* Content Section */}
            <View style={{ flex: 1, padding: 16, justifyContent: 'space-between', gap: 8 }}>
                <View>
                    <XStack justifyContent="space-between" alignItems="flex-start" marginBottom={4}>
                        <Chip
                            variant="filled"
                            backgroundColor={item.status === 'approved' ? '$success' : item.status === 'draft' ? '$gray5' : '$warning'}
                            color={item.status === 'approved' ? 'white' : item.status === 'draft' ? '$gray11' : 'black'}
                        >
                            {item.status === 'draft' ? 'Draft' : item.status === 'submitted' ? 'Pending' : item.status === 'approved' ? 'Active' : item.status}
                        </Chip>
                    </XStack>
                    <Text variant="body" style={{ fontWeight: '800', fontSize: 16 }} numberOfLines={1}>
                        {item.title ?? 'Untitled Property'}
                    </Text>
                    <Text variant="label" style={{ color: theme.gray11.get(), fontSize: 13, marginTop: 2 }}>
                        Updated {new Date(item.updated_at).toLocaleDateString()}
                    </Text>
                </View>

                <Button
                    variant="outline"
                    size="$3"
                    onPress={() => navigation.navigate('WizardV3Start', { propertyId: item.id })}
                    borderColor="$outline"
                >
                    {isDraft ? 'Resume Editing' : 'Edit Details'}
                </Button>
            </View>
        </Card>
    );
});

export function HostMyListingsScreen({
    navigation,
    authUserId,
    properties,
    onCreateNew,
    onReload,
}: {
    navigation: any;
    authUserId: string | null;
    properties: { id: string; status: string; title: string | null; updated_at: string }[];
    onCreateNew: () => void;
    onReload: () => Promise<void>;
}) {
    const insets = useSafeAreaInsets();
    const theme = useTheme();

    const [filter, setFilter] = React.useState<'all' | 'active' | 'draft'>('all');
    const [propertyImages, setPropertyImages] = React.useState<Record<string, string | null>>({});

    React.useEffect(() => {
        // Fetch cover photos for properties
        const loadImages = async () => {
            const ids = properties.map(p => p.id);
            if (!ids.length) return;

            const { data } = await supabase
                .from('property_photos')
                .select('property_id, uri')
                .in('property_id', ids)
                .eq('sort_order', 0); // Get first photo

            const map: Record<string, string> = {};
            data?.forEach((row: any) => {
                map[row.property_id] = row.uri;
            });
            setPropertyImages(map);
        };
        loadImages();
    }, [properties]);

    const filteredProperties = React.useMemo(() => {
        if (filter === 'all') return properties;
        if (filter === 'active') return properties.filter(p => p.status === 'approved' || p.status === 'submitted');
        return properties.filter(p => p.status === 'draft' || p.status === 'rejected');
    }, [properties, filter]);

    const renderItem = React.useCallback(({ item }: { item: any }) => {
        return (
            <ListingItem
                item={item}
                imageUri={propertyImages[item.id] ?? null}
                theme={theme}
                navigation={navigation}
            />
        );
    }, [propertyImages, theme, navigation]);

    return (
        <View style={{ flex: 1, backgroundColor: theme.background.get() }}>
            <View style={{ paddingHorizontal: 16, paddingTop: insets.top + 16, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.background.get() }}>
                <Text variant="header" style={{ fontSize: 32, fontWeight: '800', letterSpacing: -1 }}>My Listings</Text>
                <XStack gap="$2">
                    <IconButton icon="magnify" size={24} color={theme.color.get()} />
                    <IconButton icon="refresh" size={24} color={theme.color.get()} onPress={onReload} />
                </XStack>
            </View>

            <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                <XStack backgroundColor="$gray5" borderRadius="$4" padding={4}>
                    {(['all', 'active', 'draft'] as const).map((f) => (
                        <Button
                            key={f}
                            flex={1}
                            size="$3"
                            variant={filter === f ? 'primary' : 'ghost'}
                            onPress={() => setFilter(f)}
                            borderRadius="$3"
                            // @ts-ignore
                            fontWeight={filter === f ? '700' : '500'}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </Button>
                    ))}
                </XStack>
            </View>

            <FlatList
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 + insets.bottom, gap: 16 }}
                data={filteredProperties}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListEmptyComponent={
                    <View style={{ padding: 32, alignItems: 'center', gap: 16, marginTop: 40 }}>
                        <Icon name="home-city-outline" size={64} color={theme.gray8.get()} />
                        <Text variant="title" style={{ color: theme.gray11.get(), textAlign: 'center' }}>
                            {filter === 'all' ? 'No properties yet.' : `No ${filter} properties.`}
                        </Text>
                        {filter === 'all' && (
                            <Button variant="primary" onPress={onCreateNew}>Create your first property</Button>
                        )}
                    </View>
                }
            />

            <Button
                variant="primary"
                circular
                icon={<Icon name="plus" size={24} color={theme.onPrimary.get()} />}
                style={{
                    position: 'absolute',
                    margin: 16,
                    right: 0,
                    bottom: insets.bottom + 80, // Adjust for tab bar height + insets
                    width: 56,
                    height: 56,
                    elevation: 4,
                }}
                onPress={onCreateNew}
            />
        </View>
    );
}
