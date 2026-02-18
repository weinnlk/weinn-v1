import React from 'react';
import { View, Animated, Alert } from 'react-native';
import { Text, Button, Input, Card, XStack, YStack, Separator, IconButton } from '@weinn/ui';
import { WizardStepShell } from '../../components/WizardStepShell';
import { ListingDraftV3 } from '../../types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from 'tamagui';

export function HostWizardV3HostVerificationScreen({
    navigation,
    draft,
    setDraft,
}: {
    navigation: any;
    draft: ListingDraftV3;
    setDraft: (d: ListingDraftV3) => void;
}) {
    const scrollY = React.useRef(new Animated.Value(0)).current;
    const theme = useTheme();

    // Simple validation
    const canContinue =
        !!draft.ownerFirstName?.trim() &&
        !!draft.ownerLastName?.trim() &&
        !!draft.businessName?.trim() &&
        !!draft.businessAddress?.trim();

    return (
        <WizardStepShell
            title="Verification"
            navigation={navigation}
            scrollY={scrollY}
            onNext={() => navigation.navigate('WizardV3ReviewSubmit')}
            nextLabel="Review & Submit"
            nextDisabled={!canContinue}
        >
            <Text variant="headlineSmall" fontWeight="bold" color="$primary" mb="$2">Almost done!</Text>
            <Text variant="bodyMedium" color="$onSurfaceVariant" mb="$4">We just need a few details to verify you as a host.</Text>

            <Card p="$3" borderRadius={12} backgroundColor="$surfaceVariant" mb="$4" variant="filled">
                <Text variant="titleMedium" fontWeight="600" mb="$3">Personal details</Text>
                <YStack gap="$3">
                    <YStack>
                        <Text variant="label" mb="$2">First name</Text>
                        <Input
                            value={draft.ownerFirstName ?? ''}
                            onChangeText={(t) => setDraft({ ...draft, ownerFirstName: t, updatedAt: new Date().toISOString() })}
                        />
                    </YStack>
                    <YStack>
                        <Text variant="label" mb="$2">Last name</Text>
                        <Input
                            value={draft.ownerLastName ?? ''}
                            onChangeText={(t) => setDraft({ ...draft, ownerLastName: t, updatedAt: new Date().toISOString() })}
                        />
                    </YStack>
                </YStack>
            </Card>

            <Card p="$3" borderRadius={12} backgroundColor="$surfaceVariant" variant="filled">
                <Text variant="titleMedium" fontWeight="600" mb="$3">Business details</Text>
                <YStack gap="$3">
                    <YStack>
                        <Text variant="label" mb="$2">Property/Business Legal Name</Text>
                        <Input
                            value={draft.businessName ?? ''}
                            onChangeText={(t) => setDraft({ ...draft, businessName: t, updatedAt: new Date().toISOString() })}
                            placeholder="e.g. My Hotel Pvt Ltd or John Doe"
                        />
                    </YStack>
                    <YStack>
                        <Text variant="label" mb="$2">Registered Address</Text>
                        <Input
                            value={draft.businessAddress ?? ''}
                            onChangeText={(t) => setDraft({ ...draft, businessAddress: t, updatedAt: new Date().toISOString() })}
                        />
                    </YStack>
                    <YStack>
                        <Text variant="label" mb="$2">City</Text>
                        <Input
                            value={draft.businessCity ?? ''}
                            onChangeText={(t) => setDraft({ ...draft, businessCity: t, updatedAt: new Date().toISOString() })}
                        />
                    </YStack>
                    <YStack>
                        <Text variant="label" mb="$2">Country</Text>
                        <Input
                            value={draft.businessCountry ?? ''}
                            onChangeText={(t) => setDraft({ ...draft, businessCountry: t, updatedAt: new Date().toISOString() })}
                        />
                    </YStack>
                </YStack>
            </Card>
        </WizardStepShell>
    );
}

