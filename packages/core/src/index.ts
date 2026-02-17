export * from './supabase';
export * from './auth/useAuth';

export function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export * from './types/messaging';
export * from './hooks/useChat';
export * from './hooks/useInbox';
