import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HostTodayScreen } from './dashboard/HostTodayScreen';
import { ContentModalScreen } from './common/ContentModalScreen';
import { HostCalendarScreen } from './calendar/HostCalendarScreen';
import { HostBookingsScreen } from './calendar/HostBookingsScreen';
import { HostListingsTab } from './listings/HostListingsTab';
import { HostMessagesTab } from './messaging/HostMessagesTab';
import { HostProfileScreen } from './profile/HostProfileScreen';

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

export function HostMain({ authUserId, profileName, onSignOut }: { authUserId: string | null; profileName: string; onSignOut: () => void }) {
    return (
        <NavigationContainer>
            <RootStack.Navigator>
                <RootStack.Screen name="Tabs" options={{ headerShown: false }}>
                    {() => (
                        <Tab.Navigator screenOptions={{ headerShown: false }}>
                            <Tab.Screen name="Today" options={{ title: 'Today' }}>{({ navigation }) => <HostTodayScreen navigation={navigation} />}</Tab.Screen>
                            <Tab.Screen name="Calendar" options={{ title: 'Calendar', tabBarIcon: ({ color, size }) => <Icon name="calendar" color={color} size={size} /> }}>{() => <HostCalendarScreen />}</Tab.Screen>
                            <Tab.Screen name="Bookings" options={{ title: 'Bookings' }}>{() => <HostBookingsScreen />}</Tab.Screen>
                            <Tab.Screen
                                name="Listings"
                                options={({ route }) => {
                                    const routeName = getFocusedRouteNameFromRoute(route) ?? 'MyListings';
                                    return {
                                        title: 'Listings',
                                        tabBarStyle: routeName.startsWith('WizardV3') ? { display: 'none' } : undefined,
                                    };
                                }}
                            >
                                {() => <HostListingsTab authUserId={authUserId} />}
                            </Tab.Screen>
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
                                {() => <HostMessagesTab authUserId={authUserId} />}
                            </Tab.Screen>
                            <Tab.Screen name="Profile" options={{ title: 'Profile' }}>{() => <HostProfileScreen profileName={profileName} onSignOut={onSignOut} />}</Tab.Screen>
                        </Tab.Navigator>
                    )}
                </RootStack.Screen>
                <RootStack.Screen
                    name="ContentModal"
                    component={ContentModalScreen}
                    options={{ presentation: 'modal', headerShown: false }}
                />
            </RootStack.Navigator>
        </NavigationContainer>
    );
}