export function HostWizardV3ReviewSubmitScreen({
    navigation,
    draft,
    onSubmit,
}: {
    navigation: any;
    draft: ListingDraftV3;
    onSubmit: () => Promise<void>;
}) {
    const scrollY = React.useRef(new Animated.Value(0)).current;
    const [submitting, setSubmitting] = React.useState(false);
    const theme = useTheme();

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await onSubmit();
            // Success is handled by parent or navigation
        } catch (e: any) {
            Alert.alert('Error', e?.message ?? 'Failed to submit listing');
            setSubmitting(false);
        }
    };

    const ReviewItem = ({ title, description, icon, onPress }: any) => (
        <Card
            style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}
            variant="elevated"
            onPress={onPress}
        >
            <XStack alignItems="center" p="$3" gap="$3">
                <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.secondaryContainer.get() }}>
                    <Icon name={icon} color={theme.onSecondaryContainer.get()} size={20} />
                </View>
                <YStack flex={1}>
                    <Text variant="bodyMedium" color="$onSurfaceVariant">{title}</Text>
                    <Text variant="titleMedium" fontWeight="600">{description}</Text>
                </YStack>
                <Icon name="chevron-right" size={24} color={theme.onSurfaceVariant.get()} />
            </XStack>
        </Card>
    );

    return (
        <WizardStepShell
            title="Review"
            navigation={navigation}
            scrollY={scrollY}
            onNext={handleSubmit}
            nextLabel={submitting ? 'Submitting...' : 'Submit Listing'}
            nextDisabled={submitting}
        >
            <Text variant="headlineSmall" fontWeight="bold" color="$primary" mb="$2">Review your listing</Text>
            <Text variant="bodyMedium" color="$onSurfaceVariant" mb="$4">Check everything is correct before submitting.</Text>

            <Text variant="titleMedium" fontWeight="600" color="$primary" mb="$3">Property</Text>
            <ReviewItem
                title="Name"
                description={draft.propertyName ?? 'Not set'}
                icon="pencil"
                onPress={() => navigation.navigate('WizardV3About')}
            />
            <ReviewItem
                title="Category"
                description={draft.propertyTypeLabel ?? 'Not set'}
                icon="shape"
                onPress={() => navigation.navigate('WizardV3Start')}
            />
            <ReviewItem
                title="Location"
                description={draft.locationAddress ?? 'Not set'}
                icon="map-marker"
                onPress={() => navigation.navigate('WizardV3Location')}
            />

            <Text variant="titleMedium" fontWeight="600" color="$primary" mt="$3" mb="$3">Details</Text>

            {draft.propertyCategory === 'villa' || draft.propertyCategory === 'apartment' ? (
                <ReviewItem
                    title="Structure"
                    description={`${draft.villaBedrooms?.length ?? 0} bedrooms • ${draft.villaBathrooms ?? 0} bathrooms`}
                    icon="home-floor-g"
                    onPress={() => navigation.navigate('WizardV3VillaDetails')}
                />
            ) : (
                <ReviewItem
                    title="Rooms"
                    description={`${draft.rooms?.length ?? 0} room types`}
                    icon="bed"
                    onPress={() => navigation.navigate('WizardV3RoomSummary')}
                />
            )}

            <ReviewItem
                title="Amenities"
                description={`${(draft.amenities?.length ?? 0)} amenities selected`}
                icon="wifi"
                onPress={() => navigation.navigate('WizardV3Amenities')}
            />
            <ReviewItem
                title="Photos"
                description={`${(draft.propertyPhotoUris?.length ?? 0)} photos`}
                icon="camera"
                onPress={() => navigation.navigate('WizardV3Photos')}
            />

            <Text variant="bodySmall" textAlign="center" color="$onSurfaceDisabled" mt="$4">
                By selecting 'Submit Listing', you agree to WeInn's Terms affecting hosts.
            </Text>
        </WizardStepShell>
    );
}
