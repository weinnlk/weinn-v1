import * as React from 'react';
import { StyleSheet, Image } from 'react-native';
import { Card, Text, useTheme, YStack, XStack, View } from '@weinn/ui';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type PropertyCardProps = {
    title: string;
    location: string;
    thumbnailUri: string | null;
    dates?: string;
    pricePerNight?: number;
    rating?: number;
    onPress?: () => void;
};

export function PropertyCard({
    title,
    location,
    thumbnailUri,
    dates,
    pricePerNight,
    rating,
    onPress,
}: PropertyCardProps) {
    const theme = useTheme();

    // Use a fallback image if none provided
    const imageSource = thumbnailUri
        ? { uri: thumbnailUri }
        : { uri: 'https://picsum.photos/seed/weinn-fallback/600/400' };

    return (
        <Card
            onPress={onPress}
            elevation="$1"
            borderRadius="$4"
            overflow="hidden"
            marginBottom="$4"
            backgroundColor="$surface"
        >
            <Image source={imageSource} style={styles.cover} resizeMode="cover" />
            <YStack padding="$4" gap="$1">
                <XStack justifyContent="space-between" alignItems="flex-start">
                    <Text variant="title" style={{ flex: 1, fontWeight: '700', color: '$onSurface' }}>
                        {title}
                    </Text>
                    <XStack alignItems="center" gap="$1">
                        <Icon name="star" size={16} color={theme.tertiary.val} />
                        <Text variant="body" fontWeight="600" color="$onSurface">
                            {rating ?? 'New'}
                        </Text>
                    </XStack>
                </XStack>

                <Text variant="body" color="$onSurfaceVariant" marginTop="$1">
                    {location}
                </Text>

                {dates ? (
                    <Text variant="label" color="$onSurfaceVariant" marginTop="$1">
                        {dates}
                    </Text>
                ) : null}

                <View style={styles.priceRow}>
                    {pricePerNight ? (
                        <Text variant="header" fontWeight="700" color="$onSurface">
                            ${pricePerNight} <Text variant="body" fontWeight="400" color="$onSurfaceVariant">night</Text>
                        </Text>
                    ) : (
                        <Text variant="header" fontWeight="700" color="$onSurface">
                            Price TBD
                        </Text>
                    )}
                </View>
            </YStack>
        </Card>
    );
}

const styles = StyleSheet.create({
    cover: {
        height: 220,
        width: '100%',
    },
    priceRow: {
        marginTop: 12,
    },
});

