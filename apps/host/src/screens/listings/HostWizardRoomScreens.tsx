import React from 'react';
import { View, Image, Animated, ScrollView, useWindowDimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, Input, Card, XStack, YStack, Separator, Chip, IconButton } from '@weinn/ui';
import { WizardStepShell } from '../../components/WizardStepShell';
import { ListingDraftV3, RoomDraftV3, VillaBedroomDraftV3 } from '../../types';
import * as ImagePicker from 'expo-image-picker';
import { Stepper, WizardV3TimeSelect } from '../../components/HostWizardComponents';
import { numberFromText } from '../../utils';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from 'tamagui';

// --- Villa Details ---

export function HostWizardV3VillaDetailsScreen({
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

    // Initialize bedrooms if empty
    React.useEffect(() => {
        if (!draft.villaBedrooms || draft.villaBedrooms.length === 0) {
            setDraft({
                ...draft,
                villaBedrooms: [{ id: '1', name: 'Bedroom 1', bedCount: 1, bedType: 'double' }],
                updatedAt: new Date().toISOString(),
            });
        }
    }, [draft.villaBedrooms, setDraft, draft]);

    const bedrooms = draft.villaBedrooms ?? [];
    const guestCount = draft.villaGuestCount ?? 2;
    const bathroomCount = draft.villaBathrooms ?? 1;
    const size = draft.villaSizeSqm;

    const updateBedroom = (idx: number, b: VillaBedroomDraftV3) => {
        const next = [...bedrooms];
        next[idx] = b;
        setDraft({ ...draft, villaBedrooms: next, updatedAt: new Date().toISOString() });
    };

    const addBedroom = () => {
        const next = [
            ...bedrooms,
            { id: String(Date.now()), name: `Bedroom ${bedrooms.length + 1}`, bedCount: 1, bedType: 'double' },
        ];
        setDraft({ ...draft, villaBedrooms: next, updatedAt: new Date().toISOString() });
    };

    const removeBedroom = (idx: number) => {
        if (bedrooms.length <= 1) return;
        const next = [...bedrooms];
        next.splice(idx, 1);
        setDraft({ ...draft, villaBedrooms: next, updatedAt: new Date().toISOString() });
    };

    const canContinue = bedrooms.length > 0 && guestCount > 0 && bathroomCount > 0;

    return (
        <WizardStepShell
            title="Property details"
            navigation={navigation}
            scrollY={scrollY}
            onNext={() => navigation.navigate('WizardV3VillaPrice')}
            nextLabel="Continue"
            nextDisabled={!canContinue}
        >
            <Card p="$3" borderRadius={12} backgroundColor="$surfaceVariant" mb="$4" variant="filled">
                <Text variant="titleMedium" fontWeight="600" mb="$3">General</Text>

                <XStack justifyContent="space-between" alignItems="center" mb="$3">
                    <Text variant="bodyLarge">Guests</Text>
                    <Stepper value={guestCount} onChange={(v) => setDraft({ ...draft, villaGuestCount: v, updatedAt: new Date().toISOString() })} min={1} />
                </XStack>
                <Separator />
                <XStack justifyContent="space-between" alignItems="center" my="$3">
                    <Text variant="bodyLarge">Bathrooms</Text>
                    <Stepper value={bathroomCount} onChange={(v) => setDraft({ ...draft, villaBathrooms: v, updatedAt: new Date().toISOString() })} min={1} />
                </XStack>
                <Separator />
                <XStack justifyContent="space-between" alignItems="center" mt="$3">
                    <Text variant="bodyLarge">Size (sqm)</Text>
                    <Input
                        value={size ? String(size) : ''}
                        onChangeText={(t) => setDraft({ ...draft, villaSizeSqm: numberFromText(t), updatedAt: new Date().toISOString() })}
                        keyboardType="numeric"
                        width={120}
                        height={40}
                    />
                </XStack>
            </Card>

            <Text variant="titleMedium" fontWeight="600" mb="$3">Bedrooms</Text>
            {bedrooms.map((b, idx) => (
                <Card key={b.id} mb="$3" p="$3" borderRadius={12} variant="elevated">
                    <XStack justifyContent="space-between" alignItems="center" mb="$3">
                        <Text variant="titleMedium" fontWeight="600">Bedroom {idx + 1}</Text>
                        {bedrooms.length > 1 ? (
                            <Button size="$2" variant="ghost" onPress={() => removeBedroom(idx)} style={{ color: theme.error.get() }}>Remove</Button>
                        ) : null}
                    </XStack>
                    <YStack gap="$3">
                        <XStack alignItems="center" justifyContent="space-between">
                            <Text variant="bodyMedium">Beds</Text>
                            <Stepper value={b.bedCount} onChange={(v) => updateBedroom(idx, { ...b, bedCount: v })} min={1} />
                        </XStack>
                        <YStack>
                            <Text variant="label" mb="$1">Bed type</Text>
                            <Input
                                value={b.bedType ?? ''}
                                onChangeText={(t) => updateBedroom(idx, { ...b, bedType: t })}
                            />
                        </YStack>
                    </YStack>
                </Card>
            ))}

            <Button variant="outline" onPress={addBedroom} icon={<Icon name="plus" size={20} color={theme.primary.get()} />} mt="$2">
                Add another bedroom
            </Button>
        </WizardStepShell>
    );
}

export function HostWizardV3VillaPriceScreen({
    navigation,
    draft,
    setDraft,
}: {
    navigation: any;
    draft: ListingDraftV3;
    setDraft: (d: ListingDraftV3) => void;
}) {
    const scrollY = React.useRef(new Animated.Value(0)).current;

    return (
        <WizardStepShell
            title="Pricing"
            navigation={navigation}
            scrollY={scrollY}
            onNext={() => navigation.navigate('WizardV3HostVerification')}
            nextLabel="Continue"
            nextDisabled={!draft.villaPricePerNight}
        >
            <Text variant="bodyLarge" mb="$4">How much do you want to charge per night?</Text>
            <YStack>
                <Text variant="label" mb="$2">Price per night (LKR)</Text>
                <Input
                    value={draft.villaPricePerNight ? String(draft.villaPricePerNight) : ''}
                    onChangeText={(t) => setDraft({ ...draft, villaPricePerNight: t, updatedAt: new Date().toISOString() })}
                    keyboardType="numeric"
                />
            </YStack>
        </WizardStepShell>
    );
}

// --- Room Summary & Management ---

function EmptyRoomState() {
    return (
        <YStack alignItems="center" justifyContent="center" p="$5">
            <Text variant="bodyLarge" color="$onSurfaceVariant" textAlign="center">
                No rooms added yet. Add a room to continue.
            </Text>
        </YStack>
    );
}

export function HostWizardV3RoomSummaryScreen({
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
    const rooms = draft.rooms ?? [];
    const canContinue = rooms.length > 0;

    return (
        <WizardStepShell
            title="Rooms"
            navigation={navigation}
            scrollY={scrollY}
            onNext={() => navigation.navigate('WizardV3HostVerification')}
            nextLabel="Continue"
            nextDisabled={!canContinue}
        >
            <Text variant="bodyLarge" mb="$3">
                Add all the room types available at your property.
            </Text>

            {rooms.length === 0 ? <EmptyRoomState /> : null}

            <YStack gap="$3">
                {rooms.map((r, idx) => (
                    <Card key={r.id} style={{ borderRadius: 12, overflow: 'hidden' }} variant="elevated">
                        <TouchableOpacity onPress={() => navigation.navigate('WizardV3RoomName', { sessionId: r.id })}>
                            <XStack alignItems="center" p="$3">
                                <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.primaryContainer?.get(), marginRight: 16 }}>
                                    <Icon name="bed" color={theme.onPrimaryContainer?.get()} size={20} />
                                </View>
                                <YStack flex={1}>
                                    <Text variant="titleMedium" fontWeight="600">{r.name || 'Untitled Room'}</Text>
                                    <Text variant="bodyMedium" color="$onSurfaceVariant">
                                        {r.quantity ?? 1} units • {r.guestCount} guests • LKR {r.pricePerNight}
                                    </Text>
                                </YStack>
                                <XStack>
                                    <IconButton icon="pencil" onPress={() => navigation.navigate('WizardV3RoomName', { sessionId: r.id })} />
                                    <IconButton
                                        icon="delete"
                                        onPress={() => {
                                            const next = [...rooms];
                                            next.splice(idx, 1);
                                            setDraft({ ...draft, rooms: next, updatedAt: new Date().toISOString() });
                                        }}
                                        color={theme.error.get()}
                                    />
                                </XStack>
                            </XStack>
                        </TouchableOpacity>
                    </Card>
                ))}
            </YStack>

            <Button
                variant="secondary"
                onPress={() => navigation.navigate('WizardV3RoomName', { sessionId: uuidv4() })}
                icon={<Icon name="plus" size={20} color={theme.onSecondary.get()} />}
                mt="$4"
            >
                Add Room
            </Button>
        </WizardStepShell>
    );
}

