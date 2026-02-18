import React from 'react';
import { View, Image, Animated, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Text, Button, Input, Card, XStack, YStack, Separator, Spinner, Chip } from '@weinn/ui';
import { WizardStepShell } from '../../components/WizardStepShell';
import { ListingDraftV3, WizardV3PropertyCategory } from '../../types';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from 'tamagui';

export function HostWizardV3StartScreen({
    navigation,
    route,
    draft,
    setDraft,
    onEnsureDraftRow,
    onLoadDraftById,
}: {
    navigation: any;
    route: any;
    draft: ListingDraftV3;
    setDraft: (d: ListingDraftV3) => void;
    onEnsureDraftRow: () => Promise<void>;
    onLoadDraftById: (propertyId: string) => Promise<ListingDraftV3>;
}) {
    const scrollY = React.useRef(new Animated.Value(0)).current;
    const didInitRef = React.useRef(false);
    const theme = useTheme();

    const resumeRouteFromDraft = React.useCallback((d: ListingDraftV3): string => {
        if (!d.propertyCategory) return 'WizardV3Start';
        if (!d.locationQuery) return 'WizardV3Location';
        if (!d.locationPinConfirmed) return 'WizardV3Pin';
        if (!d.propertyName) return 'WizardV3About';
        if (!d.amenities || d.amenities.length === 0) return 'WizardV3Amenities';
        if (!d.propertyPhotoUris || d.propertyPhotoUris.length === 0) return 'WizardV3Photos';
        if (d.propertyCategory === 'villa' || d.propertyCategory === 'apartment') {
            if (!d.villaBedrooms || d.villaBedrooms.length === 0) return 'WizardV3VillaDetails';
            if (!d.villaGuestCount || d.villaGuestCount <= 0) return 'WizardV3VillaDetails';
            if (!d.villaBathrooms || d.villaBathrooms <= 0) return 'WizardV3VillaDetails';
            if (!d.villaPricePerNight || !String(d.villaPricePerNight).trim()) return 'WizardV3VillaPrice';
        } else {
            if (!d.rooms || d.rooms.length === 0) return 'WizardV3RoomSummary';
        }
        if (!d.ownerFirstName || !d.ownerLastName || !d.businessName || !d.businessAddress) return 'WizardV3HostVerification';
        return 'WizardV3ReviewSubmit';
    }, []);

    React.useEffect(() => {
        if (didInitRef.current) return;
        didInitRef.current = true;

        const propertyId = route?.params?.propertyId as string | undefined;
        if (propertyId) {
            onLoadDraftById(propertyId)
                .then((loaded) => {
                    const target = resumeRouteFromDraft(loaded);
                    if (target !== 'WizardV3Start') navigation.navigate(target);
                })
                .catch(() => { });
            return;
        }

        onEnsureDraftRow().catch(() => { });
    }, [draft, navigation, onEnsureDraftRow, onLoadDraftById, resumeRouteFromDraft, route?.params?.propertyId]);

    const selectCategory = (cat: WizardV3PropertyCategory, label: string) => {
        setDraft({ ...draft, propertyCategory: cat, propertyTypeLabel: label, updatedAt: new Date().toISOString() });
    };

    const categories = [
        { id: 'hotel', label: 'Hotel', desc: 'A hotel where guests book rooms.', icon: 'office-building' },
        { id: 'villa', label: 'Villa', desc: 'A standalone villa where guests typically rent the entire place.', icon: 'home-variant' },
        { id: 'resort', label: 'Resort', desc: 'A resort where guests book rooms.', icon: 'island' },
        { id: 'apartment', label: 'Apartment', desc: 'An apartment listing.', icon: 'home-city' },
        { id: 'homestay', label: 'Homestay', desc: 'A homestay listing.', icon: 'home-heart' },
    ] as const;

    const selectedCategory = draft.propertyCategory;
    const canContinue = !!selectedCategory;

    return (
        <WizardStepShell
            title="Get started"
            navigation={navigation}
            scrollY={scrollY}
            onNext={() => navigation.navigate('WizardV3ConfirmType')}
            nextLabel="Continue"
            nextDisabled={!canContinue}
        >
            <Text variant="headlineMedium" fontWeight="bold" color="$primary" mb="$2">List your property</Text>
            <Text variant="bodyLarge" color="$onSurfaceVariant" mb="$4">Select the type of property you want to list.</Text>

            <YStack gap="$3">
                {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    const containerColor = isSelected ? '$primaryContainer' : '$surface';
                    const contentColor = isSelected ? '$onPrimaryContainer' : '$onSurface';
                    const descColor = isSelected ? '$onPrimaryContainer' : '$onSurfaceVariant';
                    const borderColor = isSelected ? '$primary' : 'transparent';
                    const borderWidth = isSelected ? 2 : 0;

                    return (
                        <Card
                            key={cat.id}
                            style={{ borderRadius: 12, overflow: 'hidden', backgroundColor: theme[containerColor.substring(1)]?.get() || containerColor, borderWidth, borderColor: theme[borderColor.substring(1)]?.get() || borderColor }}
                            variant={isSelected ? 'filled' : 'elevated'}
                            onPress={() => selectCategory(cat.id, cat.label)}
                        >
                            <XStack p="$4" alignItems="center" gap="$3">
                                <View
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 24,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: isSelected ? theme.primary.get() : theme.secondaryContainer.get()
                                    }}
                                >
                                    <Icon name={cat.icon} size={24} color={isSelected ? theme.onPrimary.get() : theme.onSecondaryContainer.get()} />
                                </View>
                                <YStack flex={1}>
                                    <Text variant="titleMedium" fontWeight="bold" style={{ color: theme[contentColor.substring(1)]?.get() }}>{cat.label}</Text>
                                    <Text variant="bodyMedium" style={{ color: theme[descColor.substring(1)]?.get() }}>{cat.desc}</Text>
                                </YStack>
                                {isSelected ? (
                                    <Icon name="check-circle" size={24} color={theme[contentColor.substring(1)]?.get()} />
                                ) : (
                                    <Icon name="chevron-right" size={24} color={theme.onSurfaceVariant.get()} />
                                )}
                            </XStack>
                        </Card>
                    );
                })}
            </YStack>
        </WizardStepShell>
    );
}

