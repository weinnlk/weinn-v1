import React from 'react';
import { View, Alert } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from '@weinn/core';
import { ListingDraftV3, RoomDraftV3 } from '../types';
import { WizardV3Context } from '../components/WizardStepShell';
import { HostMyListingsScreen } from './HostMyListingsScreen';

// Wizard Core Screens
import {
    HostWizardV3StartScreen,
    HostWizardV3ConfirmTypeScreen,
    HostWizardV3LocationScreen,
    HostWizardV3PinScreen,
    HostWizardV3AboutScreen,
    HostWizardV3AmenitiesScreen,
    HostWizardV3ServicesScreen,
    HostWizardV3LanguagesScreen,
    HostWizardV3RulesScreen,
    HostWizardV3PhotosScreen,
} from './HostWizardCoreScreens';

// Wizard Room Screens
import {
    HostWizardV3VillaDetailsScreen,
    HostWizardV3VillaPriceScreen,
    HostWizardV3RoomSummaryScreen,
    HostWizardV3RoomNameScreen,
    HostWizardV3RoomDetailsScreen,
    HostWizardV3RoomBathroomScreen,
    HostWizardV3RoomAmenitiesScreen,
    HostWizardV3RoomPricingScreen,
    HostWizardV3RoomPhotosScreen,
} from './HostWizardRoomScreens';

// Wizard Verification Screens
import { HostWizardV3HostVerificationScreen, HostWizardV3ReviewSubmitScreen } from './HostWizardVerificationScreens';

const ListingsStack = createNativeStackNavigator();

