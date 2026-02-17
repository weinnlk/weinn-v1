import 'react-native-url-polyfill/auto';
import * as React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WeInnProvider, Button, Text, useTheme } from '@weinn/ui';
import { supabase, AuthProvider, useAuth } from '@weinn/core';
import { styles } from './src/styles';
import { GuestNavigator } from './src/navigation/GuestNavigator';
import { LoginScreen, CompleteProfileScreen } from './src/screens/AuthScreens';
import { getDialCodeByIso2 } from './src/utils/phone';

// DEV FLAGS
const SHOW_DEV_GRID_OVERLAY = false;

function GuestAppShell() {
  const { user, profile, loading: authLoading, refreshProfile, signOut } = useAuth();
  const theme = useTheme();

  // Login UI State
  const [step, setStep] = React.useState<'phone' | 'code'>('phone');
  const [countryIso2, setCountryIso2] = React.useState('LK');
  const [localPhone, setLocalPhone] = React.useState('');
  const [code, setCode] = React.useState('');
  const [status, setStatus] = React.useState<string>('');
  const [actionLoading, setActionLoading] = React.useState(false);
  const [otpCooldownSeconds, setOtpCooldownSeconds] = React.useState(0);

  // Profile Form State
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');

  // Sync profile state when profile loads
  React.useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name ?? '');
      setLastName(profile.last_name ?? '');
      setEmail(profile.email ?? '');
    }
  }, [profile]);

  // Derived State
  const dialCodeFromCountry = React.useMemo(() => getDialCodeByIso2(countryIso2), [countryIso2]);

  const e164Phone = React.useMemo(() => {
    const dc = dialCodeFromCountry.trim().startsWith('+') ? dialCodeFromCountry.trim() : `+${dialCodeFromCountry.trim()}`;
    const num = localPhone.replace(/\D/g, '');
    return `${dc}${num}`;
  }, [dialCodeFromCountry, localPhone]);

  const profileName = React.useMemo(() => {
    const name = `${(profile?.first_name ?? '').trim()} ${(profile?.last_name ?? '').trim()}`.trim();
    if (name) return name;
    if (profile?.email) return profile.email;
    return 'Guest';
  }, [profile]);

  // Determine App Step
  const appStep = React.useMemo(() => {
    if (!user) return 'auth';
    if (!profile?.is_active) return 'profile';
    return 'main';
  }, [user, profile]);

  // Actions
  const sendCode = async () => {
    if (otpCooldownSeconds > 0) return;
    setActionLoading(true);
    setStatus('');
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: e164Phone,
      });
      if (error) throw error;
      setStep('code');
      setStatus('OTP sent. Check your SMS.');
      setOtpCooldownSeconds(60);
    } catch (e) {
      setStatus((e as { message?: string })?.message ?? 'Failed to send OTP');
    } finally {
      setActionLoading(false);
    }
  };

  const verifyCode = async () => {
    setActionLoading(true);
    setStatus('');
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: e164Phone,
        token: code,
        type: 'sms',
      });
      if (error) throw error;
      // AuthProvider will pick up the user change
    } catch (e) {
      setStatus((e as { message?: string })?.message ?? 'Failed to verify OTP');
    } finally {
      setActionLoading(false);
    }
  };

  const completeProfile = async () => {
    setActionLoading(true);
    setStatus('');
    try {
      if (!user) throw new Error('Not signed in');
      if (!firstName.trim() || !lastName.trim()) {
        throw new Error('First name and last name are required');
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim() ? email.trim() : null,
          is_active: true,
          onboarded_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      await refreshProfile();
    } catch (e) {
      setStatus((e as { message?: string })?.message ?? 'Failed to complete profile');
    } finally {
      setActionLoading(false);
    }
  };

  // OTP Timer
  React.useEffect(() => {
    if (otpCooldownSeconds <= 0) return;
    const t = setInterval(() => {
      setOtpCooldownSeconds((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [otpCooldownSeconds]);

  // Reset auth UI on sign out
  React.useEffect(() => {
    if (!user) {
      setStep('phone');
      setLocalPhone('');
      setCode('');
      setFirstName('');
      setLastName('');
      setEmail('');
      setStatus('');
    }
  }, [user]);

  if (authLoading) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  return (
    <>
      <StatusBar style="dark" />
      {appStep === 'auth' ? (
        <LoginScreen
          step={step}
          countryIso2={countryIso2}
          localPhone={localPhone}
          code={code}
          loading={actionLoading}
          status={status}
          otpCooldownSeconds={otpCooldownSeconds}
          onCountryChange={setCountryIso2}
          onPhoneChange={setLocalPhone}
          onCodeChange={setCode}
          onSendCode={sendCode}
          onVerifyCode={verifyCode}
          onChangeNumber={() => {
            setCode('');
            setStep('phone');
            setOtpCooldownSeconds(0);
          }}
        />
      ) : appStep === 'main' ? (
        <GuestNavigator authUserId={user?.id ?? null} profileName={profileName} onSignOut={signOut} />
      ) : (
        <View style={styles.container}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 8 }}>
            <Text variant="title" style={{ fontWeight: 'bold' }}>WeInn Guest</Text>
          </View>

          {appStep === 'profile' ? (
            <CompleteProfileScreen
              firstName={firstName}
              lastName={lastName}
              email={email}
              loading={actionLoading}
              status={status}
              onFirstNameChange={setFirstName}
              onLastNameChange={setLastName}
              onEmailChange={setEmail}
              onSubmit={completeProfile}
            />
          ) : (
            // Fallback / Error state
            <Button disabled={actionLoading} variant="outline" onPress={signOut}>
              Sign out
            </Button>
          )}

          {status ? <Text style={{ color: theme.red10.get() }}>{status}</Text> : null}
        </View>
      )}
    </>
  );
}

export default function App() {

  return (
    <AuthProvider>
      <WeInnProvider>
        <GuestAppShell />
      </WeInnProvider>
    </AuthProvider>
  );
}