// --- Individual Room Flow ---

// Helper to get/set room
function useRoomDraft(draft: ListingDraftV3, setDraft: (d: ListingDraftV3) => void, sessionId: string) {
    const roomIndex = (draft.rooms ?? []).findIndex((r) => r.id === sessionId);
    const room = roomIndex >= 0 ? draft.rooms![roomIndex] : {
        id: sessionId,
        name: '',
        guestCount: 2,
        bedCount: 1,
        bathroomCount: 1,
        roomSizeSqm: 0,
        pricePerNight: '',
        amenities: [],
        photoUris: [],
        quantity: 1,
        smokingAllowed: false,
        bedConfigurations: [
            { type: 'single', count: 0 },
            { type: 'double', count: 1 },
            { type: 'king', count: 0 },
            { type: 'super_king', count: 0 },
        ],
    } as RoomDraftV3;

    const setRoom = (r: RoomDraftV3) => {
        const nextRooms = [...(draft.rooms ?? [])];
        if (roomIndex >= 0) {
            nextRooms[roomIndex] = r;
        } else {
            nextRooms.push(r);
        }
        setDraft({ ...draft, rooms: nextRooms, updatedAt: new Date().toISOString() });
    };

    return { room, setRoom };
}


function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function HostWizardV3RoomNameScreen({
    navigation,
    route,
    draft,
    setDraft,
}: {
    navigation: any;
    route: any;
    draft: ListingDraftV3;
    setDraft: (d: ListingDraftV3) => void;
}) {
    const { sessionId } = route.params;
    const { room, setRoom } = useRoomDraft(draft, setDraft, sessionId);
    const scrollY = React.useRef(new Animated.Value(0)).current;

    // Use local state to prevent lag/crashes on every keystroke
    const [localName, setLocalName] = React.useState(room.name || '');

    // Sync from prop if it changes externally (unlikely but safe)
    React.useEffect(() => {
        if (room.name !== localName) {
            setLocalName(room.name || '');
        }
    }, [room.name]);

    // Debounce update to global draft
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (localName !== room.name) {

                try {
                    setRoom({ ...room, name: localName });
                } catch (e) {
                    console.error('Failed to setRoom name:', e);
                }
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [localName, room, setRoom]);

    return (
        <WizardStepShell
            title="Room name"
            navigation={navigation}
            scrollY={scrollY}
            onNext={() => requestAnimationFrame(() => navigation.navigate('WizardV3RoomDetails', { sessionId }))}
            nextDisabled={!localName.trim()}
        >
            <YStack>
                <Text variant="titleMedium" mb="$3">
                    What's the name of this room?
                </Text>
                <Text variant="bodyMedium" mb="$4" color="$onSurfaceVariant">
                    Give your room a descriptive name like "Deluxe Double Room" or "Ocean View Suite".
                </Text>
            </YStack>

            <YStack>
                <Text variant="label" mb="$2">Room name</Text>
                <Input
                    value={localName}
                    onChangeText={setLocalName}
                    placeholder="e.g. Deluxe Double Room"
                    autoFocus
                />
            </YStack>
        </WizardStepShell>
    );
}

