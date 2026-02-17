import React from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Button, Input, useTheme, Card, XStack, YStack } from '@weinn/ui';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '@weinn/core';
import { getDialCodeByIso2 } from '../utils/phone';
import { OtpInput } from '../components/OtpInput';

// Types
type Profile = {
    id: string;
    phone: string | null;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    is_active: boolean;
    is_host: boolean;
};

export function HostAuthPhoneScreen({
    step,
    setStep,
    countryIso2,
    setCountryIso2,
    localPhone,
    setLocalPhone,
    code,
    setCode,
    loading,
    setLoading,
    status,
    setStatus,
    otpCooldownSeconds,
    setOtpCooldownSeconds,
    sendCode,
    verifyCode,
}: {
    step: 'phone' | 'code';
    setStep: (s: 'phone' | 'code') => void;
    countryIso2: string;
    setCountryIso2: (c: string) => void;
    localPhone: string;
    setLocalPhone: (p: string) => void;
    code: string;
    setCode: (c: string) => void;
    loading: boolean;
    setLoading: (l: boolean) => void;
    status: string;
    setStatus: (s: string) => void;
    otpCooldownSeconds: number;
    setOtpCooldownSeconds: (s: number) => void;
    sendCode: () => void;
    verifyCode: () => void;
}) {
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const dialCode = getDialCodeByIso2(countryIso2);

    return (
        <View style={{ flex: 1, backgroundColor: theme.background.get() }}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        {step === 'phone' ? (
                            <>
                                {/* Brand Header */}
                                <View style={{ alignItems: 'center', marginBottom: 48, marginTop: insets.top + 24 }}>
                                    <View style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: theme.tertiaryContainer.get(), alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                                        <Text variant="header" style={{ fontWeight: 'bold', color: theme.color.get() }}>H</Text>
                                    </View>
                                    <Text variant="header" style={{ fontWeight: 'bold', textAlign: 'center', color: theme.color.get(), marginBottom: 8 }}>WeInn Host</Text>
                                    <Text variant="body" style={{ textAlign: 'center', color: theme.gray11.get() }}>Manage your listings and bookings.</Text>
                                </View>

                                <YStack gap="$4">
                                    <XStack gap="$3">
                                        <Input
                                            value={`+${dialCode}`}
                                            // @ts-ignore
                                            editable={false}
                                            style={{ width: 90, textAlign: 'center' }}
                                        />
                                        <Input
                                            placeholder="Phone Number"
                                            value={localPhone}
                                            onChangeText={setLocalPhone}
                                            keyboardType="phone-pad"
                                            style={{ flex: 1 }}
                                            autoFocus
                                        />
                                    </XStack>
                                    <View>
                                        <Text variant="label" style={{ color: theme.gray11.get(), marginBottom: 8 }}>
                                            We'll send you a 6-digit verification code.
                                        </Text>
                                        <Button
                                            variant="primary"
                                            loading={loading}
                                            disabled={loading || !localPhone || otpCooldownSeconds > 0}
                                            onPress={sendCode}
                                        >
                                            {otpCooldownSeconds > 0 ? `Wait ${otpCooldownSeconds}s` : 'Continue'}
                                        </Button>
                                    </View>
                                </YStack>
                                <View style={{ flex: 1 }} />
                                <View style={{ alignItems: 'center', marginBottom: insets.bottom }}>
                                    <Button variant="outline" chromeless onPress={() => { }}>Switch to Guest App</Button>
                                </View>
                            </>
                        ) : (
                            <>
                                <View style={{ alignItems: 'flex-start', marginBottom: 32, marginTop: insets.top }}>
                                    <Button variant="outline" chromeless icon={<Icon name="arrow-left" size={24} color={theme.color.get()} />} onPress={() => {
                                        setCode('');
                                        setStep('phone');
                                        setOtpCooldownSeconds(0);
                                    }} style={{ marginLeft: -12 }} />
                                    <Text variant="header" style={{ fontWeight: 'bold', color: theme.color.get(), marginBottom: 8 }}>Verify your number</Text>
                                    <Text variant="body" style={{ color: theme.gray11.get() }}>
                                        Enter the code sent to +{dialCode} {localPhone}
                                    </Text>
                                </View>

                                <YStack gap="$5">
                                    <OtpInput
                                        code={code}
                                        onChangeCode={setCode}
                                    />

                                    <XStack justifyContent="center" alignItems="center">
                                        <Text variant="body" style={{ color: theme.gray11.get() }}>Didn't receive the code? </Text>
                                        <TouchableOpacity onPress={sendCode} disabled={loading || otpCooldownSeconds > 0}>
                                            <Text variant="body" style={{ color: otpCooldownSeconds > 0 ? theme.gray10.get() : theme.primary.get(), fontWeight: 'bold' }}>
                                                {otpCooldownSeconds > 0 ? `Resend in ${otpCooldownSeconds}s` : 'Resend Code'}
                                            </Text>
                                        </TouchableOpacity>
                                    </XStack>

                                    <Button
                                        variant="primary"
                                        loading={loading}
                                        disabled={loading || code.length !== 6}
                                        onPress={verifyCode}
                                    >
                                        Verify & Continue
                                    </Button>
                                </YStack>
                            </>
                        )}

                        {status ? (
                            <Text style={{ textAlign: 'center', marginTop: 16, color: theme.red10.get(), fontSize: 12 }}>
                                {status}
                            </Text>
                        ) : null}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

export function HostAuthProfileScreen({
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    loading,
    completeProfile,
}: {
    firstName: string;
    setFirstName: (s: string) => void;
    lastName: string;
    setLastName: (s: string) => void;
    email: string;
    setEmail: (s: string) => void;
    loading: boolean;
    completeProfile: () => void;
}) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <View style={{ flex: 1, backgroundColor: theme.background.get() }}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
                    <View style={{ marginTop: insets.top + 24, marginBottom: 48, alignItems: 'center' }}>
                        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: theme.tertiaryContainer.get(), alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                            <Text variant="header" style={{ fontWeight: 'bold', color: theme.color.get() }}>H</Text>
                        </View>
                        <Text variant="title" style={{ fontWeight: 'bold', textAlign: 'center' }}>Host Profile</Text>
                        <Text variant="body" style={{ textAlign: 'center', color: theme.gray11.get(), marginTop: 8 }}>
                            Complete your profile to activate your account.
                        </Text>
                    </View>

                    <YStack gap="$4">
                        <YStack gap="$1">
                            <Text variant="label" marginLeft="$1">First Name</Text>
                            <Input
                                value={firstName}
                                onChangeText={setFirstName}
                            />
                        </YStack>
                        <YStack gap="$1">
                            <Text variant="label" marginLeft="$1">Last Name</Text>
                            <Input
                                value={lastName}
                                onChangeText={setLastName}
                            />
                        </YStack>
                        <YStack gap="$1">
                            <Text variant="label" marginLeft="$1">Email (optional)</Text>
                            <Input
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </YStack>

                        <YStack gap="$3" marginTop="$4">
                            <Button
                                variant="primary"
                                loading={loading}
                                disabled={loading || !firstName.trim() || !lastName.trim()}
                                onPress={completeProfile}
                            >
                                Continue
                            </Button>
                            <Button disabled={loading} variant="outline" chromeless onPress={() => supabase.auth.signOut()}>
                                Sign out
                            </Button>
                        </YStack>
                    </YStack>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

export function HostAuthBecomeHostScreen({
    loading,
    becomeHost,
}: {
    loading: boolean;
    becomeHost: () => void;
}) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <View style={{ flex: 1, backgroundColor: theme.background.get(), justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ padding: 32, width: '100%', maxWidth: 400, alignItems: 'center' }}>
                <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: theme.secondaryContainer.get(), alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
                    <Text variant="header">🚀</Text>
                </View>
                <Text variant="header" style={{ fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>You're almost there</Text>
                <Text variant="body" style={{ textAlign: 'center', color: theme.gray11.get(), marginBottom: 32 }}>
                    Your account is active. Enable Host mode to start creating listings and managing bookings.
                </Text>
                <YStack width="100%" gap="$3">
                    <Button
                        variant="primary"
                        loading={loading}
                        disabled={loading}
                        onPress={becomeHost}
                    >
                        Become a Host
                    </Button>
                    <Button disabled={loading} variant="outline" chromeless onPress={() => supabase.auth.signOut()}>
                        Sign out
                    </Button>
                </YStack>
            </View>
        </View>
    );
}
