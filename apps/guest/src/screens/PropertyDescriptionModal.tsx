import * as React from 'react';
import { Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, useTheme, IconButton, YStack, XStack } from '@weinn/ui';

export function PropertyDescriptionModal({ route, navigation }: { route: any; navigation: any }) {
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const title = (route?.params?.title ?? 'About') as string;
    const description = (route?.params?.description ?? '') as string;

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

            <Animated.ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 24 + insets.bottom }}>
                <Text variant="body" style={{ lineHeight: 24, color: '$onSurface' }}>{description || 'No description yet.'}</Text>
            </Animated.ScrollView>
        </View>
    );
}