export function HostWizardV3RoomDetailsScreen({
    route,
    navigation,
    draft,
    setDraft,
}: {
    route: any;
    navigation: any;
    draft: ListingDraftV3;
    setDraft: (d: ListingDraftV3) => void;
}) {
    const scrollY = React.useRef(new Animated.Value(0)).current;
    const { sessionId } = route.params;
    const { room, setRoom } = useRoomDraft(draft, setDraft, sessionId);
    const theme = useTheme();

    const bedOptions = [
        { type: 'single', label: 'Single bed', sub: '90 - 130 cm wide', icon: 'bed' },
        { type: 'double', label: 'Double bed', sub: '131 - 150 cm wide', icon: 'bed-double' },
        { type: 'king', label: 'Large bed (King size)', sub: '151 - 180 cm wide', icon: 'bed-king' },
        { type: 'super_king', label: 'Extra-large double bed', sub: '181 - 210 cm wide', icon: 'bed-king' },
    ] as const;

    const updateBedCount = (type: string, count: number) => {
        const currentConfigs = room.bedConfigurations ?? [];
        const existingIndex = currentConfigs.findIndex((c) => c.type === type);
        let nextConfigs = [...currentConfigs];

        if (existingIndex >= 0) {
            nextConfigs[existingIndex] = { ...nextConfigs[existingIndex], count };
        } else {
            nextConfigs.push({ type: type as any, count });
        }

        // derived bed count
        const totalBeds = nextConfigs.reduce((acc, c) => acc + c.count, 0);

        setRoom({
            ...room,
            bedConfigurations: nextConfigs,
            bedCount: totalBeds,
        });
    };

    const getBedCount = (type: string) => {
        return (room.bedConfigurations ?? []).find((c) => c.type === type)?.count ?? 0;
    };

    return (
        <WizardStepShell
            title="Room details"
            navigation={navigation}
            scrollY={scrollY}
            onNext={() => navigation.navigate('WizardV3RoomBathroom', { sessionId })}
            nextLabel="Continue"
        >
            <YStack gap="$4" mb="$4">
                {/* Quantity */}
                <YStack>
                    <Text variant="titleMedium" fontWeight="600" mb="$2">How many rooms of this type do you have?</Text>
                    <Input
                        value={String(room.quantity ?? 1)}
                        onChangeText={(t) => setRoom({ ...room, quantity: numberFromText(t) || 1 })}
                        keyboardType="numeric"
                        width={100}
                    />
                </YStack>

                {/* Beds */}
                <YStack>
                    <Text variant="titleMedium" fontWeight="600" mb="$3">Which beds are available in this room?</Text>
                    <Card p="$0" borderRadius={12} variant="outlined" borderColor="$outlineVariant" overflow="hidden">
                        <YStack>
                            {bedOptions.map((opt, idx) => (
                                <React.Fragment key={opt.type}>
                                    <XStack alignItems="center" justifyContent="space-between" p="$3">
                                        <XStack alignItems="center" gap="$3" flex={1}>
                                            <Icon name={opt.icon} size={24} color={theme.onSurfaceVariant.get()} />
                                            <YStack>
                                                <Text variant="bodyLarge" fontWeight="500">{opt.label}</Text>
                                                <Text variant="bodySmall" color="$onSurfaceVariant">{opt.sub}</Text>
                                            </YStack>
                                        </XStack>
                                        <Stepper
                                            value={getBedCount(opt.type)}
                                            onChange={(v) => updateBedCount(opt.type, v)}
                                            min={0}
                                        />
                                    </XStack>
                                    {idx < bedOptions.length - 1 && <Separator />}
                                </React.Fragment>
                            ))}
                        </YStack>
                    </Card>
                </YStack>

                {/* Guests */}
                <YStack>
                    <Text variant="titleMedium" fontWeight="600" mb="$2">How many guests can stay in this room?</Text>
                    <XStack alignItems="center">
                        <Stepper
                            value={room.guestCount}
                            onChange={(v) => setRoom({ ...room, guestCount: v })}
                            min={1}
                        />
                    </XStack>
                </YStack>

                {/* Size */}
                <YStack>
                    <Text variant="titleMedium" fontWeight="600" mb="$2">How big is this room?</Text>
                    <Text variant="bodySmall" mb="$2" color="$onSurfaceVariant">Room size - optional</Text>
                    <XStack gap="$2" alignItems="center">
                        <Input
                            value={room.roomSizeSqm ? String(room.roomSizeSqm) : ''}
                            onChangeText={(t) => setRoom({ ...room, roomSizeSqm: numberFromText(t) })}
                            keyboardType="numeric"
                            width={120}
                            placeholder="0"
                        />
                        <Card backgroundColor="$surfaceVariant" px="$3" py="$2" borderRadius={8} variant="filled">
                            <Text>square metres</Text>
                        </Card>
                    </XStack>
                </YStack>

                {/* Smoking */}
                <YStack>
                    <Text variant="titleMedium" fontWeight="600" mb="$2">Is smoking allowed in this room?</Text>
                    <XStack gap="$4">
                        <TouchableOpacity onPress={() => setRoom({ ...room, smokingAllowed: true })} style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon name={room.smokingAllowed ? 'radiobox-marked' : 'radiobox-blank'} size={24} color={theme.primary.get()} />
                            <Text ml="$2" variant="bodyLarge">Yes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setRoom({ ...room, smokingAllowed: false })} style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon name={!room.smokingAllowed ? 'radiobox-marked' : 'radiobox-blank'} size={24} color={theme.primary.get()} />
                            <Text ml="$2" variant="bodyLarge">No</Text>
                        </TouchableOpacity>
                    </XStack>
                </YStack>
            </YStack>
        </WizardStepShell>
    );
}