export function HostWizardV3ConfirmTypeScreen({ navigation, draft }: { navigation: any; draft: ListingDraftV3 }) {
    const scrollY = React.useRef(new Animated.Value(0)).current;
    const theme = useTheme();

    return (
        <WizardStepShell title="Confirm" navigation={navigation} scrollY={scrollY} onNext={() => navigation.navigate('WizardV3Location')} nextLabel="Continue">
            <YStack alignItems="center" gap="$5" py="$8">
                <View style={{ width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.primaryContainer?.get() }}>
                    <Icon name="check-bold" size={40} color={theme.onPrimaryContainer?.get()} />
                </View>
                <YStack alignItems="center" gap="$2">
                    <Text variant="headlineSmall" textAlign="center">You're listing:</Text>
                    <Text variant="headlineMedium" textAlign="center" color="$primary" fontWeight="bold">
                        {draft.propertyTypeLabel ?? 'A property'}
                    </Text>
                </YStack>
                <Button variant="outline" onPress={() => navigation.goBack()} mt="$3">
                    No, I need to make a change
                </Button>
            </YStack>
        </WizardStepShell>
    );
}

export function HostWizardV3LocationScreen({
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
    const googleMapsApiKey = (Constants.expoConfig as any)?.extra?.googleMapsApiKey as string | undefined;
    const [query, setQuery] = React.useState(draft.locationQuery ?? '');
    const [results, setResults] = React.useState<{ place_id: string; description: string }[]>([]);
    const [status, setStatus] = React.useState<string>('');

    const fetchAutocomplete = React.useCallback(
        async (q: string) => {
            if (!googleMapsApiKey || !q.trim()) {
                setResults([]);
                return;
            }
            try {
                const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(q)}&key=${googleMapsApiKey}`;
                const res = await fetch(url);
                const json = (await res.json()) as any;
                const preds = (json?.predictions ?? []) as any[];
                setResults(preds.map((p) => ({ place_id: p.place_id, description: p.description })));
            } catch {
                setResults([]);
            }
        },
        [googleMapsApiKey]
    );

    React.useEffect(() => {
        const t = setTimeout(() => {
            fetchAutocomplete(query);
        }, 250);
        return () => clearTimeout(t);
    }, [fetchAutocomplete, query]);

    const selectPlace = React.useCallback(
        async (placeId: string, description: string) => {
            if (!googleMapsApiKey) return;
            try {
                const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&key=${googleMapsApiKey}`;
                const res = await fetch(url);
                const json = (await res.json()) as any;
                const r = json?.result;
                const loc = r?.geometry?.location;
                const lat = typeof loc?.lat === 'number' ? loc.lat : undefined;
                const lng = typeof loc?.lng === 'number' ? loc.lng : undefined;
                setDraft({
                    ...draft,
                    locationQuery: description,
                    locationAddress: r?.formatted_address ?? description,
                    locationLat: lat,
                    locationLng: lng,
                    locationPinConfirmed: false,
                    updatedAt: new Date().toISOString(),
                });
                setQuery(description);
                setResults([]);
            } catch {
                setDraft({ ...draft, locationQuery: description, updatedAt: new Date().toISOString() });
            }
        },
        [draft, googleMapsApiKey, setDraft]
    );

    const useMyLocation = React.useCallback(async () => {
        try {
            setStatus('');
            const perm = await Location.requestForegroundPermissionsAsync();
            if (!perm.granted) return;
            const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            let nextAddress: string | undefined;
            let nextCity: string | undefined;
            let nextPostalCode: string | undefined;
            try {
                const geos = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
                const g = geos?.[0] as any;
                if (g) {
                    nextCity = g.city ?? g.subregion ?? undefined;
                    nextPostalCode = g.postalCode ?? undefined;
                    const parts = [g.name, g.street, g.district, g.city, g.region, g.country].filter(Boolean);
                    if (parts.length) nextAddress = parts.join(', ');
                }
            } catch {
                // ignore reverse geocode errors
            }

            const nextDraft: ListingDraftV3 = {
                ...draft,
                locationLat: lat,
                locationLng: lng,
                locationPinConfirmed: false,
                updatedAt: new Date().toISOString(),
            };
            if (nextAddress) {
                nextDraft.locationQuery = nextAddress;
                nextDraft.locationAddress = nextAddress;
                setQuery(nextAddress);
            }
            if (nextCity && !nextDraft.city) nextDraft.city = nextCity;
            if (nextPostalCode && !nextDraft.postalCode) nextDraft.postalCode = nextPostalCode;
            setDraft(nextDraft);
        } catch {
            setStatus('Unable to access your location. Please check permissions and try again.');
        }
    }, [draft, setDraft]);

    const ensureCoordinates = React.useCallback(async () => {
        if (typeof draft.locationLat === 'number' && typeof draft.locationLng === 'number') return true;
        const q = (draft.locationAddress ?? draft.locationQuery ?? '').trim();
        if (!q) return false;
        try {
            const geos = await Location.geocodeAsync(q);
            const g = geos?.[0];
            if (!g) return false;
            setDraft({
                ...draft,
                locationLat: g.latitude,
                locationLng: g.longitude,
                locationPinConfirmed: false,
                updatedAt: new Date().toISOString(),
            });
            return true;
        } catch {
            return false;
        }
    }, [draft, setDraft]);

    const canContinue = !!(draft.locationAddress ?? draft.locationQuery)?.trim();

    return (
        <WizardStepShell
            title="Property location"
            navigation={navigation}
            scrollY={scrollY}
            onNext={() => {
                (async () => {
                    setStatus('');
                    const ok = await ensureCoordinates();
                    if (!ok) {
                        setStatus('Please select an address or use your current location.');
                        return;
                    }
                    navigation.navigate('WizardV3Pin');
                })().catch(() => {
                    setStatus('Failed to resolve location. Please try again.');
                });
            }}
            nextLabel="Continue"
            nextDisabled={!canContinue}
        >
            <Text variant="titleMedium" mb="$3">Where is your property located?</Text>
            {status ? <Text color="$error" mb="$2">{status}</Text> : null}

            <YStack mb="$3">
                <Text variant="label" mb="$2">Country/region</Text>
                <Input
                    value={draft.country ?? ''}
                    onChangeText={(t) => setDraft({ ...draft, country: t, updatedAt: new Date().toISOString() })}
                />
            </YStack>

            <YStack mb="$3" zIndex={1000}>
                <Text variant="label" mb="$2">Find your address</Text>
                <Input
                    value={query}
                    onChangeText={(t) => {
                        setQuery(t);
                        setDraft({ ...draft, locationQuery: t, updatedAt: new Date().toISOString() });
                    }}
                    placeholder="Search for your address"
                />
                <Button
                    onPress={useMyLocation}
                    circular
                    size="$3"
                    icon={<Icon name="crosshairs-gps" size={20} color={theme.primary.get()} />}
                    variant="ghost"
                    style={{ position: 'absolute', right: 8, top: 32 }}
                />

                {results.length ? (
                    <Card style={{ position: 'absolute', top: 70, left: 0, right: 0, zIndex: 1000, borderRadius: 8, overflow: 'hidden' }} variant="elevated">
                        <ScrollView style={{ maxHeight: 200 }} keyboardShouldPersistTaps="handled">
                            {results.map((r, idx) => (
                                <React.Fragment key={r.place_id}>
                                    <TouchableOpacity onPress={() => selectPlace(r.place_id, r.description)} style={{ padding: 16 }}>
                                        <Text variant="bodyMedium">{r.description}</Text>
                                    </TouchableOpacity>
                                    {idx < results.length - 1 && <Separator />}
                                </React.Fragment>
                            ))}
                        </ScrollView>
                    </Card>
                ) : null}
            </YStack>

            <YStack mb="$3">
                <Text variant="label" mb="$2">Add apartment or floor number (optional)</Text>
                <Input
                    value={draft.addressLine2 ?? ''}
                    onChangeText={(t) => setDraft({ ...draft, addressLine2: t, updatedAt: new Date().toISOString() })}
                />
            </YStack>

            <XStack gap="$3">
                <YStack flex={1}>
                    <Text variant="label" mb="$2">Post code</Text>
                    <Input
                        value={draft.postalCode ?? ''}
                        onChangeText={(t) => setDraft({ ...draft, postalCode: t, updatedAt: new Date().toISOString() })}
                    />
                </YStack>
                <YStack flex={1}>
                    <Text variant="label" mb="$2">City</Text>
                    <Input
                        value={draft.city ?? ''}
                        onChangeText={(t) => setDraft({ ...draft, city: t, updatedAt: new Date().toISOString() })}
                    />
                </YStack>
            </XStack>
        </WizardStepShell>
    );
}

