// d:\weinn-v2\packages\core\src\types\messaging.ts

export type MessageType = 'text' | 'image' | 'system';

export interface MessageContent {
    text?: string;
    imageUrl?: string;
    type: MessageType;
}

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string | null;
    content: MessageContent;
    created_at: string;
    is_edited: boolean;
}

export interface Conversation {
    id: string;
    other_user_id: string;
    other_user_email: string | null;
    last_message: Message | null;
    last_message_at: string;
    is_unread: boolean;
}

export interface ChatState {
    messages: Message[];
    loading: boolean;
    error: string | null;
}
