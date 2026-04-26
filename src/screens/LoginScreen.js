import React, { useMemo, useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, ActivityIndicator, Platform, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../context/AuthContext';
import { rs, rf } from '../utils/responsive';

export default function LoginScreen({ route }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const s = useMemo(() => makeStyles(theme), [theme]);
  const navigation = useNavigation();
  const { signInWithEmail, registerWithEmail, signInWithGoogleIdToken, signInWithApple, sendPasswordReset, GOOGLE_WEB_CLIENT_ID } = useAuth();

  const initialMode = route?.params?.mode ?? 'login';
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [googleRequest, googleResponse, googlePrompt] = Google.useAuthRequest({
    iosClientId: '953093478907-8851vo8vkt2mfdvmh6fate6kcu4bn691.apps.googleusercontent.com',
    androidClientId: '953093478907-0rcm7no4djkundi1npbb0lu88gtjcs75.apps.googleusercontent.com',
    webClientId: GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (googleResponse?.type === 'success') {
      const idToken = googleResponse.params?.id_token ?? googleResponse.authentication?.idToken;
      if (idToken) {
        handleWithLoading(() => signInWithGoogleIdToken(idToken));
      } else {
        setError(t('login.errors.googleFail'));
      }
    } else if (googleResponse?.type === 'error') {
      setError(t('login.errors.googleFail'));
    }
  }, [googleResponse]);

  const handleWithLoading = async (fn) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await fn();
      navigation.goBack();
    } catch (e) {
      setError(friendlyError(e.code, t));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setSuccessMessage(null);
      setError(t('login.errors.emailRequired'));
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await sendPasswordReset(email.trim());
      setSuccessMessage(t('login.resetSent'));
    } catch (e) {
      setError(friendlyError(e.code, t));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = () => {
    if (!email.trim() || !password.trim()) {
      setError(t('login.errors.credsRequired'));
      return;
    }
    if (mode === 'login') {
      handleWithLoading(() => signInWithEmail(email.trim(), password));
    } else {
      if (password.length < 6) {
        setError(t('login.errors.passwordTooShort'));
        return;
      }
      handleWithLoading(() => registerWithEmail(email.trim(), password));
    }
  };

  const handleApple = () => handleWithLoading(signInWithApple);

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={s.closeBtn} onPress={() => navigation.goBack()}>
          <Feather name="x" size={22} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <Text style={s.title}>
          {mode === 'login' ? t('login.loginTitle') : t('login.registerTitle')}
        </Text>
        <Text style={s.subtitle}>
          {mode === 'login' ? t('login.loginSub') : t('login.registerSub')}
        </Text>

        {/* Social sign-in */}
        <TouchableOpacity
          style={[s.socialBtn, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
          onPress={() => googlePrompt()}
          disabled={!googleRequest || loading}
          activeOpacity={0.78}
        >
          <Text style={s.googleIcon}>G</Text>
          <Text style={[s.socialBtnText, { color: theme.colors.text }]}>{t('login.google')}</Text>
        </TouchableOpacity>

        {Platform.OS === 'ios' && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={
              theme.isDark
                ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
            }
            cornerRadius={14}
            style={s.appleBtn}
            onPress={handleApple}
          />
        )}

        {/* Divider */}
        <View style={s.divider}>
          <View style={[s.dividerLine, { backgroundColor: theme.colors.border }]} />
          <Text style={[s.dividerText, { color: theme.colors.textMuted }]}>{t('common.or')}</Text>
          <View style={[s.dividerLine, { backgroundColor: theme.colors.border }]} />
        </View>

        {/* Email/password */}
        <TextInput
          style={[s.input, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text }]}
          placeholder={t('login.emailPlaceholder')}
          placeholderTextColor={theme.colors.textMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
          editable={!loading}
        />
        <TextInput
          style={[s.input, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text }]}
          placeholder={t('login.passwordPlaceholder')}
          placeholderTextColor={theme.colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        {mode === 'login' && (
          <TouchableOpacity
            style={s.forgotBtn}
            onPress={handleForgotPassword}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={[s.forgotText, { color: theme.colors.primary }]}>{t('login.forgot')}</Text>
          </TouchableOpacity>
        )}

        {error && <Text style={s.errorText}>{error}</Text>}
        {successMessage && <Text style={s.successText}>{successMessage}</Text>}

        <TouchableOpacity
          style={[s.submitBtn, { backgroundColor: theme.colors.primary }]}
          onPress={handleEmailSubmit}
          disabled={loading}
          activeOpacity={0.84}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.submitBtnText}>
                {mode === 'login' ? t('login.loginTitle') : t('login.registerTitle')}
              </Text>
          }
        </TouchableOpacity>

        {/* Toggle mode */}
        <TouchableOpacity
          style={s.toggleBtn}
          onPress={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); setSuccessMessage(null); }}
        >
          <Text style={[s.toggleText, { color: theme.colors.textSecondary }]}>
            {mode === 'login' ? t('login.noAccount') : t('login.hasAccount')}
            <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>
              {mode === 'login' ? t('login.register') : t('login.login')}
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function friendlyError(code, t) {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return t('login.errors.wrongCreds');
    case 'auth/email-already-in-use':
      return t('login.errors.emailInUse');
    case 'auth/invalid-email':
      return t('login.errors.invalidEmail');
    case 'auth/too-many-requests':
      return t('login.errors.tooManyRequests');
    case 'auth/credential-already-in-use':
      return t('login.errors.credentialInUse');
    default:
      // Bilinmeyen hatalarda code'u UI'a yansıt; debug ve teşhis kolaylaşsın.
      return code
        ? t('login.errors.unknownWithCode', { code })
        : t('login.errors.unknown');
  }
}

const makeStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { paddingHorizontal: rs(24), paddingTop: rs(16), paddingBottom: rs(40) },
  closeBtn: {
    width: rs(40), height: rs(40), borderRadius: rs(20),
    backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center',
    marginBottom: rs(28), borderWidth: 1, borderColor: theme.colors.border,
  },
  title: {
    fontSize: rf(28), fontWeight: '800', color: theme.colors.text,
    letterSpacing: -0.5, marginBottom: rs(6),
  },
  subtitle: {
    fontSize: rf(14), color: theme.colors.textSecondary, marginBottom: rs(28),
  },
  socialBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderRadius: rs(14), height: rs(52),
    marginBottom: rs(12), gap: rs(10),
  },
  googleIcon: {
    fontSize: rf(18), fontWeight: '800', color: '#4285F4',
  },
  socialBtnText: { fontSize: rf(15), fontWeight: '600' },
  appleBtn: { height: rs(52), marginBottom: rs(12) },
  divider: {
    flexDirection: 'row', alignItems: 'center', marginVertical: rs(20), gap: rs(12),
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: rf(12), fontWeight: '600' },
  input: {
    height: rs(52), borderWidth: 1.5, borderRadius: rs(14),
    paddingHorizontal: rs(16), fontSize: rf(15), marginBottom: rs(12),
  },
  errorText: {
    color: theme.colors.danger, fontSize: rf(13), fontWeight: '600',
    marginBottom: rs(12), textAlign: 'center',
  },
  successText: {
    color: theme.colors.success, fontSize: rf(13), fontWeight: '600',
    marginBottom: rs(12), textAlign: 'center',
  },
  forgotBtn: {
    alignSelf: 'flex-end', paddingVertical: rs(4), paddingHorizontal: rs(2), marginBottom: rs(8),
  },
  forgotText: { fontSize: rf(13), fontWeight: '600' },
  submitBtn: {
    height: rs(52), borderRadius: rs(14), alignItems: 'center',
    justifyContent: 'center', marginBottom: rs(16),
  },
  submitBtnText: { fontSize: rf(16), fontWeight: '700', color: '#fff' },
  toggleBtn: { alignItems: 'center', paddingVertical: rs(8) },
  toggleText: { fontSize: rf(14) },
});
