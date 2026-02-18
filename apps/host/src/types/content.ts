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
