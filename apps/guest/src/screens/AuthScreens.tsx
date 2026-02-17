import React from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Text, Button, Input, XStack, YStack, Card } from '@weinn/ui';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getDialCodeByIso2 } from '../utils/phone';
import { OtpInput } from '../components/OtpInput';

export function LoginScreen({
    step,
    countryIso2,
    localPhone,
    code,
    loading,
    status,
    otpCooldownSeconds,
    onCountryChange,
    onPhoneChange,
    onCodeChange,
    onSendCode,
    onVerifyCode,
    onChangeNumber,
}: {
    step: 'phone' | 'code';
    countryIso2: string;
    localPhone: string;
    code: string;
    loading: boolean;
    status: string;
    otpCooldownSeconds: number;
    onCountryChange: (iso2: string) => void;
    onPhoneChange: (phone: string) => void;
    onCodeChange: (code: string) => void;
    onSendCode: () => void;
    onVerifyCode: () => void;
    onChangeNumber: () => void;
}) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const dialCode = getDialCodeByIso2(countryIso2);

    return (
        <View style={{ flex: 1, backgroundColor: theme.background.get() }}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        {step === 'phone' ? (
                            <>
                                {/* Search/Brand Header */}
                                <YStack alignItems="center" marginBottom={48} marginTop={insets.top + 24}>
                                    <View style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: theme.primary.get(), alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                                        <Text variant="header" style={{ fontWeight: 'bold', color: 'white' }}>W</Text>
                                    </View>
                                    <Text variant="title" style={{ fontWeight: 'bold', textAlign: 'center', color: theme.color.get(), marginBottom: 8 }}>Welcome to WeInn</Text>
                                    <Text variant="body" style={{ textAlign: 'center', color: theme.gray11.get() }}>Enter your phone number to get started.</Text>
                                </YStack>

                                <YStack gap="$4">
                                    <XStack gap="$3">
                                        <YStack width={90}>
                                            <Input
                                                value={`+${dialCode}`}
                                                editable={false}
                                                backgroundColor={theme.gray3.get()}
                                                color={theme.color.get()}
                                            />
                                            <Text variant="label" style={{ position: 'absolute', top: -20, left: 4 }}>Code</Text>
                                        </YStack>
                                        <YStack flex={1}>
                                            <Input
                                                value={localPhone}
                                                onChangeText={onPhoneChange}
                                                keyboardType="phone-pad"
                                                autoFocus
                                                backgroundColor={theme.background.get()}
                                            />
                                            <Text variant="label" style={{ position: 'absolute', top: -20, left: 4 }}>Mobile Number</Text>
                                        </YStack>
                                    </XStack>
                                    <YStack>
                                        <Text variant="label" style={{ color: theme.gray11.get(), marginBottom: 8 }}>
                                            We'll send you a 6-digit verification code.
                                        </Text>
                                        <Button
                                            variant="primary"
                                            loading={loading}
                                            disabled={loading || !localPhone || otpCooldownSeconds > 0}
                                            onPress={onSendCode}
                                            size="$5"
                                        >
                                            {otpCooldownSeconds > 0 ? `Wait ${otpCooldownSeconds}s` : 'Continue'}
                                        </Button>
                                    </YStack>
                                </YStack>
                                <View style={{ flex: 1 }} />
                                <Text variant="label" style={{ textAlign: 'center', color: theme.gray11.get(), marginBottom: insets.bottom }}>
                                    By continuing, you agree to our Terms of Service.
                                </Text>
                            </>
                        ) : (
                            <>
                                <YStack alignItems="flex-start" marginBottom={32} marginTop={insets.top}>
                                    <Button
                                        variant="outline"
                                        icon={<Icon name="arrow-left" size={24} color={theme.color.get()} />}
                                        onPress={onChangeNumber}
                                        style={{ marginLeft: -12, marginBottom: 16 }}
                                        chromeless
                                        size="$3"
                                    />
                                    <Text variant="title" style={{ fontWeight: 'bold', color: theme.color.get(), marginBottom: 8 }}>Verify your number</Text>
                                    <Text variant="body" style={{ color: theme.gray11.get() }}>
                                        Enter the 6-digit code sent to +{dialCode} {localPhone}
                                    </Text>
                                </YStack>

                                <YStack gap="$6">
                                    <OtpInput
                                        code={code}
                                        onChangeCode={onCodeChange}
                                    />

                                    <XStack justifyContent="center" alignItems="center" gap="$2">
                                        <Text variant="body" style={{ color: theme.gray11.get() }}>Didn't receive the code? </Text>
                                        <TouchableOpacity onPress={onSendCode} disabled={loading || otpCooldownSeconds > 0}>
                                            <Text variant="body" style={{ color: otpCooldownSeconds > 0 ? theme.gray11.get() : theme.primary.get(), fontWeight: 'bold' }}>
                                                {otpCooldownSeconds > 0 ? `Resend in ${otpCooldownSeconds}s` : 'Resend Code'}
                                            </Text>
                                        </TouchableOpacity>
                                    </XStack>

                                    <Button
                                        variant="primary"
                                        loading={loading}
                                        disabled={loading || code.length !== 6}
                                        onPress={onVerifyCode}
                                        size="$5"
                                    >
                                        Verify & Continue
                                    </Button>
                                </YStack>
                            </>
                        )}

                        {status ? (
                            <Text style={{ textAlign: 'center', marginTop: 16, color: theme.red10.get() }}>
                                {status}
                            </Text>
                        ) : null}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

export function CompleteProfileScreen({
    firstName,
    lastName,
    email,
    loading,
    status,
    onFirstNameChange,
    onLastNameChange,
    onEmailChange,
    onSubmit,
}: {
    firstName: string;
    lastName: string;
    email: string;
    loading: boolean;
    status: string;
    onFirstNameChange: (text: string) => void;
    onLastNameChange: (text: string) => void;
    onEmailChange: (text: string) => void;
    onSubmit: () => void;
}) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <View style={{ flex: 1, backgroundColor: theme.background.get() }}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
                    <YStack marginTop={insets.top + 24} marginBottom={48} alignItems="center">
                        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: theme.gray3.get(), alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                            <Text variant="title" style={{ fontWeight: 'bold', color: theme.gray11.get() }}>?</Text>
                        </View>
                        <Text variant="header" style={{ fontWeight: 'bold', textAlign: 'center' }}>Complete Profile</Text>
                        <Text variant="body" style={{ color: theme.gray11.get(), textAlign: 'center', marginTop: 8 }}>Tell us a bit about yourself to finish setup.</Text>
                    </YStack>

                    <YStack gap="$4">
                        <XStack gap="$3">
                            <YStack flex={1}>
                                <Text variant="label" marginBottom={4}>First Name</Text>
                                <Input
                                    value={firstName}
                                    onChangeText={onFirstNameChange}
                                    backgroundColor={theme.background.get()}
                                />
                            </YStack>
                            <YStack flex={1}>
                                <Text variant="label" marginBottom={4}>Last Name</Text>
                                <Input
                                    value={lastName}
                                    onChangeText={onLastNameChange}
                                    backgroundColor={theme.background.get()}
                                />
                            </YStack>
                        </XStack>
                        <YStack>
                            <Text variant="label" marginBottom={4}>Email</Text>
                            <Input
                                value={email}
                                onChangeText={onEmailChange}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                backgroundColor={theme.background.get()}
                            />
                        </YStack>

                        <Button
                            variant="primary"
                            onPress={onSubmit}
                            loading={loading}
                            disabled={!firstName || !lastName || loading}
                            size="$5"
                            style={{ marginTop: 16 }}
                        >
                            Complete Profile
                        </Button>
                    </YStack>

                    {status ? (
                        <Text style={{ marginTop: 16, textAlign: 'center', color: theme.red10.get() }}>
                            {status}
                        </Text>
                    ) : null}
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}


