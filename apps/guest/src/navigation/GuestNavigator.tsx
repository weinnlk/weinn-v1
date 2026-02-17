import * as React from 'react';
import { getFocusedRouteNameFromRoute, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { GuestHomeScreen } from '../screens/GuestHomeScreen';
import { GuestBookingsScreen } from '../screens/GuestBookingsScreen';
import { GuestConversationsScreen, GuestChatScreen, GuestProfileScreen } from '../screens/GuestProfileAndMessages';
import { SelectRoomsScreen } from '../screens/SelectRoomsScreen';
import { BookingDetailsScreen } from '../screens/BookingDetailsScreen';
import { BookingConfirmedScreen } from '../screens/BookingConfirmedScreen';
import { PropertyDetailsScreen } from '../screens/PropertyDetailsScreen';
import { PropertyDescriptionModal } from '../screens/PropertyDescriptionModal';
import { PropertyAmenitiesModal } from '../screens/PropertyAmenitiesModal';
import { ContentModalScreen } from '../screens/ContentModalScreen';

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();
const MessagesStack = createNativeStackNavigator();

function GuestMessagesTab({ authUserId }: { authUserId: string | null }) {
    return (
        <MessagesStack.Navigator>
            <MessagesStack.Screen name="Conversations" options={{ headerShown: false }}>
                {(props) => <GuestConversationsScreen {...props} authUserId={authUserId} />}
            </MessagesStack.Screen>
            <MessagesStack.Screen name="Chat" options={{ headerShown: false }}>
                {(props) => <GuestChatScreen {...props} authUserId={authUserId} />}
            </MessagesStack.Screen>
        </MessagesStack.Navigator>
    );
}

export function GuestNavigator({ authUserId, profileName, onSignOut }: { authUserId: string | null; profileName: string; onSignOut: () => void }) {
    return (
        <NavigationContainer>
            <RootStack.Navigator screenOptions={{ headerShown: false }}>
                <RootStack.Screen name="Tabs">
                    {({ navigation }: any) => (
                        <Tab.Navigator screenOptions={{ headerShown: false }}>
                            <Tab.Screen name="Home" options={{ title: 'Home' }}>{() => <GuestHomeScreen navigation={navigation} />}</Tab.Screen>
                            <Tab.Screen name="Bookings" options={{ title: 'Bookings' }}>{() => <GuestBookingsScreen />}</Tab.Screen>
                            <Tab.Screen
                                name="Messages"
                                options={({ route }) => {
                                    const routeName = getFocusedRouteNameFromRoute(route) ?? 'Conversations';
                                    return {
                                        title: 'Messages',
                                        tabBarStyle: routeName === 'Chat' ? { display: 'none' } : undefined,
                                    };
                                }}
                            >
                                {() => <GuestMessagesTab authUserId={authUserId} />}
                            </Tab.Screen>
                            <Tab.Screen name="Profile" options={{ title: 'Profile' }}>{() => <GuestProfileScreen profileName={profileName} authUserId={authUserId} onSignOut={onSignOut} />}</Tab.Screen>
                        </Tab.Navigator>
                    )}
                </RootStack.Screen>
                <RootStack.Screen name="ContentModal" component={ContentModalScreen} options={{ presentation: 'modal' }} />
                <RootStack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
                <RootStack.Screen name="PropertyDescription" component={PropertyDescriptionModal} options={{ presentation: 'modal' }} />
                <RootStack.Screen name="PropertyAmenities" component={PropertyAmenitiesModal} options={{ presentation: 'modal' }} />
                <RootStack.Screen name="SelectRooms" component={SelectRoomsScreen} />
                <RootStack.Screen name="BookingDetails" component={BookingDetailsScreen} />
                <RootStack.Screen name="BookingConfirmed" component={BookingConfirmedScreen} />
            </RootStack.Navigator>
        </NavigationContainer>
    );
}
