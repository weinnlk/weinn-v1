import * as React from 'react';
import { Animated, KeyboardAvoidingView, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Text, Input, useTheme, YStack, XStack } from '@weinn/ui';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '@weinn/core';

export function BookingDetailsScreen({ route, navigation }: { route: any; navigation: any }) {
    const insets = useSafeAreaInsets();
    const theme = useTheme();

    const propertyId = (route?.params?.propertyId ?? null) as string | null;
    const roomTypeId = (route?.params?.roomTypeId ?? null) as string | null;
    const propertyTitle = (route?.params?.propertyTitle ?? 'Reservation details') as string;
    const roomTitle = (route?.params?.roomTitle ?? 'Room') as string;
    const pricePerNight = route?.params?.pricePerNight as number | null;

    const [checkIn, setCheckIn] = React.useState('');
    const [checkOut, setCheckOut] = React.useState('');
    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [country, setCountry] = React.useState('');
    const [phone, setPhone] = React.useState('');
    const [submitting, setSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string>('');

    const ctaHeight = 80;
    const canSubmit =
        !!propertyId &&
        !!roomTypeId &&
        checkIn.trim().length > 0 &&
        checkOut.trim().length > 0 &&
        firstName.trim().length > 0 &&
        lastName.trim().length > 0 &&
        email.trim().length > 0 &&
        country.trim().length > 0 &&
        phone.trim().length > 0;

    const onConfirm = async () => {
        if (!canSubmit) return;
        try {
            setSubmitting(true);
            setError('');

            const { data, error: rpcErr } = await supabase.rpc('create_booking_with_dates_if_available', {
                p_property_id: propertyId,
                p_room_type_id: roomTypeId,
                p_check_in: checkIn.trim(),
                p_check_out: checkOut.trim(),
                p_first_name: firstName.trim(),
                p_last_name: lastName.trim(),
                p_email: email.trim(),
                p_country: country.trim(),
                p_phone: phone.trim(),
            });

            if (rpcErr) throw rpcErr;
            if (!data) throw new Error('Missing booking response');
            navigation.replace('BookingConfirmed', {
                reservationCode: (data as any)?.reservation_code ?? '',
                propertyTitle,
                roomTitle,
            });
        } catch (e: any) {
            const msg = typeof e?.message === 'string' ? e.message : 'Failed to confirm reservation';
            setError(msg.toLowerCase().includes('no availability') ? 'No availability for this room type.' : msg);
        } finally {
            setSubmitting(false);
        }
    };

    const [nights, setNights] = React.useState(0);

    React.useEffect(() => {
        if (checkIn && checkOut) {
            const start = new Date(checkIn);
            const end = new Date(checkOut);
            if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                setNights(diffDays);
            } else {
                setNights(0);
            }
        }
    }, [checkIn, checkOut]);

    const estimatedTotal = (pricePerNight || 0) * nights;
    const serviceFee = Math.round(estimatedTotal * 0.12); // Mock 12% service fee
    const taxes = Math.round(estimatedTotal * 0.08); // Mock 8% taxes
    const finalTotal = estimatedTotal + serviceFee + taxes;

    return (
        <View style={{ flex: 1, backgroundColor: theme.background.val }}>
            <View style={{ paddingTop: insets.top }}>
                <XStack paddingHorizontal="$2" paddingVertical="$2" alignItems="center">
                    <Button variant="outline" onPress={() => navigation.goBack()} size="$3" icon={<Icon name="arrow-left" size={20} />} chromeless>
                        Back
                    </Button>
                    <Text variant="header" style={{ flex: 1, fontWeight: '700', marginRight: 48, textAlign: 'center' }}>
                        Confirm your booking
                    </Text>
                </XStack>
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <Animated.ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: ctaHeight + 32 + insets.bottom, gap: 24 }}>

                    {/* Order Summary Card */}
                    <Card backgroundColor="$surface" padding="$4" borderRadius="$4" elevation="$1">
                        <XStack gap="$3">
                            <View style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: theme.surface.val, alignItems: 'center', justifyContent: 'center' }}>
                                <Text variant="header">🏠</Text>
                            </View>
                            <YStack flex={1}>
                                <Text variant="title" style={{ fontWeight: '700', color: '$onSurface' }}>{propertyTitle}</Text>
                                <Text variant="body" style={{ color: '$onSurface', marginTop: 2 }}>{roomTitle}</Text>
                                <Text variant="body" style={{ color: '$onSurfaceVariant', marginTop: 4 }}>
                                    {pricePerNight != null && pricePerNight > 0 ? `$${pricePerNight} / night` : 'Price TBD'}
                                </Text>
                            </YStack>
                        </XStack>
                    </Card>

                    {/* Dates Section */}
                    <YStack gap="$3">
                        <Text variant="title" style={{ fontWeight: '700' }}>Dates</Text>
                        <XStack gap="$3">
                            <YStack flex={1} gap="$2">
                                <Text variant="label">Check-in</Text>
                                <Input
                                    value={checkIn}
                                    onChangeText={setCheckIn}
                                    placeholder="YYYY-MM-DD"
                                />
                            </YStack>
                            <YStack flex={1} gap="$2">
                                <Text variant="label">Check-out</Text>
                                <Input
                                    value={checkOut}
                                    onChangeText={setCheckOut}
                                    placeholder="YYYY-MM-DD"
                                />
                            </YStack>
                        </XStack>
                    </YStack>

                    {/* Guest Form Section */}
                    <YStack gap="$3">
                        <Text variant="title" style={{ fontWeight: '700' }}>Guest Details</Text>
                        <XStack gap="$3">
                            <YStack flex={1} gap="$2">
                                <Text variant="label">First Name</Text>
                                <Input value={firstName} onChangeText={setFirstName} />
                            </YStack>
                            <YStack flex={1} gap="$2">
                                <Text variant="label">Last Name</Text>
                                <Input value={lastName} onChangeText={setLastName} />
                            </YStack>
                        </XStack>
                        <YStack gap="$2">
                            <Text variant="label">Email</Text>
                            <Input value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                        </YStack>
                        <YStack gap="$2">
                            <Text variant="label">Mobile Phone</Text>
                            <Input value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                        </YStack>
                        <YStack gap="$2">
                            <Text variant="label">Country/Region</Text>
                            <Input value={country} onChangeText={setCountry} />
                        </YStack>
                    </YStack>

                    {/* Price Breakdown */}
                    <YStack gap="$2">
                        <Text variant="title" style={{ fontWeight: '700' }}>Price Summary</Text>

                        <XStack justifyContent="space-between">
                            <Text variant="body" style={{ color: '$onSurfaceVariant' }}>
                                {nights > 0 ? `$${pricePerNight} x ${nights} nights` : 'Add dates to see total'}
                            </Text>
                            <Text variant="body" style={{ color: '$onSurface' }}>
                                {nights > 0 ? `$${estimatedTotal}` : '--'}
                            </Text>
                        </XStack>

                        {nights > 0 && (
                            <>
                                <XStack justifyContent="space-between">
                                    <Text variant="body" style={{ color: '$onSurfaceVariant' }}>Service fee</Text>
                                    <Text variant="body" style={{ color: '$onSurface' }}>${serviceFee}</Text>
                                </XStack>
                                <XStack justifyContent="space-between">
                                    <Text variant="body" style={{ color: '$onSurfaceVariant' }}>Taxes</Text>
                                    <Text variant="body" style={{ color: '$onSurface' }}>${taxes}</Text>
                                </XStack>
                            </>
                        )}

                        <View style={{ height: 1, backgroundColor: theme.outline.val, marginVertical: 8 }} />

                        <XStack justifyContent="space-between" alignItems="center">
                            <Text variant="title" style={{ fontWeight: '700' }}>Total</Text>
                            <Text variant="header" style={{ fontWeight: '700', color: '$primary' }}>
                                {nights > 0 ? `$${finalTotal}` : '--'}
                            </Text>
                        </XStack>
                    </YStack>

                    {error ? (
                        <Card padding="$3" borderRadius="$2" backgroundColor="$errorContainer">
                            <Text variant="body" style={{ color: '$onErrorContainer', fontWeight: '700' }}>
                                {error}
                            </Text>
                        </Card>
                    ) : null}
                </Animated.ScrollView>

                {/* Sticky Footer */}
                <Card
                    elevation="$4"
                    position="absolute"
                    left={0}
                    right={0}
                    bottom={0}
                    padding="$4"
                    paddingBottom={Math.max(insets.bottom, 16)}
                    backgroundColor="$surface"
                    borderTopWidth={1}
                    borderTopColor="$outline"
                    borderRadius={0}
                >
                    <Button
                        variant="primary"
                        disabled={!canSubmit || submitting}
                        onPress={onConfirm}
                        borderRadius="$10"
                        height="$5"
                    >
                        {submitting ? 'Confirming…' : `Confirm • ${nights > 0 ? '$' + finalTotal : 'Book'}`}
                    </Button>
                </Card>
            </KeyboardAvoidingView>
        </View>
    );
}


