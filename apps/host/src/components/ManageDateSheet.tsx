
import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { Card, Text, Button, Input, YStack, XStack, Separator, useTheme } from '@weinn/ui';
import { CalendarDayData } from '../types';
import { supabase } from '@weinn/core';

interface ManageDateSheetProps {
    visible: boolean;
    onClose: () => void;
    dayData: CalendarDayData | null;
    roomTypeId: string | null;
    onSaveSuccess: () => void;
}

export function ManageDateSheet({ visible, onClose, dayData, roomTypeId, onSaveSuccess }: ManageDateSheetProps) {
    const theme = useTheme();
    const [price, setPrice] = useState('');
    const [blockedCount, setBlockedCount] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && dayData) {
            setPrice(dayData.price ? String(dayData.price) : '');
            // If we have blocked count > 0, prefill it? 
            // The RPC aggregates blocks, so we don't know the exact block ID to edit.
            // Simplified logic: We insert NEW blocks or NEW price overrides.
            // Editing existing ones is harder without ID.
            // For MVP: Just allow setting price and adding blocks.
            setBlockedCount('');
            setReason('');
        }
    }, [visible, dayData]);

    const handleSave = async () => {
        if (!roomTypeId || !dayData) return;
        setLoading(true);

        try {
            // 1. Save Price if changed
            if (price && parseFloat(price) !== dayData.price) {
                const { error } = await supabase
                    .from('room_prices')
                    .upsert({
                        room_type_id: roomTypeId,
                        date: dayData.date,
                        price: parseFloat(price)
                    }, { onConflict: 'room_type_id, date' });
                if (error) throw error;
            }

            // 2. Add Calendar Block if count > 0
            if (blockedCount && parseInt(blockedCount) > 0) {
                const { error } = await supabase
                    .from('calendar_blocks')
                    .insert({
                        room_type_id: roomTypeId,
                        start_date: dayData.date,
                        end_date: dayData.date,
                        blocked_count: parseInt(blockedCount),
                        reason: reason || 'Manual Block'
                    });
                if (error) throw error;
            }

            onSaveSuccess();
            onClose();
        } catch (e) {
            console.error('Error saving:', e);
            // Show error alert?
        } finally {
            setLoading(false);
        }
    };

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Card backgroundColor="$background" p="$4" borderRadius={16} elevation={5}>
                        <XStack justifyContent="space-between" alignItems="center" mb="$4">
                            <Text variant="titleMedium">Manage {dayData?.date}</Text>
                            <Button variant="ghost" onPress={onClose}>Close</Button>
                        </XStack>

                        <YStack gap="$4">
                            <YStack>
                                <Text variant="label" mb="$2">Price Override (LKR)</Text>
                                <Input
                                    value={price}
                                    onChangeText={setPrice}
                                    keyboardType="numeric"
                                    placeholder="Enter daily price"
                                />
                            </YStack>

                            <Separator />

                            <YStack>
                                <Text variant="label" mb="$2">Block Inventory</Text>
                                <Text variant="bodySmall" color="$onSurfaceVariant" mb="$2">
                                    Available: {dayData?.available_count ?? 0} / {dayData?.total_inventory ?? 0}
                                </Text>
                                <XStack gap="$2">
                                    <Input
                                        flex={1}
                                        value={blockedCount}
                                        onChangeText={setBlockedCount}
                                        keyboardType="numeric"
                                        placeholder="Count"
                                    />
                                    <Input
                                        flex={2}
                                        value={reason}
                                        onChangeText={setReason}
                                        placeholder="Reason (e.g. Maintenance)"
                                    />
                                </XStack>
                            </YStack>

                            <Button
                                variant="primary"
                                onPress={handleSave}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </YStack>
                    </Card>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        padding: 16,
        paddingBottom: 40,
    }
});