export function HostWizardV3RoomBathroomScreen({
    route,
    navigation,
    draft,
    setDraft,
}: {
    route: any;
    navigation: any;
    draft: ListingDraftV3;
    setDraft: (d: ListingDraftV3) => void;
}) {
    const scrollY = React.useRef(new Animated.Value(0)).current;
    const { sessionId } = route.params;
    const { room, setRoom } = useRoomDraft(draft, setDraft, sessionId);

    return (
        <WizardStepShell
            title="Bathroom"
            navigation={navigation}
            scrollY={scrollY}
            onNext={() => navigation.navigate('WizardV3RoomAmenities', { sessionId })}
            nextLabel="Continue"
        >
            <Card p="$3" borderRadius={12} backgroundColor="$surfaceVariant" mb="$4" variant="filled">
                <XStack justifyContent="space-between" alignItems="center">
                    <Text variant="bodyLarge">Bathrooms</Text>
                    <Stepper value={room.bathroomCount} onChange={(v) => setRoom({ ...room, bathroomCount: v })} min={1} />
                </XStack>
            </Card>

            <Card p="$3" borderRadius={12} backgroundColor="$surfaceVariant" variant="filled">
                <Text variant="titleMedium" mb="$3" fontWeight="600">Bathroom type</Text>
                <XStack gap="$3">
                    <Button
                        variant={room.bathroomType === 'private' ? 'primary' : 'outline'}
                        onPress={() => setRoom({ ...room, bathroomType: 'private' })}
                        style={{ flex: 1 }}
                    >
                        Private
                    </Button>
                    <Button
                        variant={room.bathroomType === 'shared' ? 'primary' : 'outline'}
                        onPress={() => setRoom({ ...room, bathroomType: 'shared' })}
                        style={{ flex: 1 }}
                    >
                        Shared
                    </Button>
                </XStack>
            </Card>
        </WizardStepShell>
    );
}

