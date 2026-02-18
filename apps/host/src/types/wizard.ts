// Wizard Types
export type WizardV3PropertyCategory =
    | 'hotel'
    | 'villa'
    | 'resort'
    | 'apartment'
    | 'homestay'
    | 'homes'
    | 'hotel_bb_more'
    | 'alternative';
export type WizardV3ParkingAvailability = 'no' | 'yes_free' | 'yes_paid';
export type WizardV3ParkingCostPeriod = 'per_day' | 'per_stay' | 'per_hour';
export type WizardV3PetsAllowed = 'yes' | 'upon_request' | 'no';

export type VillaBedroomDraftV3 = {
    id: string;
    name?: string;
    bedCount: number;
    bedType: string;
};

export type RoomDraftV3 = {
    id: string;
    name: string;
    guestCount: number;
    bedCount: number;
    roomSizeSqm?: number;
    bathroomCount: number;
    bathroomType?: 'private' | 'shared';
    amenities: string[];
    pricePerNight?: string;
    photoUris?: string[];

    // New fields
    quantity: number;
    smokingAllowed?: boolean;
    bedConfigurations?: { type: 'single' | 'double' | 'king' | 'super_king'; count: number }[];
};

export type ListingDraftV3 = {
    id: string;
    propertyId?: string;
    createdAt: string;
    updatedAt: string;

    propertyCategory?: WizardV3PropertyCategory;
    propertyTypeLabel?: string;

    country?: string;
    locationQuery?: string;
    locationAddress?: string;
    locationLat?: number;
    locationLng?: number;
    locationPinConfirmed?: boolean;
    postalCode?: string;
    city?: string;
    addressLine2?: string;

    propertyName?: string;
    starRating?: 'na' | '1' | '2' | '3' | '4' | '5';
    partOfGroupOrChain?: boolean;

    amenities?: string[];

    breakfastServed?: boolean;
    breakfastIncluded?: boolean;
    breakfastPricePerPersonPerDay?: string;
    breakfastTypes?: string[];

    parkingAvailability?: WizardV3ParkingAvailability;
    parkingCost?: string;
    parkingCostPeriod?: WizardV3ParkingCostPeriod;
    parkingReservationNeeded?: boolean;
    parkingLocation?: 'on_site' | 'off_site';
    parkingType?: 'private' | 'public';

    languages?: string[];

    checkInFrom?: string;
    checkInUntil?: string;
    checkOutFrom?: string;
    checkOutUntil?: string;
    childrenAllowed?: boolean;
    petsAllowed?: WizardV3PetsAllowed;

    propertyPhotoUris?: string[];

    rooms?: RoomDraftV3[];

    villaBedrooms?: VillaBedroomDraftV3[];
    villaGuestCount?: number;
    villaBathrooms?: number;
    villaSizeSqm?: number;
    villaSizeUnit?: 'sqm' | 'sqft';
    villaPricePerNight?: string;

    businessName?: string;
    businessAddress?: string;
    businessZipCode?: string;
    businessCity?: string;
    businessCountry?: string;

    ownerFirstName?: string;
    ownerLastName?: string;
    ownerGender?: 'male' | 'female' | 'other';
    ownerDateOfBirth?: string;
    ownerPhone?: string;
    ownerEmail?: string;
};
