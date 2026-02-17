import * as React from 'react';
import { View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Text, useTheme, YStack } from '@weinn/ui';

export function BookingConfirmedScreen({ route, navigation }: { route: any; navigation: any }) {
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const reservationCode = (route?.params?.reservationCode ?? '') as string;
    const propertyTitle = (route?.params?.propertyTitle ?? 'Booking confirmed') as string;
    const roomTitle = (route?.params?.roomTitle ?? 'Room') as string;

    return (
        <View style={{ flex: 1, backgroundColor: theme.background.val }}>
            <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center', gap: 32 }}>

                {/* Success Visuals */}
                <YStack alignItems="center" gap="$3">
                    <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: theme.primaryContainer.val, alignItems: 'center', justifyContent: 'center' }}>
                        <Text variant="header" style={{ fontSize: 32 }}>🎉</Text>
                    </View>
                    <YStack alignItems="center" gap="$1">
                        <Text variant="header" style={{ fontWeight: '700', color: '$onSurface', textAlign: 'center' }}>
                            Booking Confirmed!
                        </Text>
                        <Text variant="body" style={{ color: '$onSurfaceVariant', textAlign: 'center' }}>
                            You're all set for {propertyTitle}
                        </Text>
                    </YStack>
                </YStack>

                {/* Reservation Code Card */}
                <Card padding="$4" borderRadius="$4" backgroundColor="$surface" alignItems="center" gap="$2">
                    <Text variant="label" style={{ color: '$onSurfaceVariant', letterSpacing: 1, fontWeight: '700' }}>
                        RESERVATION CODE
                    </Text>
                    <Text variant="title" style={{ fontWeight: '700', letterSpacing: 2, color: '$onSurface', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
                        {reservationCode || 'WBN-CONF-PENDING'}
                    </Text>
                    <Text variant="label" style={{ color: '$onSurfaceVariant', textAlign: 'center' }}>
                        Show this code to your host upon arrival
                    </Text>
                </Card>

                <View style={{ height: 24 }} />

                {/* Action Buttons */}
                <YStack gap="$2" width="100%">
                    <Button
                        variant="primary"
                        onPress={() => {
                            navigation.navigate('Tabs', { screen: 'Bookings' });
                        }}
                        borderRadius="$10"
                        height="$5"
                    >
                        View Booking
                    </Button>
                    <Button
                        variant="outline"
                        onPress={() => {
                            navigation.popToTop();
                        }}
                        borderRadius="$10"
                        height="$5"
                    >
                        Return to Home
                    </Button>
                </YStack>
            </View>
        </View>
    );
}