export function HostWizardV3RoomAmenitiesScreen({
    route,
    navigation,
    draft,
    setDraft,
}: {
    route: any;
    navigation: any;
    draft: ListingDraftV3;
    setDraft: (d: ListingDraftV3) => void;
}) {
    const scrollY = React.useRef(new Animated.Value(0)).current;
    const { sessionId } = route.params;
    const { room, setRoom } = useRoomDraft(draft, setDraft, sessionId);
    const theme = useTheme();

    const options = [
        'Air conditioning',
        'Balcony',
        'Bathtub',
        'Coffee machine',
        'Flat-screen TV',
        'Hairdryer',
        'Kitchen',
        'Minibar',
        'Shower',
        'Soundproofing',
        'Terrace',
        'View',
        'WiFi',
        'Washing machine',
    ];
    const selected = room.amenities ?? [];

    return (
        <WizardStepShell
            title="Room amenities"
            navigation={navigation}
            scrollY={scrollY}
            onNext={() => navigation.navigate('WizardV3RoomPricing', { sessionId })}
            nextLabel="Continue"
        >
            <Text variant="bodyLarge" mb="$3">What amenities does this room have?</Text>
            <Card borderRadius={12} overflow="hidden" variant="elevated">
                {options.map((opt, idx) => {
                    const isSelected = selected.includes(opt);
                    return (
                        <React.Fragment key={opt}>
                            <TouchableOpacity
                                onPress={() => {
                                    const next = isSelected ? selected.filter((x) => x !== opt) : [...selected, opt];
                                    setRoom({ ...room, amenities: next });
                                }}
                            >
                                <XStack alignItems="center" justifyContent="space-between" p="$3">
                                    <Text variant="bodyLarge">{opt}</Text>
                                    <View pointerEvents="none">
                                        <Icon name={isSelected ? 'checkbox-marked' : 'checkbox-blank-outline'} color={isSelected ? theme.primary.get() : theme.onSurfaceVariant.get() || theme.gray11.get()} size={24} />
                                    </View>
                                </XStack>
                            </TouchableOpacity>
                            {idx !== options.length - 1 ? <Separator /> : null}
                        </React.Fragment>
                    );
                })}
            </Card>
        </WizardStepShell>
    );
}

