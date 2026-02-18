import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { InboxScreen } from './InboxScreen';
import { ChatScreen } from './ChatScreen';

const MessagesStack = createNativeStackNavigator();

export function HostMessagesTab({ authUserId }: { authUserId: string | null }) {
    return (
        <MessagesStack.Navigator screenOptions={{ headerShown: false }}>
            <MessagesStack.Screen name="Inbox">
                {(props) => <InboxScreen {...props} authUserId={authUserId} />}
            </MessagesStack.Screen>
            <MessagesStack.Screen name="Chat">
                {(props) => <ChatScreen {...props} authUserId={authUserId} />}
            </MessagesStack.Screen>
        </MessagesStack.Navigator>
    );
}
