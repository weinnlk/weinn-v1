export type HomeContentType = 'unknown' | 'article_card' | 'promo_card';
export type HomeContentPlacement = 'home_top_carousel' | 'home_mid';
export type HomeContentApp = 'guest' | 'host';

export type HomeContentAction =
    | { type: 'navigate_tab'; tab: 'Today' | 'Bookings' | 'Listings' | 'Messages' | 'Profile' }
    | { type: 'open_article_modal' };

export type HomeContentItem = {
    id: string;
    app: HomeContentApp;
    placement: HomeContentPlacement;
    type: HomeContentType;
    title: string | null;
    subtitle: string | null;
    image_url: string | null;
    payload: any;
    priority: number;
};

export type ConversationSummary = {
    conversation_id: string;
    other_user_id: string;
    other_first_name: string | null;
    other_last_name: string | null;
    last_message: string | null;
    last_message_at: string | null;
};

export type Profile = {
    id: string;
    phone: string | null;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    is_active: boolean;
    is_host: boolean;
};

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
