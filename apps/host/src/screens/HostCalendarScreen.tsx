
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth, supabase } from '@weinn/core';
import { Text, Card, YStack, XStack, Button, Input, Separator, useTheme } from '@weinn/ui';
import { CalendarList, DateData } from 'react-native-calendars';
import { format, addMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ManageDateSheet } from '../components/ManageDateSheet';
import { CalendarDayData } from '../types';

export function HostCalendarScreen() {
    const { user } = useAuth();
    const theme = useTheme();
    const [rooms, setRooms] = useState<{ id: string; name: string }[]>([]);
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const [calendarData, setCalendarData] = useState<Record<string, CalendarDayData>>({});
    const [loading, setLoading] = useState(false);

    // Sheet State
    const [sheetVisible, setSheetVisible] = useState(false);
    const [selectedDayData, setSelectedDayData] = useState<CalendarDayData | null>(null);
    const [propertyId, setPropertyId] = useState<string | null>(null);

    // Fetch Rooms on Mount
    useEffect(() => {
        if (!user) return;

        async function loadRooms() {
            // Get the first property for the host (Extension point: Support multiple properties)
            const { data: properties } = await supabase
                .from('properties')
                .select('id, title')
                .eq('host_id', user!.id)
                .limit(1);

            if (properties && properties.length > 0) {
                const propertyId = properties[0].id;

                const { data: roomTypes } = await supabase
                    .from('room_types')
                    .select('id, name')
                    .eq('property_id', propertyId);

                if (roomTypes && roomTypes.length > 0) {
                    setRooms(roomTypes);
                    setSelectedRoomId(roomTypes[0].id);
                    // Trigger fetch for this room
                    fetchCalendar(propertyId, roomTypes[0].id);
                }
            }
        }

        loadRooms();
    }, [user]);

    const fetchCalendar = async (propertyId: string, roomTypeId: string) => {
        setLoading(true);
        const startDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(addMonths(new Date(), 12)), 'yyyy-MM-dd'); // 1 year out

        const { data, error } = await supabase.rpc('get_property_calendar', {
            p_property_id: propertyId,
            p_start_date: startDate,
            p_end_date: endDate,
        });

        if (error) {
            console.error('Error fetching calendar:', error);
        } else if (data) {
            // Filter for selected room and map to dictionary
            const map: Record<string, CalendarDayData> = {};
            (data as CalendarDayData[]).forEach((d) => {
                if (d.room_type_id === roomTypeId) {
                    map[d.date] = d;
                }
            });
            setCalendarData(map);
        }
        setLoading(false);
    };

    // Refresh when changing room
    const handleRoomChange = async (roomId: string) => {
        setSelectedRoomId(roomId);
        // Get the first property again (Optimization: Store propertyId in state)
        const { data: properties } = await supabase
            .from('properties')
            .select('id')
            .eq('host_id', user!.id)
            .limit(1);

        if (properties?.[0]) {
            fetchCalendar(properties[0].id, roomId);
        }
    };

    const markedDates = useMemo(() => {
        const marks: any = {};
        Object.values(calendarData).forEach((day) => {
            const isFull = day.available_count <= 0;
            const isBlocked = day.blocked_count > 0 && day.blocked_count >= day.total_inventory; // Fully blocked
            const hasBookings = day.booked_count > 0;

            let color = 'white'; // Default
            let textColor = 'black';

            if (isBlocked) {
                color = '#e0e0e0'; // Grey for blocked
                textColor = '#9e9e9e';
            } else if (isFull) {
                color = '#ffebee'; // Red tint for full
                textColor = '#b71c1c';
            } else if (hasBookings) {
                color = '#e8f5e9'; // Green tint for some bookings
                textColor = '#1b5e20';
            }

            marks[day.date] = {
                customStyles: {
                    container: { backgroundColor: color, borderRadius: 0 },
                    text: { color: textColor }
                },
                price: day.price,
                data: day
            };
        });
        return marks;
    }, [calendarData]);

    return (
        <YStack flex={1} backgroundColor="$background">
            {/* Room Selector */}
            <View style={{ height: 60 }}>
                <XStack p="$3" gap="$3" overflow="scroll" style={{ overflowX: 'auto' }}>
                    {/* Note: In RN Web overflowX works, in Native use ScrollView horizontal. Using simple map for now, fix later */}
                    {rooms.map(r => (
                        <Button
                            key={r.id}
                            size="$2"
                            variant={selectedRoomId === r.id ? 'primary' : 'outline'}
                            onPress={() => handleRoomChange(r.id)}
                        >
                            {r.name}
                        </Button>
                    ))}
                </XStack>
            </View>

            <CalendarList
                // Callback which gets executed when visible months change in scroll view
                onVisibleMonthsChange={(months) => { console.log('now these months are visible', months); }}
                // Max amount of months allowed to scroll to the past. Default = 50
                pastScrollRange={0}
                // Max amount of months allowed to scroll to the future. Default = 50
                futureScrollRange={12}
                // Enable or disable scrolling of calendar list
                scrollEnabled={true}
                // Enable or disable vertical scroll indicator. Default = false
                showScrollIndicator={true}

                markingType={'custom'}
                markedDates={markedDates}

                dayComponent={({ date, state, marking }: { date?: DateData, state: any, marking: any }) => {
                    if (!date) return <View />;
                    return (
                        <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', flex: 1, height: 60, backgroundColor: marking?.customStyles?.container?.backgroundColor || 'white' }}
                            onPress={() => {
                                if (marking?.data) {
                                    setSelectedDayData(marking.data);
                                    setSheetVisible(true);
                                }
                            }}
                        >
                            <Text variant="bodyMedium" style={{ color: marking?.customStyles?.text?.color }}>{date.day}</Text>
                            {marking?.price && (
                                <Text variant="bodySmall" style={{ fontSize: 9, color: marking?.customStyles?.text?.color }}>
                                    {marking.price}
                                </Text>
                            )}
                            {marking?.data?.available_count !== undefined && (
                                <Text variant="bodySmall" style={{ fontSize: 9, color: marking?.customStyles?.text?.color, opacity: 0.7 }}>
                                    x{marking.data.available_count}
                                </Text>
                            )}
                        </TouchableOpacity>
                    );
                }}
            />

            <ManageDateSheet
                visible={sheetVisible}
                onClose={() => setSheetVisible(false)}
                dayData={selectedDayData}
                roomTypeId={selectedRoomId}
                onSaveSuccess={() => {
                    // Refresh calendar
                    if (selectedRoomId && propertyId) {
                        fetchCalendar(propertyId, selectedRoomId);
                    }
                }}
            />
        </YStack>
    );
}
