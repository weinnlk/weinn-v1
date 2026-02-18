export type Profile = {
    id: string;
    phone: string | null;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    is_active: boolean;
    is_host: boolean;
};

export type ConversationSummary = {
    conversation_id: string;
    other_user_id: string;
    other_first_name: string | null;
    other_last_name: string | null;
    last_message: string | null;
    last_message_at: string | null;
};

export interface CalendarDayData {
    date: string; // YYYY-MM-DD
    room_type_id: string;
    room_type_name: string;
    total_inventory: number;
    booked_count: number;
    blocked_count: number;
    available_count: number;
    price: number;
    is_custom_price: boolean;
}