export function HostWizardV3RoomPricingScreen({
    route,
    navigation,
    draft,
    setDraft,
}: {
    route: any;
    navigation: any;
    draft: ListingDraftV3;
    setDraft: (d: ListingDraftV3) => void;
}) {
    const scrollY = React.useRef(new Animated.Value(0)).current;
    const { sessionId } = route.params;
    const { room, setRoom } = useRoomDraft(draft, setDraft, sessionId);

    return (
        <WizardStepShell
            title="Room price"
            navigation={navigation}
            scrollY={scrollY}
            onNext={() => navigation.navigate('WizardV3RoomPhotos', { sessionId })}
            nextLabel="Continue"
            nextDisabled={!room.pricePerNight}
        >
            <Text variant="bodyLarge" mb="$4">Price per night for this room</Text>
            <YStack>
                <Text variant="label" mb="$2">Price (LKR)</Text>
                <Input
                    value={room.pricePerNight ? String(room.pricePerNight) : ''}
                    onChangeText={(t) => setRoom({ ...room, pricePerNight: t })}
                    keyboardType="numeric"
                />
            </YStack>
        </WizardStepShell>
    );
}

export function HostWizardV3RoomPhotosScreen({
    route,
    navigation,
    draft,
    setDraft,
}: {
    route: any;
    navigation: any;
    draft: ListingDraftV3;
    setDraft: (d: ListingDraftV3) => void;
}) {
    const scrollY = React.useRef(new Animated.Value(0)).current;
    const { sessionId } = route.params;
    const { room, setRoom } = useRoomDraft(draft, setDraft, sessionId);
    const photos = room.photoUris ?? [];
    const minMet = photos.length >= 2;
    const theme = useTheme();

    const { width } = useWindowDimensions();
    const gridMargin = 16;
    const gridGutter = 12;
    const gridCols = 3;
    const gridContentWidth = width - (gridMargin * 2);
    const gridItemSize = (gridContentWidth - (gridGutter * (gridCols - 1))) / gridCols;

    const pickRoomPhotos = React.useCallback(async () => {
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
        setRoom({ ...room, photoUris: nextList });
    }, [photos, room, setRoom]);

    const removeRoomPhoto = React.useCallback(
        (idx: number) => {
            const list = [...photos];
            if (idx < 0 || idx >= list.length) return;
            list.splice(idx, 1);
            setRoom({ ...room, photoUris: list });
        },
        [photos, room, setRoom]
    );

    return (
        <WizardStepShell
            title="Room photos"
            navigation={navigation}
            scrollY={scrollY}
            onNext={() => {
                navigation.popTo('WizardV3RoomSummary');
            }}
            nextLabel="Save room"
            nextDisabled={!minMet}
        >
            <Text variant="bodyLarge" mb="$3">Upload at least 2 photos of this room.</Text>

            <Button
                variant="secondary"
                onPress={pickRoomPhotos}
                icon={<Icon name="camera" size={20} color={theme.onSecondary.get()} />}
                mb="$4"
            >
                Add Photos
            </Button>

            <XStack flexWrap="wrap" gap="$2">
                {photos.map((uri, idx) => (
                    <Card key={`${uri}_${idx}`} style={{ width: gridItemSize, height: gridItemSize, borderRadius: 12, overflow: 'hidden' }} variant="elevated">
                        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
                        <IconButton
                            icon="close-circle"
                            color={theme.error.get()}
                            size={20}
                            style={{ position: 'absolute', top: 0, right: 0, margin: 0, backgroundColor: 'rgba(255,255,255,0.8)' }}
                            onPress={() => removeRoomPhoto(idx)}
                        />
                    </Card>
                ))}
            </XStack>
            <Text variant="bodySmall" mt="$2" color="$onSurfaceVariant">
                {photos.length} photos added. (Minimum 2 required)
            </Text>
        </WizardStepShell>
    );
}
