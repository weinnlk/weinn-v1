import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { Chip, IconButton, Text, useTheme, Card, Button, XStack, YStack } from '@weinn/ui';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export function MultiSelectChips({
    options,
    value,
    onChange,
}: {
    options: string[];
    value: string[];
    onChange: (next: string[]) => void;
}) {
    return (
        <XStack flexWrap="wrap" gap="$2">
            {(options ?? []).map((opt) => {
                const selected = (value ?? []).includes(opt);
                return (
                    <Chip
                        key={opt}
                        selected={selected}
                        onPress={() => {
                            const next = selected ? (value ?? []).filter((v) => v !== opt) : [...(value ?? []), opt];
                            onChange(next);
                        }}
                    >
                        {opt}
                    </Chip>
                );
            })}
        </XStack>
    );
}

export function Stepper({ value, onChange, min = 0, max }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
    const theme = useTheme();
    const canDec = value > min;
    const canInc = max == null ? true : value < max;
    return (
        <XStack alignItems="center" borderColor="$borderColor" borderWidth={1} borderRadius={8} overflow="hidden">
            <Button
                variant="ghost"
                disabled={!canDec}
                onPress={() => (canDec ? onChange(value - 1) : null)}
                width={44}
                height={44}
                borderRadius={0}
                icon={<Icon name="minus" size={20} color={canDec ? theme.color.get() : theme.gray8.get()} />}
            />
            <View style={{ width: 48, height: 44, alignItems: 'center', justifyContent: 'center', borderLeftWidth: 1, borderRightWidth: 1, borderColor: theme.borderColor.get() }}>
                <Text variant="title">{value}</Text>
            </View>
            <Button
                variant="ghost"
                disabled={!canInc}
                onPress={() => (canInc ? onChange(value + 1) : null)}
                width={44}
                height={44}
                borderRadius={0}
                icon={<Icon name="plus" size={20} color={canInc ? theme.color.get() : theme.gray8.get()} />}
            />
        </XStack>
    );
}

export const WIZARD_V3_TIME_OPTIONS = (() => {
    const out: string[] = [];
    for (let h = 0; h < 24; h++) {
        for (const m of [0, 30]) {
            const hh = String(h).padStart(2, '0');
            const mm = String(m).padStart(2, '0');
            out.push(`${hh}:${mm}`);
        }
    }
    return out;
})();

export function WizardV3TimeSelect({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string | undefined;
    onChange: (v: string) => void;
}) {
    const [open, setOpen] = React.useState(false);
    const theme = useTheme();

    return (
        <View style={{ marginTop: 8 }}>
            <Text variant="label" style={{ marginBottom: 6, color: theme.gray11.get() }}>{label}</Text>
            <TouchableOpacity
                onPress={() => setOpen(true)}
                style={{
                    height: 56,
                    borderWidth: 1,
                    borderColor: theme.borderColor.get(),
                    borderRadius: 4,
                    paddingHorizontal: 16,
                    justifyContent: 'center',
                    backgroundColor: theme.background.get(),
                }}
            >
                <Text variant="body" style={{ color: theme.color.get() }}>{value ?? 'Select'}</Text>
            </TouchableOpacity>

            <Modal
                visible={open}
                transparent
                animationType="fade"
                onRequestClose={() => setOpen(false)}
            >
                <TouchableOpacity
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}
                    activeOpacity={1}
                    onPress={() => setOpen(false)}
                >
                    <Card variant="elevated" style={{ width: '100%', maxHeight: '60%', padding: 0, overflow: 'hidden' }}>
                        <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: theme.borderColor.get() }}>
                            <Text variant="title">Select {label}</Text>
                        </View>
                        <FlatList
                            data={WIZARD_V3_TIME_OPTIONS}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: theme.borderColor.get() }}
                                    onPress={() => {
                                        onChange(item);
                                        setOpen(false);
                                    }}
                                >
                                    <Text variant="body" style={{ fontWeight: item === value ? 'bold' : 'normal', color: item === value ? theme.primary.get() : theme.color.get() }}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <View style={{ padding: 8 }}>
                            <Button variant="ghost" onPress={() => setOpen(false)}>Cancel</Button>
                        </View>
                    </Card>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}
