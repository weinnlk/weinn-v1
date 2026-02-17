import React from 'react';
import { View, Image, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Text, Card, Button, Chip, XStack, YStack, IconButton } from '@weinn/ui';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '@weinn/core';

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

    return (
        <View style={{ flex: 1, backgroundColor: theme.background.get() }}>
            <View style={{ paddingHorizontal: 16, paddingTop: insets.top + 8, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.background.get(), borderBottomWidth: 1, borderBottomColor: theme.borderColor.get() }}>
                <View style={{ width: 48 }} />
                <Text variant="title" style={{ fontWeight: 'bold' }}>My Listings</Text>
                <XStack>
                    <Button variant="ghost" icon={<Icon name="magnify" size={24} color={theme.color.get()} />} onPress={() => { }} width={48} height={48} />
                    <Button variant="ghost" icon={<Icon name="refresh" size={24} color={theme.color.get()} />} onPress={onReload} width={48} height={48} />
                </XStack>
            </View>

            <View style={{ padding: 16 }}>
                <XStack backgroundColor="$gray3" borderRadius="$4" padding="$1">
                    <Button
                        flex={1}
                        variant={filter === 'all' ? 'primary' : 'ghost'}
                        onPress={() => setFilter('all')}
                        size="small"
                        chromeless={filter !== 'all'}
                    >
                        All
                    </Button>
                    <Button
                        flex={1}
                        variant={filter === 'active' ? 'primary' : 'ghost'}
                        onPress={() => setFilter('active')}
                        size="small"
                        chromeless={filter !== 'active'}
                    >
                        Active
                    </Button>
                    <Button
                        flex={1}
                        variant={filter === 'draft' ? 'primary' : 'ghost'}
                        onPress={() => setFilter('draft')}
                        size="small"
                        chromeless={filter !== 'draft'}
                    >
                        Drafts
                    </Button>
                </XStack>
            </View>

            <FlatList
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 + insets.bottom, gap: 16 }}
                data={filteredProperties}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const imageUri = propertyImages[item.id];
                    const isDraft = item.status === 'draft' || item.status === 'rejected';

                    return (
                        <Card variant="filled" style={{ borderRadius: 12, backgroundColor: theme.surface.get(), overflow: 'hidden' }}>
                            <View style={{ flexDirection: 'row' }}>
                                {/* Image Section */}
                                <View style={{ width: 110, height: 110, backgroundColor: theme.surfaceVariant.get() }}>
                                    {imageUri ? (
                                        <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                    ) : (
                                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                            <Icon name="image-off-outline" size={32} color={theme.gray8.get()} />
                                        </View>
                                    )}
                                </View>

                                {/* Content Section */}
                                <View style={{ flex: 1, padding: 12, justifyContent: 'space-between' }}>
                                    <View>
                                        <Text variant="body" style={{ fontWeight: 'bold' }} numberOfLines={1}>
                                            {item.title ?? 'Untitled Property'}
                                        </Text>
                                        <Text variant="label" style={{ color: theme.gray11.get() }}>
                                            Updated {new Date(item.updated_at).toLocaleDateString()}
                                        </Text>
                                    </View>

                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Chip
                                            selected={!isDraft}
                                        >
                                            {item.status === 'draft' ? 'Draft' : item.status === 'submitted' ? 'Pending' : item.status === 'approved' ? 'Active' : item.status}
                                        </Chip>

                                        <Button
                                            variant="outline"
                                            size="small"
                                            onPress={() => navigation.navigate('WizardV3Start', { propertyId: item.id })}
                                        >
                                            {isDraft ? 'Resume' : 'Edit'}
                                        </Button>
                                    </View>
                                </View>
                            </View>
                        </Card>
                    );
                }}
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
