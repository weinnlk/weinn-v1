import React from 'react';
import { View, Animated, StyleSheet, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { Button, Text, useTheme, Card, XStack, YStack, IconButton } from '@weinn/ui';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ListingDraftV3 } from '../types';

type WizardStepProps = {
    title: string;
    navigation: any;
    scrollY: Animated.Value;
    onNext?: () => void;
    nextLabel?: string;
    nextDisabled?: boolean;
    children: React.ReactNode;
};

export type WizardV3ContextValue = {
    authUserId: string | null;
    draftV3: ListingDraftV3;
    ensureDraftPropertyRow: (userId: string) => Promise<string>;
    saveDraftToSupabaseV3: (userId: string, draft: ListingDraftV3) => Promise<void>;
};

export const WizardV3Context = React.createContext<WizardV3ContextValue | null>(null);

export function WizardStepShell(props: WizardStepProps) {
    const { title, navigation, onNext, nextLabel = 'Next', nextDisabled, children, scrollY } = props;
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const ctx = React.useContext(WizardV3Context);

    const [closeOpen, setCloseOpen] = React.useState(false);
    const [closeStatus, setCloseStatus] = React.useState<string>('');
    const [closeSaving, setCloseSaving] = React.useState(false);

    const onCloseConfirm = React.useCallback(async () => {
        if (!ctx?.authUserId) {
            setCloseOpen(false);
            navigation.popToTop();
            return;
        }

        setCloseSaving(true);
        setCloseStatus('');
        try {
            await ctx.ensureDraftPropertyRow(ctx.authUserId);
            await ctx.saveDraftToSupabaseV3(ctx.authUserId, ctx.draftV3);
            setCloseOpen(false);
            navigation.popToTop();
        } catch (e: any) {
            setCloseStatus(e?.message ?? 'Failed to save draft');
        } finally {
            setCloseSaving(false);
        }
    }, [ctx, navigation]);

    return (
        <View style={{ flex: 1, backgroundColor: theme.background.get() }}>
            {/* Custom Appbar */}
            <View style={{
                height: 56 + insets.top,
                paddingTop: insets.top,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                backgroundColor: theme.background.get(),
                borderBottomWidth: 1,
                borderBottomColor: theme.borderColor.get(),
            }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8, marginLeft: -8 }}>
                    <Icon name="arrow-left" size={24} color={theme.color.get()} />
                </TouchableOpacity>
                <Text variant="title" style={{ flex: 1, marginLeft: 16, fontWeight: 'bold' }}>{title}</Text>
                <TouchableOpacity onPress={() => setCloseOpen(true)} style={{ padding: 8, marginRight: -8 }}>
                    <Icon name="close" size={24} color={theme.color.get()} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                <Animated.ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                        padding: 16,
                        paddingBottom: 100 + insets.bottom,
                        maxWidth: 600,
                        alignSelf: 'center',
                        width: '100%',
                        gap: 16
                    }}
                    onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
                    scrollEventThrottle={16}
                >
                    {children}
                </Animated.ScrollView>
            </KeyboardAvoidingView>

            <View
                style={{
                    padding: 16,
                    borderTopWidth: 1,
                    borderColor: theme.borderColor.get(),
                    backgroundColor: theme.background.get(),
                    paddingBottom: 16 + insets.bottom,
                    maxWidth: 600,
                    alignSelf: 'center',
                    width: '100%',
                }}
            >
                {onNext ? (
                    <Button
                        variant="primary"
                        onPress={onNext}
                        disabled={nextDisabled}
                    >
                        {nextLabel}
                    </Button>
                ) : null}
            </View>

            {/* Custom Dialog Modal */}
            <Modal
                visible={closeOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setCloseOpen(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                    <Card variant="elevated" style={{ width: '100%', maxWidth: 320, padding: 24, gap: 16 }}>
                        <Text variant="title">Exit listing setup?</Text>
                        <Text variant="body">Your progress will be saved and you can continue later.</Text>
                        {closeStatus ? <Text variant="label" style={{ color: theme.red10.get() }}>{closeStatus}</Text> : null}

                        <XStack justifyContent="flex-end" gap="$2">
                            <Button variant="ghost" disabled={closeSaving} onPress={() => setCloseOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="primary" loading={closeSaving} disabled={closeSaving} onPress={onCloseConfirm}>
                                Save & Exit
                            </Button>
                        </XStack>
                    </Card>
                </View>
            </Modal>
        </View>
    );
}

// Temporary TouchableOpacity replacement for simple icon buttons if IconButton is not robust enough or to match custom styling
// But we used standard View/TouchableOpacity for Appbar
import { TouchableOpacity } from 'react-native';
