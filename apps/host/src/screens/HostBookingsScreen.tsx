import React from 'react';
import { View, ScrollView } from 'react-native';
import { useTheme, Text, Card, Button, Chip, XStack, YStack, Avatar, IconButton } from '@weinn/ui';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@weinn/core';

// Helpers for Calendar
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDaysInMonth(month: number, year: number) {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    return days;
}

function getFirstDayOfMonth(month: number, year: number) {
    return new Date(year, month, 1).getDay();
}

type Booking = {
    id: string;
    reservation_code: string;
    first_name: string;
    last_name: string;
    status: string;
    check_in_date: string;
    check_out_date: string;
    properties: { title: string } | null;
};

export function HostBookingsScreen() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = React.useState(false);
    const [bookings, setBookings] = React.useState<Booking[]>([]);

    // Calendar State
    const [currentDate, setCurrentDate] = React.useState(new Date());
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const load = React.useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('bookings')
                .select('id, reservation_code, first_name, last_name, status, check_in_date, check_out_date, properties(title)')
                .order('check_in_date', { ascending: true }); // Order by check-in for agenda

            if (error) throw error;
            setBookings(data as any as Booking[]);
        } catch (e) {
            // handle error
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        load();
    }, [load]);

    // Calendar Generation
    const daysInMonth = getDaysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);
    const calendarGrid: (Date | null)[] = [];

    // Empty slots for start of month
    for (let i = 0; i < firstDay; i++) {
        calendarGrid.push(null);
    }
    // Days
    daysInMonth.forEach(d => calendarGrid.push(d));

    // Check if a day has a booking
    const getBookingForDay = (day: Date) => {
        const dateStr = day.toISOString().split('T')[0];
        return bookings.find(b => b.check_in_date === dateStr);
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.background.get() }}>
            <View style={{ paddingHorizontal: 16, paddingTop: insets.top + 8, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.background.get(), borderBottomWidth: 1, borderBottomColor: theme.borderColor.get() }}>
                <Button variant="ghost" icon={<Icon name="calendar" size={24} color={theme.color.get()} />} onPress={() => { }} width={48} height={48} />
                <Text variant="title" style={{ fontWeight: 'bold' }}>Calendar</Text>
                <Button variant="ghost" icon={<Icon name="refresh" size={24} color={theme.color.get()} />} onPress={load} width={48} height={48} />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}>
                {/* Month Selector */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 }}>
                    <Button variant="ghost" icon={<Icon name="chevron-left" size={24} color={theme.color.get()} />} onPress={() => setCurrentDate(new Date(year, month - 1, 1))} />
                    <Text variant="title" style={{ fontWeight: 'bold', width: 140, textAlign: 'center' }}>
                        {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </Text>
                    <Button variant="ghost" icon={<Icon name="chevron-right" size={24} color={theme.color.get()} />} onPress={() => setCurrentDate(new Date(year, month + 1, 1))} />
                </View>

                {/* Calendar Grid */}
                <Card variant="filled" style={{ marginHorizontal: 16, borderRadius: 16, padding: 16, backgroundColor: theme.surfaceVariant.get() }}>
                    {/* Headers */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 }}>
                        {DAYS.map(d => (
                            <Text key={d} variant="label" style={{ color: theme.gray9.get(), width: 32, textAlign: 'center' }}>{d}</Text>
                        ))}
                    </View>

                    {/* Grid */}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        {calendarGrid.map((date, i) => {
                            if (!date) return <View key={`empty-${i}`} style={{ width: '14.28%', aspectRatio: 1 }} />;

                            const booking = getBookingForDay(date);
                            const isToday = date.toDateString() === new Date().toDateString();

                            return (
                                <View key={i} style={{ width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' }}>
                                    <View style={{
                                        width: 32, height: 32, borderRadius: 16,
                                        alignItems: 'center', justifyContent: 'center',
                                        backgroundColor: isToday ? theme.primary.get() : (booking ? theme.secondaryContainer.get() : 'transparent')
                                    }}>
                                        <Text variant="body" style={{
                                            color: isToday ? theme.onPrimary.get() : (booking ? theme.onSecondaryContainer.get() : theme.color.get()),
                                            fontWeight: (isToday || booking) ? 'bold' : 'normal'
                                        }}>
                                            {date.getDate()}
                                        </Text>
                                    </View>
                                    {booking && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: theme.primary.get(), marginTop: 2 }} />}
                                </View>
                            );
                        })}
                    </View>
                </Card>

                {/* Agenda List */}
                <View style={{ padding: 16, marginTop: 16 }}>
                    <Text variant="title" style={{ fontWeight: 'bold', marginBottom: 16 }}>Upcoming Bookings</Text>

                    {bookings.map((item) => {
                        const date = new Date(item.check_in_date);
                        const day = date.getDate();
                        const monthStr = date.toLocaleDateString(undefined, { month: 'short' }).toUpperCase();

                        return (
                            <Card key={item.id} variant="filled" style={{ marginBottom: 12, borderRadius: 12, backgroundColor: theme.surfaceVariant.get(), overflow: 'hidden' }}>
                                <View style={{ flexDirection: 'row' }}>
                                    {/* Date Box */}
                                    <View style={{ width: 60, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.gray3.get(), paddingVertical: 12 }}>
                                        <Text variant="title" style={{ fontWeight: 'bold' }}>{day}</Text>
                                        <Text variant="label" style={{ fontWeight: 'bold', color: theme.gray11.get() }}>{monthStr}</Text>
                                    </View>

                                    {/* Content */}
                                    <View style={{ flex: 1, padding: 12, justifyContent: 'center' }}>
                                        <Text variant="body" style={{ fontWeight: 'bold' }}>{item.first_name} {item.last_name}</Text>
                                        <Text variant="label" style={{ color: theme.gray11.get() }}>{item.properties?.title}</Text>
                                    </View>

                                    {/* Status */}
                                    <View style={{ justifyContent: 'center', paddingRight: 12 }}>
                                        <Chip selected={item.status === 'confirmed'}>
                                            {item.status}
                                        </Chip>
                                    </View>
                                </View>
                            </Card>
                        );
                    })}

                    {bookings.length === 0 && (
                        <View style={{ alignItems: 'center', padding: 24 }}>
                            <Text variant="body" style={{ color: theme.gray11.get() }}>No upcoming bookings</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
