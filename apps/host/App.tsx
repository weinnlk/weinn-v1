import { StatusBar } from 'expo-status-bar';
import * as React from 'react';

import { Provider as PaperProvider, Text, Button } from 'react-native-paper';
import { supabase, AuthProvider, useAuth } from '@weinn/core';
import { HostMain } from './src/screens/HostMain';
import { HostAuthPhoneScreen, HostAuthProfileScreen, HostAuthBecomeHostScreen } from './src/screens/HostAuthScreens';
import { weinnTheme } from './src/theme';
import { getDialCodeByIso2 } from './src/utils/phone';
import { View } from 'react-native';

function HostAppShell() {
  const { user, profile, loading: authLoading, refreshProfile, signOut } = useAuth();

  // Login UI State
  const [step, setStep] = React.useState<'phone' | 'code'>('phone');
  const [countryIso2, setCountryIso2] = React.useState('LK');
  const [localPhone, setLocalPhone] = React.useState('');
  const [code, setCode] = React.useState('');
  const [status, setStatus] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);
  const [otpCooldownSeconds, setOtpCooldownSeconds] = React.useState(0);

  // Profile Form State
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');

  // Sync profile state
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
    return name || 'User Name';
  }, [profile]);

  // App Step
  const appStep = React.useMemo(() => {
    if (!user) return 'auth';
    if (!profile?.is_active) return 'profile';
    if (!profile?.is_host) return 'become_host';
    return 'main';
  }, [user, profile]);

  // Actions
  const sendCode = async () => {
    if (otpCooldownSeconds > 0) return;
    setLoading(true);
    setStatus('');
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: e164Phone,
      });
      if (error) throw error;
      setStep('code');
      setStatus('OTP sent. Check your SMS.');
      setOtpCooldownSeconds(60);
    } catch (e: any) {
      setStatus(e?.message ?? 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setLoading(true);
    setStatus('');
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: e164Phone,
        token: code,
        type: 'sms',
      });
      if (error) throw error;
      // AuthProvider handles user update
    } catch (e: any) {
      setStatus(e?.message ?? 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const completeProfile = async () => {
    setLoading(true);
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
    } catch (e: any) {
      setStatus(e?.message ?? 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  const becomeHost = async () => {
    setLoading(true);
    setStatus('');
    try {
      if (!user) throw new Error('Not signed in');

      const { error } = await supabase
        .from('profiles')
        .update({
          is_host: true,
        })
        .eq('id', user.id);

      if (error) throw error;
      await refreshProfile();
    } catch (e: any) {
      setStatus(e?.message ?? 'Failed to become a host');
    } finally {
      setLoading(false);
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

  // Reset UI on Sign Out
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

  if (authLoading) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Loading Auth...</Text>
    </View>
  );

  return (
    <>
      <StatusBar style="dark" />
      {appStep === 'auth' ? (
        <HostAuthPhoneScreen
          step={step}
          setStep={setStep}
          countryIso2={countryIso2}
          setCountryIso2={setCountryIso2}
          localPhone={localPhone}
          setLocalPhone={setLocalPhone}
          code={code}
          setCode={setCode}
          loading={loading}
          setLoading={setLoading}
          status={status}
          setStatus={setStatus}
          otpCooldownSeconds={otpCooldownSeconds}
          setOtpCooldownSeconds={setOtpCooldownSeconds}
          sendCode={sendCode}
          verifyCode={verifyCode}
        />
      ) : appStep === 'main' ? (
        <HostMain authUserId={user!.id} profileName={profileName} onSignOut={signOut} />
      ) : appStep === 'profile' ? (
        <HostAuthProfileScreen
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          email={email}
          setEmail={setEmail}
          loading={loading}
          completeProfile={completeProfile}
        />
      ) : appStep === 'become_host' ? (
        <HostAuthBecomeHostScreen
          loading={loading}
          becomeHost={becomeHost}
        />
      ) : (
        // Fallback
        <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Text>Something went wrong.</Text>
          <Button onPress={signOut}>Sign Out</Button>
        </View>
      )}
    </>
  );
}

import { WeInnProvider } from '@weinn/ui';

export default function App() {
  return (
    <AuthProvider>
      <WeInnProvider>
        <PaperProvider theme={weinnTheme}>
          <HostAppShell />
        </PaperProvider>
      </WeInnProvider>
    </AuthProvider>
  );
}