export function createNewDraftV3(): ListingDraftV3 {
    return {
        id: `draft_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

export function HostListingsTab({ authUserId }: { authUserId: string | null }) {
    const [draftV3, setDraftV3] = React.useState<ListingDraftV3>(() => createNewDraftV3());
    const [properties, setProperties] = React.useState<{ id: string; status: string; title: string | null; updated_at: string }[]>([]);

    const hydrateLockRef = React.useRef(false);
    const autosaveTimerRef = React.useRef<any>(null);

    const loadAllProperties = React.useCallback(async () => {
        if (!authUserId) return;
        const { data, error } = await supabase
            .from('properties')
            .select('id, status, title, updated_at')
            .eq('host_id', authUserId)
            .order('updated_at', { ascending: false });
        if (error) throw error;
        setProperties((data ?? []) as any);
    }, [authUserId]);

    const ensureDraftPropertyRow = React.useCallback(
        async (userId: string): Promise<string> => {
            if (draftV3.propertyId) return draftV3.propertyId;

            const { data, error } = await supabase
                .from('properties')
                .insert({ host_id: userId, status: 'draft' })
                .select('id')
                .single();
            if (error) throw error;
            const id = (data as any)?.id as string;
            if (!id) throw new Error('Failed to create draft listing');
            setDraftV3((prev) => ({ ...prev, propertyId: id, updatedAt: new Date().toISOString() }));
            return id;
        },
        [draftV3.propertyId]
    );

    const saveDraftToSupabaseV3 = React.useCallback(
        async (userId: string, draft: ListingDraftV3) => {
            console.log('saveDraftToSupabaseV3 STARTED', draft.propertyId);
            const propertyId = draft.propertyId;
            if (!propertyId) {
                console.log('saveDraftToSupabaseV3 ABORT: No propertyId');
                return;
            }

            const breakfastPrice = draft.breakfastPricePerPersonPerDay?.trim()
                ? Number(draft.breakfastPricePerPersonPerDay)
                : null;
            const petsAllowed: boolean | null =
                draft.petsAllowed === 'yes' ? true : draft.petsAllowed === 'no' ? false : null;

            const isWholePlace = draft.propertyCategory === 'villa' || draft.propertyCategory === 'apartment';
            const villaPrice = (draft.villaPricePerNight ?? '').trim() ? Number(draft.villaPricePerNight) : NaN;
            // FIXED: map villaSizeSqm to villa_size
            const villaSize = typeof draft.villaSizeSqm === 'number' ? draft.villaSizeSqm : NaN;

            const patch: any = {
                host_id: userId,
                status: 'draft',
                title: draft.propertyName?.trim() || null,
                location_text: draft.locationQuery ?? null,
                location_address: draft.locationAddress ?? null,
                location_lat: draft.locationLat ?? null,
                location_lng: draft.locationLng ?? null,
                location_pin_confirmed: !!draft.locationPinConfirmed,
                property_type: draft.propertyTypeLabel ?? null,
                star_rating: draft.starRating ?? null,
                amenities: draft.amenities ?? [],
                breakfast_served: draft.breakfastServed ?? null,
                breakfast_included: draft.breakfastIncluded ?? null,
                breakfast_price_per_person: Number.isFinite(breakfastPrice as any) ? breakfastPrice : null,
                breakfast_types: draft.breakfastTypes ?? [],
                languages: draft.languages ?? [],
                check_in_from: draft.checkInFrom ?? null,
                check_in_until: draft.checkInUntil ?? null,
                check_out_from: draft.checkOutFrom ?? null,
                check_out_until: draft.checkOutUntil ?? null,
                children_allowed: draft.childrenAllowed ?? null,
                pets_allowed: petsAllowed,

                villa_bedrooms: isWholePlace ? (draft.villaBedrooms ?? []) : null,
                villa_guest_count: isWholePlace ? (draft.villaGuestCount ?? null) : null,
                villa_bathrooms: isWholePlace ? (draft.villaBathrooms ?? null) : null,
                villa_size: isWholePlace && Number.isFinite(villaSize as any) ? villaSize : null,
                villa_size_unit: isWholePlace ? (draft.villaSizeUnit ?? null) : null,
                villa_price_per_night: isWholePlace && Number.isFinite(villaPrice as any) ? villaPrice : null,

                business_name: draft.businessName ?? null,
                business_address: draft.businessAddress ?? null,
                business_zip_code: draft.businessZipCode ?? null,
                business_city: draft.businessCity ?? null,
                business_country: draft.businessCountry ?? null,
                owner_first_name: draft.ownerFirstName ?? null,
                owner_last_name: draft.ownerLastName ?? null,
                owner_gender: draft.ownerGender ?? null,
                owner_date_of_birth: draft.ownerDateOfBirth ?? null,
                owner_phone: draft.ownerPhone ?? null,
                owner_email: draft.ownerEmail ?? null,
            };

            const { error: propErr } = await supabase.from('properties').update(patch).eq('id', propertyId);
            if (propErr) throw propErr;

            // Sync property photos
            const { error: delPropPhotosErr } = await supabase.from('property_photos').delete().eq('property_id', propertyId);
            if (delPropPhotosErr) throw delPropPhotosErr;
            const propertyUris = (draft.propertyPhotoUris ?? []).filter(Boolean);
            if (propertyUris.length) {
                const propertyPhotoRows = propertyUris.map((uri, idx) => ({ property_id: propertyId, uri, sort_order: idx }));
                const { error: insPropPhotosErr } = await supabase.from('property_photos').insert(propertyPhotoRows);
                if (insPropPhotosErr) throw insPropPhotosErr;
            }

            if (isWholePlace) return;

            // Sync rooms using Upsert Strategy
            const draftRooms = (draft.rooms ?? []).filter((r) => r.name || (r.photoUris ?? []).length);
            const draftIds = new Set(draftRooms.map(r => r.id));

            // 1. Identify existing IDs in DB to handle deletions
            const { data: existingRoomTypes, error: existingRoomTypesErr } = await supabase
                .from('room_types')
                .select('id')
                .eq('property_id', propertyId);
            if (existingRoomTypesErr) throw existingRoomTypesErr;

            const existingDbIds = new Set((existingRoomTypes ?? []).map((r: any) => r.id));
            const idsToDelete = [...existingDbIds].filter(id => !draftIds.has(id));

            if (idsToDelete.length > 0) {
                // Try to delete removed rooms. Ignore FK errors (likely booked).
                // We delete children first just in case.
                await supabase.from('beds').delete().in('room_type_id', idsToDelete);
                await supabase.from('room_type_photos').delete().in('room_type_id', idsToDelete);
                const { error: delErr } = await supabase.from('room_types').delete().in('id', idsToDelete);
                if (delErr) console.warn('Failed to delete some room_types (likely booked):', delErr);
            }

            // 2. Upsert ALL Rooms
            if (draftRooms.length > 0) {
                const roomsToUpsert = draftRooms.map(room => {
                    const roomPrice = room.pricePerNight?.trim() ? Number(room.pricePerNight) : null;
                    const bathroomType = room.bathroomType;
                    return {
                        id: room.id, // Always use the client-side UUID
                        property_id: propertyId,
                        name: room.name ?? null,
                        room_count: 1,
                        max_guests: room.guestCount ?? null,
                        bathroom_type: bathroomType,
                        price_per_night: Number.isFinite(roomPrice as any) ? roomPrice : null,
                        amenities: room.amenities ?? [],
                    };
                });

                const { error: upsertErr } = await supabase.from('room_types').upsert(roomsToUpsert);
                if (upsertErr) throw upsertErr;

                // Update photos for ALL rooms
                for (const room of draftRooms) {
                    // Nuke and replace photos
                    await supabase.from('room_type_photos').delete().eq('room_type_id', room.id);
                    const roomUris = (room.photoUris ?? []).filter(Boolean);
                    if (roomUris.length) {
                        const photoRows = roomUris.map((uri, idx) => ({ room_type_id: room.id, uri, sort_order: idx }));
                        await supabase.from('room_type_photos').insert(photoRows);
                    }
                }
            }
        },
        [] // No longer depends on setDraftV3
    );

    const loadDraftById = React.useCallback(
        async (propertyId: string) => {
            hydrateLockRef.current = true;
            try {
                const { data: prop, error: propErr } = await supabase
                    .from('properties')
                    .select(
                        [
                            'id',
                            'title',
                            'location_text',
                            'location_address',
                            'location_lat',
                            'location_lng',
                            'location_pin_confirmed',
                            'property_type',
                            'star_rating',
                            'amenities',
                            'breakfast_served',
                            'breakfast_included',
                            'breakfast_price_per_person',
                            'breakfast_types',
                            'languages',
                            'check_in_from',
                            'check_in_until',
                            'check_out_from',
                            'check_out_until',
                            'children_allowed',
                            'pets_allowed',
                            'villa_bedrooms',
                            'villa_guest_count',
                            'villa_bathrooms',
                            'villa_size',
                            'villa_size_unit',
                            'villa_price_per_night',
                            'business_name',
                            'business_address',
                            'business_zip_code',
                            'business_city',
                            'business_country',
                            'owner_first_name',
                            'owner_last_name',
                            'owner_gender',
                            'owner_date_of_birth',
                            'owner_phone',
                            'owner_email',
                        ].join(',')
                    )
                    .eq('id', propertyId)
                    .single();
                if (propErr) throw propErr;

                const { data: propPhotos, error: propPhotosErr } = await supabase
                    .from('property_photos')
                    .select('uri, sort_order')
                    .eq('property_id', propertyId)
                    .order('sort_order', { ascending: true });
                if (propPhotosErr) throw propPhotosErr;

                // room_size is not in selection list unfortunately
                const { data: roomTypes, error: roomTypesErr } = await supabase
                    .from('room_types')
                    .select('id, name, room_type_code, room_count, max_guests, smoking_allowed, bathroom_type, price_per_night, amenities')
                    .eq('property_id', propertyId);
                if (roomTypesErr) throw roomTypesErr;

                const roomTypeIds = (roomTypes ?? []).map((r: any) => r.id).filter(Boolean);
                // const bedsByRoomType: Record<string, { type: string; quantity: number }[]> = {};
                const roomPhotosByRoomType: Record<string, string[]> = {};

                if (roomTypeIds.length) {
                    // Skip loading beds
                    /*
                    const { data: bedsRows, error: bedsErr } = await supabase
                        .from('beds')
                        .select('room_type_id, bed_type, quantity')
                        .in('room_type_id', roomTypeIds);
                    if (bedsErr) throw bedsErr;
                    for (const b of bedsRows ?? []) {
                        const rid = (b as any).room_type_id as string;
                        if (!bedsByRoomType[rid]) bedsByRoomType[rid] = [];
                        bedsByRoomType[rid].push({ type: (b as any).bed_type, quantity: (b as any).quantity });
                    }
                    */

                    const { data: roomPhotoRows, error: roomPhotoErr } = await supabase
                        .from('room_type_photos')
                        .select('room_type_id, uri, sort_order')
                        .in('room_type_id', roomTypeIds)
                        .order('sort_order', { ascending: true });
                    if (roomPhotoErr) throw roomPhotoErr;
                    for (const p of roomPhotoRows ?? []) {
                        const rid = (p as any).room_type_id as string;
                        if (!roomPhotosByRoomType[rid]) roomPhotosByRoomType[rid] = [];
                        roomPhotosByRoomType[rid].push((p as any).uri);
                    }
                }

                const next: ListingDraftV3 = {
                    ...createNewDraftV3(),
                    propertyId: (prop as any).id,
                    propertyName: (prop as any).title ?? undefined,
                    locationQuery: (prop as any).location_text ?? undefined,
                    locationAddress: (prop as any).location_address ?? undefined,
                    locationLat: (prop as any).location_lat ?? undefined,
                    locationLng: (prop as any).location_lng ?? undefined,
                    locationPinConfirmed: !!(prop as any).location_pin_confirmed,
                    propertyTypeLabel: (prop as any).property_type ?? undefined,
                    starRating: (prop as any).star_rating ?? undefined,
                    amenities: (prop as any).amenities ?? [],
                    breakfastServed: (prop as any).breakfast_served ?? undefined,
                    breakfastIncluded: (prop as any).breakfast_included ?? undefined,
                    breakfastPricePerPersonPerDay:
                        (prop as any).breakfast_price_per_person != null ? String((prop as any).breakfast_price_per_person) : undefined,
                    breakfastTypes: (prop as any).breakfast_types ?? [],
                    languages: (prop as any).languages ?? [],
                    checkInFrom: (prop as any).check_in_from ?? undefined,
                    checkInUntil: (prop as any).check_in_until ?? undefined,
                    checkOutFrom: (prop as any).check_out_from ?? undefined,
                    checkOutUntil: (prop as any).check_out_until ?? undefined,
                    childrenAllowed: (prop as any).children_allowed ?? undefined,
                    petsAllowed: (prop as any).pets_allowed === true ? 'yes' : (prop as any).pets_allowed === false ? 'no' : 'upon_request',
                    villaBedrooms: (prop as any).villa_bedrooms ?? [],
                    villaGuestCount: (prop as any).villa_guest_count ?? 0,
                    villaBathrooms: (prop as any).villa_bathrooms ?? 1,
                    // FIXED: villaSize -> villaSizeSqm
                    villaSizeSqm: (prop as any).villa_size != null ? Number((prop as any).villa_size) : undefined,
                    villaSizeUnit: ((prop as any).villa_size_unit as any) ?? 'sqm',
                    villaPricePerNight: (prop as any).villa_price_per_night != null ? String((prop as any).villa_price_per_night) : undefined,
                    businessName: (prop as any).business_name ?? undefined,
                    businessAddress: (prop as any).business_address ?? undefined,
                    businessZipCode: (prop as any).business_zip_code ?? undefined,
                    businessCity: (prop as any).business_city ?? undefined,
                    businessCountry: (prop as any).business_country ?? undefined,
                    ownerFirstName: (prop as any).owner_first_name ?? undefined,
                    ownerLastName: (prop as any).owner_last_name ?? undefined,
                    ownerGender: (prop as any).owner_gender ?? undefined,
                    ownerDateOfBirth: (prop as any).owner_date_of_birth ?? undefined,
                    ownerPhone: (prop as any).owner_phone ?? undefined,
                    ownerEmail: (prop as any).owner_email ?? undefined,
                    propertyPhotoUris: (propPhotos ?? []).map((p: any) => p.uri).filter(Boolean),
                    rooms: (roomTypes ?? []).map((r: any) => {
                        const bathroomType = r.bathroom_type as string | null;
                        return {
                            id: r.id,
                            name: r.name ?? '', // FIXED: roomName -> name
                            guestCount: r.max_guests ?? 2,
                            bedCount: 1, // Default, as we don't load beds
                            bathroomCount: 1, // Default
                            bathroomType: bathroomType === 'private' ? 'private' : bathroomType === 'shared' ? 'shared' : undefined,
                            amenities: r.amenities ?? [],
                            pricePerNight: r.price_per_night != null ? String(r.price_per_night) : undefined,
                            photoUris: roomPhotosByRoomType[r.id] ?? [],
                        } as RoomDraftV3;
                    }),
                    updatedAt: new Date().toISOString(),
                };

                setDraftV3(next);
                return next;
            } finally {
                hydrateLockRef.current = false;
            }
        },
        [setDraftV3]
    );

    React.useEffect(() => {
        if (!authUserId) return;
        if (hydrateLockRef.current) return;
        if (!draftV3.propertyId) return;

        if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = setTimeout(() => {
            // TEMPORARILY DISABLED TO DEBUG CRASH
            console.log('Skipping autosave for debugging');
            /*
            saveDraftToSupabaseV3(authUserId, draftV3).catch((e) => {
                console.error('Autosave failed:', e);
                // Alert the user so we can see the error
                Alert.alert('Autosave Error', e.message || JSON.stringify(e));
            });
            */
        }, 800);
        return () => {
            if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
        };
    }, [authUserId, draftV3, saveDraftToSupabaseV3]);

    React.useEffect(() => {
        loadAllProperties().catch(() => { });
    }, [loadAllProperties]);

    const submitListing = async () => {
        if (!authUserId) return;
        // Ensure draft has a row
        await ensureDraftPropertyRow(authUserId);
        // Save current state
        await saveDraftToSupabaseV3(authUserId, draftV3);
        // Update status
        const { error } = await supabase.from('properties').update({ status: 'submitted' }).eq('id', draftV3.propertyId);
        if (error) throw error;
        // Reset draft and go back
        setDraftV3(createNewDraftV3());
        await loadAllProperties();
    };

    return (
        <WizardV3Context.Provider value={{ authUserId, draftV3, ensureDraftPropertyRow, saveDraftToSupabaseV3 }}>
            <ListingsStack.Navigator>
                <ListingsStack.Screen name="MyListings" options={{ headerShown: false }}>
                    {(props) => (
                        <HostMyListingsScreen
                            {...props}
                            authUserId={authUserId}
                            properties={properties}
                            onCreateNew={() => {
                                setDraftV3(createNewDraftV3());
                                props.navigation.navigate('WizardV3Start');
                            }}
                            onReload={async () => {
                                await loadAllProperties();
                            }}
                        />
                    )}
                </ListingsStack.Screen>

                <ListingsStack.Screen name="WizardV3Start" options={{ headerShown: false }}>
                    {(props) => (
                        <HostWizardV3StartScreen
                            {...props}
                            draft={draftV3}
                            setDraft={setDraftV3}
                            onEnsureDraftRow={async () => {
                                if (!authUserId) throw new Error('You must be signed in');
                                await ensureDraftPropertyRow(authUserId);
                            }}
                            onLoadDraftById={loadDraftById}
                        />
                    )}
                </ListingsStack.Screen>
                <ListingsStack.Screen name="WizardV3ConfirmType" options={{ headerShown: false }}>
                    {(props) => <HostWizardV3ConfirmTypeScreen {...props} draft={draftV3} />}
                </ListingsStack.Screen>
                <ListingsStack.Screen name="WizardV3Location" options={{ headerShown: false }}>
                    {(props) => <HostWizardV3LocationScreen {...props} draft={draftV3} setDraft={setDraftV3} />}
                </ListingsStack.Screen>
                <ListingsStack.Screen name="WizardV3Pin" options={{ headerShown: false }}>
                    {(props) => <HostWizardV3PinScreen {...props} draft={draftV3} setDraft={setDraftV3} />}
                </ListingsStack.Screen>
                <ListingsStack.Screen name="WizardV3About" options={{ headerShown: false }}>
                    {(props) => <HostWizardV3AboutScreen {...props} draft={draftV3} setDraft={setDraftV3} />}
                </ListingsStack.Screen>
                <ListingsStack.Screen name="WizardV3Amenities" options={{ headerShown: false }}>
                    {(props) => <HostWizardV3AmenitiesScreen {...props} draft={draftV3} setDraft={setDraftV3} />}
                </ListingsStack.Screen>
                <ListingsStack.Screen name="WizardV3Services" options={{ headerShown: false }}>
                    {(props) => <HostWizardV3ServicesScreen {...props} draft={draftV3} setDraft={setDraftV3} />}
                </ListingsStack.Screen>
                <ListingsStack.Screen name="WizardV3Languages" options={{ headerShown: false }}>
                    {(props) => <HostWizardV3LanguagesScreen {...props} draft={draftV3} setDraft={setDraftV3} />}
                </ListingsStack.Screen>
                <ListingsStack.Screen name="WizardV3Rules" options={{ headerShown: false }}>
                    {(props) => <HostWizardV3RulesScreen {...props} draft={draftV3} setDraft={setDraftV3} />}
                </ListingsStack.Screen>
                <ListingsStack.Screen name="WizardV3Photos" options={{ headerShown: false }}>
                    {(props) => <HostWizardV3PhotosScreen {...props} draft={draftV3} setDraft={setDraftV3} />}
                </ListingsStack.Screen>

                <ListingsStack.Screen name="WizardV3VillaDetails" options={{ headerShown: false }}>
                    {(props) => <HostWizardV3VillaDetailsScreen {...props} draft={draftV3} setDraft={setDraftV3} />}
                </ListingsStack.Screen>
                <ListingsStack.Screen name="WizardV3VillaPrice" options={{ headerShown: false }}>
                    {(props) => <HostWizardV3VillaPriceScreen {...props} draft={draftV3} setDraft={setDraftV3} />}
                </ListingsStack.Screen>

                <ListingsStack.Screen name="WizardV3RoomSummary" options={{ headerShown: false }}>
                    {(props) => <HostWizardV3RoomSummaryScreen {...props} draft={draftV3} setDraft={setDraftV3} />}
                </ListingsStack.Screen>
                <ListingsStack.Screen name="WizardV3RoomName" options={{ headerShown: false }}>
                    {(props) => (
                        <HostWizardV3RoomNameScreen
                            {...props}
                            draft={draftV3}
                            setDraft={setDraftV3}
                        />
                    )}
                </ListingsStack.Screen>
                <ListingsStack.Screen name="WizardV3RoomDetails" options={{ headerShown: false }}>
                    {(props) => (
                        <HostWizardV3RoomDetailsScreen
                            {...props}
                            draft={draftV3}
                            setDraft={setDraftV3}
                        />
                    )}
                </ListingsStack.Screen>
                <ListingsStack.Screen name="WizardV3RoomBathroom" options={{ headerShown: false }}>
                    {(props) => (
                        <HostWizardV3RoomBathroomScreen
                            {...props}
                            draft={draftV3}
                            setDraft={setDraftV3}
                        />
                    )}
                </ListingsStack.Screen>
                <ListingsStack.Screen name="WizardV3RoomAmenities" options={{ headerShown: false }}>
                    {(props) => (
                        <HostWizardV3RoomAmenitiesScreen
                            {...props}
                            draft={draftV3}
                            setDraft={setDraftV3}
                        />
                    )}
                </ListingsStack.Screen>
                <ListingsStack.Screen name="WizardV3RoomPricing" options={{ headerShown: false }}>
                    {(props) => (
                        <HostWizardV3RoomPricingScreen
                            {...props}
                            draft={draftV3}
                            setDraft={setDraftV3}
                        />
                    )}
                </ListingsStack.Screen>
                <ListingsStack.Screen name="WizardV3RoomPhotos" options={{ headerShown: false }}>
                    {(props) => (
                        <HostWizardV3RoomPhotosScreen
                            {...props}
                            draft={draftV3}
                            setDraft={setDraftV3}
                        />
                    )}
                </ListingsStack.Screen>

                <ListingsStack.Screen name="WizardV3HostVerification" options={{ headerShown: false }}>
                    {(props) => <HostWizardV3HostVerificationScreen {...props} draft={draftV3} setDraft={setDraftV3} />}
                </ListingsStack.Screen>
                <ListingsStack.Screen name="WizardV3ReviewSubmit" options={{ headerShown: false }}>
                    {(props) => (
                        <HostWizardV3ReviewSubmitScreen
                            {...props}
                            draft={draftV3}
                            onSubmit={async () => {
                                await submitListing();
                                props.navigation.popToTop();
                            }}
                        />
                    )}
                </ListingsStack.Screen>
            </ListingsStack.Navigator>
        </WizardV3Context.Provider>
    );
}
