import { HomeContentAction, HomeContentItem } from './types';

export function numberFromText(t: string): number {
    const n = Number(String(t ?? '').replace(/\D/g, '') || '0');
    return Number.isFinite(n) ? n : 0;
}

export function getCta(item: HomeContentItem): { label: string; action: HomeContentAction } | null {
    const cta = item?.payload?.cta;
    if (!cta) return null;

    const label = typeof cta?.label === 'string' ? cta.label : '';
    const action = cta?.action;

    if (!label || !action || typeof action !== 'object') return null;

    if (action.type === 'navigate_tab' && typeof action.tab === 'string') {
        const tab = action.tab as any;
        if (tab === 'Today' || tab === 'Bookings' || tab === 'Listings' || tab === 'Messages' || tab === 'Profile') {
            return { label, action: { type: 'navigate_tab', tab } };
        }
    }

    if (action.type === 'open_article_modal') {
        return { label, action: { type: 'open_article_modal' } };
    }

    return null;
}