export function HostWizardV3PinScreen({
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
    const initialRegion = {
        latitude: draft.locationLat ?? 7.8731,
        longitude: draft.locationLng ?? 80.7718,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
    };
    const [pin, setPin] = React.useState<{ latitude: number; longitude: number } | null>(
        draft.locationLat != null && draft.locationLng != null ? { latitude: draft.locationLat, longitude: draft.locationLng } : null
    );

    const canContinue = !!draft.locationPinConfirmed;

    return (
        <WizardStepShell
            title="Pin location"
            navigation={navigation}
            scrollY={scrollY}
            onNext={() => navigation.navigate('WizardV3About')}
            nextLabel="Continue"
            nextDisabled={!canContinue}
        >
            <Text variant="bodyLarge" mb="$3">Confirm the exact location of your property.</Text>

            <Card style={{ height: 360, borderRadius: 16, overflow: 'hidden', marginBottom: 16 }} variant="elevated">
                <MapView
                    style={{ flex: 1 }}
                    initialRegion={initialRegion as any}
                    onPress={(e) => {
                        const c = e.nativeEvent.coordinate;
                        setPin({ latitude: c.latitude, longitude: c.longitude });
                        setDraft({ ...draft, locationPinConfirmed: false, updatedAt: new Date().toISOString() });
                    }}
                >
                    {pin ? (
                        <Marker
                            coordinate={pin as any}
                            draggable
                            onDragEnd={(e) => {
                                const c = e.nativeEvent.coordinate;
                                setPin({ latitude: c.latitude, longitude: c.longitude });
                                setDraft({ ...draft, locationPinConfirmed: false, updatedAt: new Date().toISOString() });
                            }}
                        />
                    ) : null}
                </MapView>
            </Card>

            <YStack alignItems="center">
                <Text variant="bodyMedium" color="$onSurfaceVariant" textAlign="center" mb="$3">
                    Drag the map to position the pin.
                </Text>
                <Button
                    variant={draft.locationPinConfirmed ? 'primary' : 'secondary'}
                    icon={draft.locationPinConfirmed ? <Icon name="check" size={20} color="white" /> : <Icon name="map-marker-check" size={20} color={theme.onSecondary.get()} />}
                    disabled={!pin}
                    onPress={() => {
                        if (!pin) return;
                        setDraft({
                            ...draft,
                            locationLat: pin.latitude,
                            locationLng: pin.longitude,
                            locationPinConfirmed: true,
                            updatedAt: new Date().toISOString(),
                        });
                    }}
                >
                    {draft.locationPinConfirmed ? 'Location Confirmed' : 'Confirm Pin Location'}
                </Button>
            </YStack>
        </WizardStepShell>
    );
}

export function HostWizardV3AboutScreen({
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
    const canContinue = !!draft.propertyName?.trim();

    return (
        <WizardStepShell
            title={
                draft.propertyCategory === 'villa'
                    ? 'About your villa'
                    : draft.propertyCategory === 'apartment'
                        ? 'About your apartment'
                        : draft.propertyCategory === 'homestay'
                            ? 'About your homestay'
                            : draft.propertyCategory === 'resort'
                                ? 'About your resort'
                                : 'About your hotel'
            }
            navigation={navigation}
            scrollY={scrollY}
            onNext={() => navigation.navigate('WizardV3Amenities')}
            nextLabel="Continue"
            nextDisabled={!canContinue}
        >
            <Text variant="titleMedium" mb="$3">Tell us about your property.</Text>

            <YStack mb="$4">
                <Text variant="label" mb="$2">Property name</Text>
                <Input
                    value={draft.propertyName ?? ''}
                    onChangeText={(t) => setDraft({ ...draft, propertyName: t, updatedAt: new Date().toISOString() })}
                />
            </YStack>

            <Card p="$3" borderRadius={12} backgroundColor="$surfaceVariant" mb="$4" variant="filled">
                <Text variant="titleMedium" fontWeight="600" mb="$3">Star rating</Text>
                <XStack flexWrap="wrap" gap="$2">
                    {(['na', '1', '2', '3', '4', '5'] as const).map((v) => {
                        const isSelected = (draft.starRating ?? 'na') === v;
                        return (
                            <Chip
                                key={v}
                                onPress={() => setDraft({ ...draft, starRating: v, updatedAt: new Date().toISOString() })}
                                style={{
                                    backgroundColor: isSelected ? theme.primary.get() : theme.surface.get(),
                                    borderColor: isSelected ? theme.primary.get() : theme.outline.get(),
                                    borderWidth: 1,
                                }}
                            >
                                <Text style={{ color: isSelected ? theme.onPrimary.get() : theme.onSurface.get() }}>
                                    {v === 'na' ? 'N/A' : v}
                                </Text>
                            </Chip>
                        );
                    })}
                </XStack>
            </Card>

            <Card p="$3" borderRadius={12} backgroundColor="$surfaceVariant" variant="filled">
                <Text variant="titleMedium" fontWeight="600" mb="$3">Are you part of a group or chain?</Text>
                <YStack gap="$3">
                    {(['yes', 'no'] as const).map((opt) => {
                        const isYes = opt === 'yes';
                        const isSelected = (isYes && draft.partOfGroupOrChain) || (!isYes && !draft.partOfGroupOrChain);
                        const containerColor = isSelected ? '$primaryContainer' : '$surface';
                        const contentColor = isSelected ? '$onPrimaryContainer' : '$onSurface';
                        const borderColor = isSelected ? '$primary' : 'transparent';
                        const borderWidth = isSelected ? 2 : 0;

                        return (
                            <Card
                                key={opt}
                                style={{ borderRadius: 12, overflow: 'hidden', backgroundColor: theme[containerColor.substring(1)]?.get() || containerColor, borderWidth, borderColor: theme[borderColor.substring(1)]?.get() || borderColor }}
                                variant={isSelected ? 'filled' : 'elevated'}
                                onPress={() => setDraft({ ...draft, partOfGroupOrChain: isYes, updatedAt: new Date().toISOString() })}
                            >
                                <XStack p="$3" alignItems="center" justifyContent="space-between">
                                    <Text variant="titleMedium" fontWeight={isSelected ? '600' : '400'} style={{ color: theme[contentColor.substring(1)]?.get() }}>
                                        {isYes ? 'Yes' : 'No'}
                                    </Text>
                                    {isSelected ? (
                                        <Icon name="check-circle" size={24} color={theme[contentColor.substring(1)]?.get()} />
                                    ) : (
                                        <Icon name="circle-outline" size={24} color={theme.onSurfaceVariant.get()} />
                                    )}
                                </XStack>
                            </Card>
                        );
                    })}
                </YStack>
            </Card>
        </WizardStepShell>
    );
}

export function HostWizardV3AmenitiesScreen({
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
    const options = [
        { label: 'Restaurant', icon: 'silverware-fork-knife' },
        { label: 'Room service', icon: 'bell-ring' },
        { label: 'Bar', icon: 'glass-cocktail' },
        { label: '24-hour front desk', icon: 'desk' },
        { label: 'Garden', icon: 'flower' },
        { label: 'Non-smoking rooms', icon: 'smoking-off' },
        { label: 'Free parking', icon: 'car-parking-lights' },
        { label: 'Family rooms', icon: 'human-male-female-child' },
        { label: 'Air conditioning', icon: 'air-conditioner' },
        { label: 'Terrace', icon: 'balcony' },
        { label: 'Laundry', icon: 'washing-machine' },
        { label: 'Internet services', icon: 'web' },
        { label: 'Lift', icon: 'elevator' },
        { label: 'Express check-in/check-out', icon: 'clock-check' },
        { label: 'Safety deposit box', icon: 'safe' },
        { label: 'Currency exchange', icon: 'cash-sync' },
        { label: 'Luggage storage', icon: 'bag-suitcase' },
        { label: 'WiFi', icon: 'wifi' },
        { label: 'Free WiFi', icon: 'wifi-check' },
        { label: 'Outdoor pool', icon: 'pool' },
        { label: 'Designated smoking area', icon: 'smoking' },
    ];
    const canContinue = (draft.amenities ?? []).length > 0;
    const value = draft.amenities ?? [];

    const toggle = (opt: string) => {
        const next = value.includes(opt) ? value.filter((x) => x !== opt) : [...value, opt];
        setDraft({ ...draft, amenities: next, updatedAt: new Date().toISOString() });
    };

    return (
        <WizardStepShell
            title={draft.propertyCategory === 'homestay' ? 'Facilities' : 'Amenities'}
            navigation={navigation}
            scrollY={scrollY}
            onNext={() => navigation.navigate('WizardV3Services')}
            nextLabel="Continue"
            nextDisabled={!canContinue}
        >
            <Text variant="headlineSmall" fontWeight="bold" color="$primary" mb="$2">What do you offer?</Text>
            <Text variant="bodyLarge" color="$onSurfaceVariant" mb="$4">Select all that apply.</Text>

            <YStack gap="$3">
                {options.map((opt) => {
                    const selected = value.includes(opt.label);
                    const containerColor = selected ? '$primaryContainer' : '$surface';
                    const contentColor = selected ? '$onPrimaryContainer' : '$onSurface';
                    const borderColor = selected ? '$primary' : 'transparent';
                    const borderWidth = selected ? 2 : 0;

                    return (
                        <Card
                            key={opt.label}
                            style={{ borderRadius: 12, overflow: 'hidden', backgroundColor: theme[containerColor.substring(1)]?.get() || containerColor, borderWidth, borderColor: theme[borderColor.substring(1)]?.get() || borderColor }}
                            variant={selected ? 'filled' : 'elevated'}
                            onPress={() => toggle(opt.label)}
                        >
                            <XStack p="$3" alignItems="center" gap="$3">
                                <View
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 20,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: selected ? theme.primary.get() : theme.secondaryContainer.get()
                                    }}
                                >
                                    <Icon name={opt.icon} size={20} color={selected ? theme.onPrimary.get() : theme.onSecondaryContainer.get()} />
                                </View>
                                <YStack flex={1}>
                                    <Text variant="titleMedium" fontWeight={selected ? '600' : '400'} style={{ color: theme[contentColor.substring(1)]?.get() }}>{opt.label}</Text>
                                </YStack>
                                {selected ? (
                                    <Icon name="checkbox-marked-circle" size={24} color={theme[contentColor.substring(1)]?.get()} />
                                ) : (
                                    <Icon name="checkbox-blank-circle-outline" size={24} color={theme.onSurfaceVariant.get()} />
                                )}
                            </XStack>
                        </Card>
                    );
                })}
            </YStack>
        </WizardStepShell>
    );
}

export function HostWizardV3ServicesScreen({
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
    const breakfastServed = draft.breakfastServed ?? false;
    const parkingAvailability = draft.parkingAvailability ?? 'no';

    return (
        <WizardStepShell
            title="Services"
            navigation={navigation}
            scrollY={scrollY}
            onNext={() => navigation.navigate('WizardV3Languages')}
            nextLabel="Continue"
        >
            <Card p="$3" borderRadius={12} backgroundColor="$surfaceVariant" mb="$4" variant="filled">
                <Text variant="titleMedium" fontWeight="600" mb="$2">Breakfast</Text>
                <Text variant="bodyMedium" mb="$3">Do you serve breakfast?</Text>
                <YStack gap="$3" mb="$3">
                    {(['yes', 'no'] as const).map((opt) => {
                        const isYes = opt === 'yes';
                        const isSelected = (isYes && breakfastServed) || (!isYes && !breakfastServed);
                        const containerColor = isSelected ? '$primaryContainer' : '$surface';
                        const contentColor = isSelected ? '$onPrimaryContainer' : '$onSurface';
                        const borderColor = isSelected ? '$primary' : 'transparent';
                        const borderWidth = isSelected ? 2 : 0;

                        return (
                            <Card
                                key={opt}
                                style={{ borderRadius: 12, overflow: 'hidden', backgroundColor: theme[containerColor.substring(1)]?.get() || containerColor, borderWidth, borderColor: theme[borderColor.substring(1)]?.get() || borderColor }}
                                variant={isSelected ? 'filled' : 'elevated'}
                                onPress={() => setDraft({ ...draft, breakfastServed: isYes, updatedAt: new Date().toISOString() })}
                            >
                                <XStack p="$3" alignItems="center" justifyContent="space-between">
                                    <Text variant="titleMedium" fontWeight={isSelected ? '600' : '400'} style={{ color: theme[contentColor.substring(1)]?.get() }}>
                                        {isYes ? 'Yes' : 'No'}
                                    </Text>
                                    {isSelected ? (
                                        <Icon name="check-circle" size={24} color={theme[contentColor.substring(1)]?.get()} />
                                    ) : (
                                        <Icon name="circle-outline" size={24} color={theme.onSurfaceVariant.get()} />
                                    )}
                                </XStack>
                            </Card>
                        );
                    })}
                </YStack>

                {breakfastServed ? (
                    <>
                        <Separator mb="$3" />
                        <Text variant="bodyMedium" mb="$3">Is breakfast included in the price?</Text>
                        <YStack gap="$3" mb="$3">
                            {(['yes', 'no'] as const).map((opt) => {
                                const isYes = opt === 'yes';
                                const isSelected = (isYes && draft.breakfastIncluded) || (!isYes && !draft.breakfastIncluded);
                                const containerColor = isSelected ? '$primaryContainer' : '$surface';
                                const contentColor = isSelected ? '$onPrimaryContainer' : '$onSurface';
                                const borderColor = isSelected ? '$primary' : 'transparent';
                                const borderWidth = isSelected ? 2 : 0;

                                return (
                                    <Card
                                        key={opt}
                                        style={{ borderRadius: 12, overflow: 'hidden', backgroundColor: theme[containerColor.substring(1)]?.get() || containerColor, borderWidth, borderColor: theme[borderColor.substring(1)]?.get() || borderColor }}
                                        variant={isSelected ? 'filled' : 'elevated'}
                                        onPress={() => setDraft({ ...draft, breakfastIncluded: isYes, updatedAt: new Date().toISOString() })}
                                    >
                                        <XStack p="$3" alignItems="center" justifyContent="space-between">
                                            <Text variant="titleMedium" fontWeight={isSelected ? '600' : '400'} style={{ color: theme[contentColor.substring(1)]?.get() }}>
                                                {isYes ? 'Yes' : 'No'}
                                            </Text>
                                            {isSelected ? (
                                                <Icon name="check-circle" size={24} color={theme[contentColor.substring(1)]?.get()} />
                                            ) : (
                                                <Icon name="circle-outline" size={24} color={theme.onSurfaceVariant.get()} />
                                            )}
                                        </XStack>
                                    </Card>
                                );
                            })}
                        </YStack>
                        {!draft.breakfastIncluded ? (
                            <YStack>
                                <Text variant="label" mb="$2">Breakfast price per person (LKR)</Text>
                                <Input
                                    value={draft.breakfastPricePerPersonPerDay ?? ''}
                                    onChangeText={(t) =>
                                        setDraft({ ...draft, breakfastPricePerPersonPerDay: t, updatedAt: new Date().toISOString() })
                                    }
                                    keyboardType="numeric"
                                />
                            </YStack>
                        ) : null}
                    </>
                ) : null}
            </Card>

            <Card p="$3" borderRadius={12} backgroundColor="$surfaceVariant" variant="filled">
                <Text variant="titleMedium" fontWeight="600" mb="$2">Parking</Text>
                <Text variant="bodyMedium" mb="$3">Is parking available?</Text>
                <YStack gap="$3">
                    {(['yes_free', 'yes_paid', 'no'] as const).map((opt) => {
                        const labels: Record<string, string> = { yes_free: 'Yes, free', yes_paid: 'Yes, paid', no: 'No' };
                        const isSelected = parkingAvailability === opt;
                        const containerColor = isSelected ? '$primaryContainer' : '$surface';
                        const contentColor = isSelected ? '$onPrimaryContainer' : '$onSurface';
                        const borderColor = isSelected ? '$primary' : 'transparent';
                        const borderWidth = isSelected ? 2 : 0;

                        return (
                            <Card
                                key={opt}
                                style={{ borderRadius: 12, overflow: 'hidden', backgroundColor: theme[containerColor.substring(1)]?.get() || containerColor, borderWidth, borderColor: theme[borderColor.substring(1)]?.get() || borderColor }}
                                variant={isSelected ? 'filled' : 'elevated'}
                                onPress={() => setDraft({ ...draft, parkingAvailability: opt, updatedAt: new Date().toISOString() })}
                            >
                                <XStack p="$3" alignItems="center" justifyContent="space-between">
                                    <Text variant="titleMedium" fontWeight={isSelected ? '600' : '400'} style={{ color: theme[contentColor.substring(1)]?.get() }}>
                                        {labels[opt]}
                                    </Text>
                                    {isSelected ? (
                                        <Icon name="check-circle" size={24} color={theme[contentColor.substring(1)]?.get()} />
                                    ) : (
                                        <Icon name="circle-outline" size={24} color={theme.onSurfaceVariant.get()} />
                                    )}
                                </XStack>
                            </Card>
                        )
                    })}
                </YStack>
            </Card>
        </WizardStepShell>
    );
}

export function HostWizardV3LanguagesScreen({
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
    const options = [
        { label: 'English', icon: 'translate' },
        { label: 'Sinhala', icon: 'translate' },
        { label: 'Tamil', icon: 'translate' },
        { label: 'French', icon: 'translate' },
        { label: 'German', icon: 'translate' },
        { label: 'Hindi', icon: 'translate' },
        { label: 'Italian', icon: 'translate' },
        { label: 'Japanese', icon: 'translate' },
        { label: 'Russian', icon: 'translate' },
        { label: 'Spanish', icon: 'translate' },
        { label: 'Chinese', icon: 'translate' },
        { label: 'Arabic', icon: 'translate' },
    ];
    const value = draft.languages ?? [];

    const toggle = (opt: string) => {
        const next = value.includes(opt) ? value.filter((x) => x !== opt) : [...value, opt];
        setDraft({ ...draft, languages: next, updatedAt: new Date().toISOString() });
    };

    return (
        <WizardStepShell title="Languages" navigation={navigation} scrollY={scrollY} onNext={() => navigation.navigate('WizardV3Rules')} nextLabel="Continue">
            <Text variant="headlineSmall" fontWeight="bold" color="$primary" mb="$2">Languages spoken</Text>
            <Text variant="bodyLarge" color="$onSurfaceVariant" mb="$4">What languages do you or your staff speak?</Text>

            <YStack gap="$3">
                {options.map((opt) => {
                    const selected = value.includes(opt.label);
                    const containerColor = selected ? '$primaryContainer' : '$surface';
                    const contentColor = selected ? '$onPrimaryContainer' : '$onSurface';
                    const borderColor = selected ? '$primary' : 'transparent';
                    const borderWidth = selected ? 2 : 0;

                    return (
                        <Card
                            key={opt.label}
                            style={{ borderRadius: 12, overflow: 'hidden', backgroundColor: theme[containerColor.substring(1)]?.get() || containerColor, borderWidth, borderColor: theme[borderColor.substring(1)]?.get() || borderColor }}
                            variant={selected ? 'filled' : 'elevated'}
                            onPress={() => toggle(opt.label)}
                        >
                            <XStack p="$3" alignItems="center" gap="$3">
                                <View
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 20,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: selected ? theme.primary.get() : theme.secondaryContainer.get()
                                    }}
                                >
                                    <Icon name={opt.icon} size={20} color={selected ? theme.onPrimary.get() : theme.onSecondaryContainer.get()} />
                                </View>
                                <YStack flex={1}>
                                    <Text variant="titleMedium" fontWeight={selected ? '600' : '400'} style={{ color: theme[contentColor.substring(1)]?.get() }}>{opt.label}</Text>
                                </YStack>
                                {selected ? (
                                    <Icon name="checkbox-marked-circle" size={24} color={theme[contentColor.substring(1)]?.get()} />
                                ) : (
                                    <Icon name="checkbox-blank-circle-outline" size={24} color={theme.onSurfaceVariant.get()} />
                                )}
                            </XStack>
                        </Card>
                    );
                })}
            </YStack>
        </WizardStepShell>
    );
}

export function HostWizardV3RulesScreen({
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
    const canContinue =
        !!draft.checkInFrom?.trim() && !!draft.checkInUntil?.trim() && !!draft.checkOutFrom?.trim() && !!draft.checkOutUntil?.trim();
    const childrenAllowed = draft.childrenAllowed ?? true;
    const petsAllowed = draft.petsAllowed ?? 'no';

    return (
        <WizardStepShell
            title="House rules"
            navigation={navigation}
            scrollY={scrollY}
            onNext={() => navigation.navigate('WizardV3Photos')}
            nextLabel="Continue"
            nextDisabled={!canContinue}
        >
            <Card p="$3" borderRadius={12} backgroundColor="$surfaceVariant" mb="$4" variant="filled">
                <Text variant="titleMedium" fontWeight="600" mb="$3">Check-in</Text>
                <XStack gap="$3">
                    <YStack flex={1}>
                        <Text variant="label" mb="$2">From</Text>
                        <Input
                            value={draft.checkInFrom ?? ''}
                            onChangeText={(t) => setDraft({ ...draft, checkInFrom: t, updatedAt: new Date().toISOString() })}
                            placeholder="12:00"
                        />
                    </YStack>
                    <YStack flex={1}>
                        <Text variant="label" mb="$2">Until</Text>
                        <Input
                            value={draft.checkInUntil ?? ''}
                            onChangeText={(t) => setDraft({ ...draft, checkInUntil: t, updatedAt: new Date().toISOString() })}
                            placeholder="00:00"
                        />
                    </YStack>
                </XStack>
            </Card>

            <Card p="$3" borderRadius={12} backgroundColor="$surfaceVariant" mb="$4" variant="filled">
                <Text variant="titleMedium" fontWeight="600" mb="$3">Check-out</Text>
                <XStack gap="$3">
                    <YStack flex={1}>
                        <Text variant="label" mb="$2">From</Text>
                        <Input
                            value={draft.checkOutFrom ?? ''}
                            onChangeText={(t) => setDraft({ ...draft, checkOutFrom: t, updatedAt: new Date().toISOString() })}
                            placeholder="00:00"
                        />
                    </YStack>
                    <YStack flex={1}>
                        <Text variant="label" mb="$2">Until</Text>
                        <Input
                            value={draft.checkOutUntil ?? ''}
                            onChangeText={(t) => setDraft({ ...draft, checkOutUntil: t, updatedAt: new Date().toISOString() })}
                            placeholder="11:00"
                        />
                    </YStack>
                </XStack>
            </Card>

            <Card p="$3" borderRadius={12} backgroundColor="$surfaceVariant" mb="$4" variant="filled">
                <Text variant="titleMedium" fontWeight="600" mb="$2">Children</Text>
                <Text variant="bodyMedium" mb="$3">Do you allow children?</Text>
                <XStack gap="$3">
                    <Button
                        variant={childrenAllowed ? 'primary' : 'outline'}
                        onPress={() => setDraft({ ...draft, childrenAllowed: true, updatedAt: new Date().toISOString() })}
                        style={{ flex: 1 }}
                    >
                        Yes
                    </Button>
                    <Button
                        variant={!childrenAllowed ? 'primary' : 'outline'}
                        onPress={() => setDraft({ ...draft, childrenAllowed: false, updatedAt: new Date().toISOString() })}
                        style={{ flex: 1 }}
                    >
                        No
                    </Button>
                </XStack>
            </Card>

            <Card p="$3" borderRadius={12} backgroundColor="$surfaceVariant" variant="filled">
                <Text variant="titleMedium" fontWeight="600" mb="$2">Pets</Text>
                <Text variant="bodyMedium" mb="$3">Do you allow pets?</Text>
                <YStack gap="$3">
                    {(['yes', 'upon_request', 'no'] as const).map((opt) => {
                        const labels: Record<string, string> = { yes: 'Yes', upon_request: 'Upon request', no: 'No' };
                        const isSelected = petsAllowed === opt;
                        const containerColor = isSelected ? '$primaryContainer' : '$surface';
                        const contentColor = isSelected ? '$onPrimaryContainer' : '$onSurface';
                        const borderColor = isSelected ? '$primary' : 'transparent';
                        const borderWidth = isSelected ? 2 : 0;

                        return (
                            <Card
                                key={opt}
                                style={{ borderRadius: 12, overflow: 'hidden', backgroundColor: theme[containerColor.substring(1)]?.get() || containerColor, borderWidth, borderColor: theme[borderColor.substring(1)]?.get() || borderColor }}
                                variant={isSelected ? 'filled' : 'elevated'}
                                onPress={() => setDraft({ ...draft, petsAllowed: opt, updatedAt: new Date().toISOString() })}
                            >
                                <XStack p="$3" alignItems="center" justifyContent="space-between">
                                    <Text variant="titleMedium" fontWeight={isSelected ? '600' : '400'} style={{ color: theme[contentColor.substring(1)]?.get() }}>
                                        {labels[opt]}
                                    </Text>
                                    {isSelected ? (
                                        <Icon name="check-circle" size={24} color={theme[contentColor.substring(1)]?.get()} />
                                    ) : (
                                        <Icon name="circle-outline" size={24} color={theme.onSurfaceVariant.get()} />
                                    )}
                                </XStack>
                            </Card>
                        )
                    })}
                </YStack>
            </Card>
        </WizardStepShell>
    );
}

export function HostWizardV3PhotosScreen({
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
    const photos = draft.propertyPhotoUris ?? [];
    const minMet = photos.length >= 5;

    const { width } = useWindowDimensions();
    const gridMargin = 16;
    const gridGutter = 12;
    const gridCols = 3;
    const gridContentWidth = Math.max(0, width - gridMargin * 2);
    const gridItemSize = Math.max(0, (gridContentWidth - gridGutter * (gridCols - 1)) / gridCols);

    const pickPhotos = async () => {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) return;
        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.8,
            selectionLimit: 0,
        });
        if (res.canceled) return;
        const uris = (res.assets ?? []).map((a) => a.uri).filter(Boolean);
        if (!uris.length) return;
        const nextList = [...photos, ...uris];
        setDraft({ ...draft, propertyPhotoUris: nextList, updatedAt: new Date().toISOString() });
    };

    const removePhoto = (idx: number) => {
        if (idx < 0 || idx >= photos.length) return;
        const nextList = [...photos];
        nextList.splice(idx, 1);
        setDraft({ ...draft, propertyPhotoUris: nextList, updatedAt: new Date().toISOString() });
    };

    return (
        <WizardStepShell
            title="Property photos"
            navigation={navigation}
            scrollY={scrollY}
            onNext={() =>
                navigation.navigate(
                    draft.propertyCategory === 'villa' || draft.propertyCategory === 'apartment' ? 'WizardV3VillaDetails' : 'WizardV3RoomSummary'
                )
            }
            nextLabel="Continue"
            nextDisabled={!minMet}
        >
            <Text variant="bodyLarge" mb="$3">
                {draft.propertyCategory === 'homestay'
                    ? 'Upload at least 5 photos of your homestay.'
                    : draft.propertyCategory === 'apartment'
                        ? 'Upload at least 5 photos of your apartment.'
                        : draft.propertyCategory === 'resort'
                            ? 'Upload at least 5 photos of your resort.'
                            : 'Upload at least 5 photos of your property.'}
            </Text>

            <Button
                variant="secondary"
                onPress={pickPhotos}
                icon={<Icon name="camera-plus" size={20} color={theme.onSecondary.get()} />}
                mb="$4"
            >
                Add Photos
            </Button>

            <XStack flexWrap="wrap" gap="$2">
                {photos.map((uri, idx) => (
                    <Card key={`${uri}_${idx}`} style={{ width: gridItemSize, height: gridItemSize, borderRadius: 12, overflow: 'hidden' }} variant="elevated">
                        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
                        <TouchableOpacity
                            style={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                borderRadius: 12,
                                padding: 4
                            }}
                            onPress={() => removePhoto(idx)}
                        >
                            <Icon name="close" size={16} color="white" />
                        </TouchableOpacity>
                    </Card>
                ))}
            </XStack>
            <Text variant="bodySmall" mt="$2" color="$onSurfaceVariant">
                {photos.length} photos added. (Minimum 5 required)
            </Text>
        </WizardStepShell>
    );
}
