import * as React from 'react';
import { Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Divider, Text, useTheme, IconButton, YStack, XStack } from '@weinn/ui';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export function PropertyAmenitiesModal({ route, navigation }: { route: any; navigation: any }) {
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const title = (route?.params?.title ?? 'Amenities') as string;
    const amenities = (Array.isArray(route?.params?.amenities) ? route.params.amenities : []) as string[];

    return (
        <View style={{ flex: 1, backgroundColor: theme.background.val }}>
            {/* Header */}
            <XStack
                alignItems="center"
                paddingHorizontal="$2"
                paddingVertical="$2"
                backgroundColor="$background"
                marginTop={insets.top}
            >
                <IconButton icon="arrow-left" onPress={() => navigation.goBack()} size={24} color="$onSurface" />
                <Text variant="title" style={{ fontWeight: '600', flex: 1, textAlign: 'center', marginRight: 48 }}>
                    {title}
                </Text>
            </XStack>

            <Animated.ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}>
                {amenities.length ? (
                    <View>
                        {amenities.map((a, idx) => (
                            <React.Fragment key={`${a}-${idx}`}>
                                <XStack padding="$4" alignItems="center" gap="$3">
                                    <Icon name="check" size={24} color={theme.onSurfaceVariant.val} />
                                    <Text variant="body" color="$onSurface">{a}</Text>
                                </XStack>
                                <Divider marginVertical={0} />
                            </React.Fragment>
                        ))}
                    </View>
                ) : (
                    <View style={{ padding: 16 }}>
                        <Text variant="body" style={{ color: '$onSurfaceVariant' }}>No amenities yet.</Text>
                    </View>
                )}
            </Animated.ScrollView>
        </View>
    );
}

