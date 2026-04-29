import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, Modal, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../ThemeContext';
import { useUserProfile } from '../context/UserProfileContext';
import { useAuth } from '../context/AuthContext';
import { COUNTRIES, findCountry } from '../data/countries';
import { useLocalize } from '../data/localize';
import ScreenHeader from '../components/ScreenHeader';
import SettingsRow, { SettingsRowDivider } from '../components/SettingsRow';
import SettingsGroup from '../components/SettingsGroup';
import SheetHandle, { useDismissibleSheet } from '../components/SheetHandle';
import Toast from '../components/Toast';
import { useUpperT } from '../i18n/upper';
import { rs, rf } from '../utils/responsive';

const GENDER_OPTION_KEYS = [
  { value: 'female', i18nKey: 'accountInfo.genderOptions.female' },
  { value: 'male', i18nKey: 'accountInfo.genderOptions.male' },
  { value: 'other', i18nKey: 'accountInfo.genderOptions.other' },
  { value: 'prefer_not', i18nKey: 'accountInfo.genderOptions.preferNot' },
];

function pad(n) { return String(n).padStart(2, '0'); }

function parseDate(str) {
  if (!str || typeof str !== 'string') return null;
  const m = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return { year: +m[1], month: +m[2], day: +m[3] };
}

function formatDate(year, month, day) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function formatDateDisplay(str, language) {
  const p = parseDate(str);
  if (!p) return null;
  try {
    return new Date(p.year, p.month - 1, p.day).toLocaleDateString(language || undefined, {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch {
    return `${pad(p.day)}.${pad(p.month)}.${p.year}`;
  }
}

function monthLabel(monthNum, language) {
  try {
    return new Date(2000, monthNum - 1, 1).toLocaleDateString(language || undefined, { month: 'long' });
  } catch {
    return String(monthNum);
  }
}

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

export default function AccountInfoScreen() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const tu = useUpperT();
  const { profile, loading, updateProfile } = useUserProfile();
  const { user, isAnonymous } = useAuth();
  const localize = useLocalize();
  const s = useMemo(() => makeStyles(theme), [theme]);

  // Local edit state — Save'e basana kadar profile güncellenmez
  const [firstName, setFirstName] = useState(profile.firstName || '');
  const [birthDate, setBirthDate] = useState(profile.birthDate || null);
  const [gender, setGender] = useState(profile.gender || null);
  const [city, setCity] = useState(profile.city || '');
  const [countryCode, setCountryCode] = useState(profile.countryCode || null);

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [genderPickerVisible, setGenderPickerVisible] = useState(false);
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Profile geç yüklendiyse bir kez senkronla
  useEffect(() => {
    if (!loading) {
      setFirstName(profile.firstName || '');
      setBirthDate(profile.birthDate || null);
      setGender(profile.gender || null);
      setCity(profile.city || '');
      setCountryCode(profile.countryCode || null);
    }
  }, [loading, profile.firstName, profile.birthDate, profile.gender, profile.city, profile.countryCode]);

  const dirty =
    (firstName.trim() || null) !== (profile.firstName || null) ||
    (birthDate || null) !== (profile.birthDate || null) ||
    (gender || null) !== (profile.gender || null) ||
    (city.trim() || null) !== (profile.city || null) ||
    (countryCode || null) !== (profile.countryCode || null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const handleSave = async () => {
    if (!dirty || saving) return;
    setSaving(true);
    try {
      await updateProfile({
        firstName: firstName.trim() || null,
        birthDate: birthDate || null,
        gender: gender || null,
        city: city.trim() || null,
        countryCode: countryCode || null,
      });
      showToast(t('accountInfo.savedToast'));
    } catch {
      showToast(t('accountInfo.saveFailedToast'));
    } finally {
      setSaving(false);
    }
  };

  const genderLabel = useMemo(() => {
    const opt = GENDER_OPTION_KEYS.find((g) => g.value === gender);
    return opt ? t(opt.i18nKey) : null;
  }, [gender, t]);

  const countryLabel = useMemo(() => {
    const c = findCountry(countryCode);
    return c ? localize(c.name) : null;
  }, [countryCode, localize]);

  const birthLabel = useMemo(() => formatDateDisplay(birthDate, i18n.language), [birthDate, i18n.language]);

  return (
    <SafeAreaView style={s.container}>
      <ScreenHeader title={t('accountInfo.title')} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={20}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.intro}>
            {t('accountInfo.intro')}
          </Text>

          <SettingsGroup title={tu('accountInfo.personalGroup')}>
            <InputRow
              icon="✏️"
              label={t('accountInfo.firstName')}
              value={firstName}
              onChangeText={setFirstName}
              placeholder={t('accountInfo.firstNamePlaceholder')}
              maxLength={40}
              autoCapitalize="words"
              theme={theme}
              s={s}
            />
            <SettingsRowDivider />
            <SettingsRow
              icon="🎂"
              label={t('accountInfo.birthDate')}
              sublabel={birthLabel || t('common.notSpecified')}
              right={<Feather name="chevron-right" size={18} color={theme.colors.textMuted} />}
              onPress={() => setDatePickerVisible(true)}
            />
            <SettingsRowDivider />
            <SettingsRow
              icon="⚥"
              label={t('accountInfo.gender')}
              sublabel={genderLabel || t('common.notSpecified')}
              right={<Feather name="chevron-right" size={18} color={theme.colors.textMuted} />}
              onPress={() => setGenderPickerVisible(true)}
            />
          </SettingsGroup>

          {!isAnonymous && (
            <SettingsGroup title={tu('accountInfo.membershipGroup')}>
              <SettingsRow
                icon="✉️"
                label={t('accountInfo.email')}
                sublabel={user?.email || t('common.notSpecified')}
              />
              <SettingsRowDivider />
              <SettingsRow
                icon="💎"
                label={t('accountInfo.plan')}
                sublabel={t('accountInfo.planFree')}
              />
            </SettingsGroup>
          )}

          <SettingsGroup title={tu('accountInfo.locationGroup')}>
            <InputRow
              icon="🏙️"
              label={t('accountInfo.city')}
              value={city}
              onChangeText={setCity}
              placeholder={t('accountInfo.cityPlaceholder')}
              maxLength={60}
              autoCapitalize="words"
              theme={theme}
              s={s}
            />
            <SettingsRowDivider />
            <SettingsRow
              icon="🌍"
              label={t('accountInfo.country')}
              sublabel={countryLabel || t('common.notSpecified')}
              right={<Feather name="chevron-right" size={18} color={theme.colors.textMuted} />}
              onPress={() => setCountryPickerVisible(true)}
            />
          </SettingsGroup>

          <TouchableOpacity
            style={[
              s.saveBtn,
              { backgroundColor: theme.colors.primary, opacity: dirty && !saving ? 1 : 0.45 },
            ]}
            onPress={handleSave}
            disabled={!dirty || saving}
            activeOpacity={0.84}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={s.saveBtnText}>{t('accountInfo.save')}</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 80 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <DatePickerModal
        visible={datePickerVisible}
        initial={birthDate}
        onClose={() => setDatePickerVisible(false)}
        onSelect={(d) => {
          setBirthDate(d);
          setDatePickerVisible(false);
        }}
      />

      <OptionPickerModal
        visible={genderPickerVisible}
        title={t('accountInfo.gender')}
        options={GENDER_OPTION_KEYS.map((g) => ({ value: g.value, label: t(g.i18nKey) }))}
        selected={gender}
        onClose={() => setGenderPickerVisible(false)}
        onSelect={(v) => {
          setGender(v);
          setGenderPickerVisible(false);
        }}
        clearable
        onClear={() => {
          setGender(null);
          setGenderPickerVisible(false);
        }}
      />

      <CountryPickerModal
        visible={countryPickerVisible}
        selected={countryCode}
        onClose={() => setCountryPickerVisible(false)}
        onSelect={(code) => {
          setCountryCode(code);
          setCountryPickerVisible(false);
        }}
        onClear={() => {
          setCountryCode(null);
          setCountryPickerVisible(false);
        }}
      />

      <Toast
        visible={toastVisible}
        message={toastMessage}
        onHide={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// Input row — title üstte, TextInput altta, sol ikonla
// ─────────────────────────────────────────────
function InputRow({ icon, label, value, onChangeText, placeholder, maxLength, autoCapitalize, theme, s }) {
  return (
    <View style={s.inputRow}>
      <View style={[s.inputIconWrap, { backgroundColor: theme.colors.surfaceElevated }]}>
        <Text style={s.inputIcon}>{icon}</Text>
      </View>
      <View style={s.inputRowContent}>
        <Text style={s.inputRowLabel}>{label}</Text>
        <TextInput
          style={s.inputRowInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          returnKeyType="done"
        />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────
// Date picker (3 sütun: gün / ay / yıl)
// ─────────────────────────────────────────────
function DatePickerModal({ visible, initial, onClose, onSelect }) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const s = useMemo(() => makeStyles(theme), [theme]);

  const today = new Date();
  const initParsed = parseDate(initial);
  const defaultYear = initParsed?.year || today.getFullYear() - 25;
  const defaultMonth = initParsed?.month || 1;
  const defaultDay = initParsed?.day || 1;

  const [y, setY] = useState(defaultYear);
  const [m, setM] = useState(defaultMonth);
  const [d, setD] = useState(defaultDay);

  useEffect(() => {
    if (visible) {
      const p = parseDate(initial);
      setY(p?.year || today.getFullYear() - 25);
      setM(p?.month || 1);
      setD(p?.day || 1);
    }
  }, [visible, initial]); // eslint-disable-line react-hooks/exhaustive-deps

  const years = useMemo(() => {
    const max = today.getFullYear();
    const arr = [];
    for (let i = max; i >= 1900; i--) arr.push(i);
    return arr;
  }, [today]);

  const days = useMemo(() => {
    const dim = daysInMonth(y, m);
    const arr = [];
    for (let i = 1; i <= dim; i++) arr.push(i);
    return arr;
  }, [y, m]);

  // Eğer ay/yıl değişimi gün sayısını küçültüyorsa düzelt
  useEffect(() => {
    const dim = daysInMonth(y, m);
    if (d > dim) setD(dim);
  }, [y, m]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConfirm = () => onSelect(formatDate(y, m, d));
  const { mounted, panHandlers, animatedStyle, overlayStyle, requestClose } = useDismissibleSheet(visible, onClose);
  const insets = useSafeAreaInsets();

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={requestClose} statusBarTranslucent>
      <Animated.View style={[s.pickerOverlay, overlayStyle]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={requestClose} activeOpacity={1} />
        <Animated.View style={[s.pickerSheet, { paddingBottom: rs(20) + insets.bottom }, animatedStyle]}>
          <SheetHandle panHandlers={panHandlers} />
          <Text style={s.pickerTitle}>{t('accountInfo.birthDate')}</Text>

          <View style={s.wheelRow}>
            <Wheel data={days} value={d} onChange={setD} />
            <Wheel
              data={Array.from({ length: 12 }, (_, i) => i + 1)}
              value={m}
              onChange={setM}
              formatter={(v) => monthLabel(v, i18n.language)}
            />
            <Wheel data={years} value={y} onChange={setY} />
          </View>

          <View style={s.pickerActions}>
            <TouchableOpacity onPress={onClose} style={[s.pickerBtn, s.pickerBtnGhost, { borderColor: theme.colors.borderLight }]} activeOpacity={0.72}>
              <Text style={[s.pickerBtnGhostText, { color: theme.colors.textSecondary }]}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={[s.pickerBtn, { backgroundColor: theme.colors.primary }]} activeOpacity={0.84}>
              <Text style={s.pickerBtnPrimaryText}>{t('common.ok')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function Wheel({ data, value, onChange, formatter }) {
  const { theme } = useTheme();
  const s = useMemo(() => makeStyles(theme), [theme]);
  const ITEM_H = rs(40);
  const ref = useRef(null);

  const initialIndex = Math.max(0, data.indexOf(value));

  useEffect(() => {
    const idx = data.indexOf(value);
    if (idx >= 0 && ref.current) {
      // Sonraki frame'de scroll — layout sonrası
      requestAnimationFrame(() => {
        try {
          ref.current.scrollToOffset({ offset: idx * ITEM_H, animated: false });
        } catch {}
      });
    }
  }, [value, data]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMomentumEnd = (e) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const idx = Math.round(offsetY / ITEM_H);
    const clamped = Math.max(0, Math.min(data.length - 1, idx));
    const next = data[clamped];
    if (next !== value) onChange(next);
  };

  return (
    <View style={s.wheel}>
      <View pointerEvents="none" style={[s.wheelHighlight, { borderColor: theme.colors.border }]} />
      <FlatList
        ref={ref}
        data={data}
        keyExtractor={(item) => String(item)}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({ length: ITEM_H, offset: ITEM_H * index, index })}
        initialScrollIndex={initialIndex}
        onMomentumScrollEnd={handleMomentumEnd}
        contentContainerStyle={{ paddingVertical: ITEM_H * 2 }}
        renderItem={({ item }) => (
          <View style={[s.wheelItem, { height: ITEM_H }]}>
            <Text style={[s.wheelText, item === value && { color: theme.colors.text, fontWeight: '700' }]}>
              {formatter ? formatter(item) : item}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

// ─────────────────────────────────────────────
// Generic option picker (cinsiyet)
// ─────────────────────────────────────────────
function OptionPickerModal({ visible, title, options, selected, onClose, onSelect, clearable, onClear }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const s = useMemo(() => makeStyles(theme), [theme]);
  const { mounted, panHandlers, animatedStyle, overlayStyle, requestClose } = useDismissibleSheet(visible, onClose);
  const insets = useSafeAreaInsets();

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={requestClose} statusBarTranslucent>
      <Animated.View style={[s.pickerOverlay, overlayStyle]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={requestClose} activeOpacity={1} />
        <Animated.View style={[s.pickerSheet, { paddingBottom: rs(20) + insets.bottom }, animatedStyle]}>
          <SheetHandle panHandlers={panHandlers} />
          <Text style={s.pickerTitle}>{title}</Text>

          <View>
            {options.map((opt) => {
              const sel = opt.value === selected;
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => onSelect(opt.value)}
                  activeOpacity={0.72}
                  style={[s.optRow, sel && { backgroundColor: theme.colors.primary + '14' }]}
                >
                  <Text style={[s.optText, { color: theme.colors.text }, sel && { fontWeight: '700' }]}>
                    {opt.label}
                  </Text>
                  {sel ? <Feather name="check" size={18} color={theme.colors.primary} /> : null}
                </TouchableOpacity>
              );
            })}
          </View>

          {clearable && selected ? (
            <TouchableOpacity
              onPress={onClear}
              style={[s.pickerBtn, s.pickerBtnGhost, { borderColor: theme.colors.borderLight, marginTop: rs(12) }]}
              activeOpacity={0.72}
            >
              <Text style={[s.pickerBtnGhostText, { color: theme.colors.textSecondary }]}>{t('common.clearSelection')}</Text>
            </TouchableOpacity>
          ) : null}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ─────────────────────────────────────────────
// Country picker — search + scrollable list
// ─────────────────────────────────────────────
function CountryPickerModal({ visible, selected, onClose, onSelect, onClear }) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const localize = useLocalize();
  const s = useMemo(() => makeStyles(theme), [theme]);
  const [query, setQuery] = useState('');
  const { mounted, panHandlers, animatedStyle, overlayStyle, requestClose } = useDismissibleSheet(visible, onClose);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!visible) setQuery('');
  }, [visible]);

  const lang = i18n.language || 'tr';

  const localizedCountries = useMemo(() => {
    const collator = new Intl.Collator(lang, { sensitivity: 'base' });
    return COUNTRIES
      .map((c) => ({ ...c, label: localize(c.name) }))
      .sort((a, b) => collator.compare(a.label, b.label));
  }, [lang, localize]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase(lang);
    if (!q) return localizedCountries;
    return localizedCountries.filter((c) => c.label.toLocaleLowerCase(lang).includes(q));
  }, [query, lang, localizedCountries]);

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={requestClose} statusBarTranslucent>
      <Animated.View style={[s.pickerOverlay, overlayStyle]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={requestClose} activeOpacity={1} />
        <Animated.View style={[s.pickerSheet, s.countrySheet, animatedStyle]}>
          <SheetHandle panHandlers={panHandlers} />

          <View style={s.titleRow}>
            <Text style={[s.pickerTitle, { marginBottom: 0, flex: 1 }]}>{t('accountInfo.country')}</Text>
            <TouchableOpacity style={s.closeBtn} onPress={requestClose} activeOpacity={0.7} hitSlop={8}>
              <Feather name="x" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={s.searchWrap}>
            <Feather name="search" size={16} color={theme.colors.textMuted} style={s.searchIcon} />
            <TextInput
              style={s.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder={t('accountInfo.countrySearch')}
              placeholderTextColor={theme.colors.textMuted}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {query.length > 0 ? (
              <TouchableOpacity
                onPress={() => setQuery('')}
                hitSlop={10}
                style={s.searchClear}
                activeOpacity={0.6}
              >
                <Feather name="x-circle" size={16} color={theme.colors.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={s.countryListWrap}
            keyboardVerticalOffset={0}
          >
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.code}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={filtered.length === 0 ? s.emptyContent : null}
              renderItem={({ item }) => {
                const sel = item.code === selected;
                return (
                  <TouchableOpacity
                    onPress={() => onSelect(item.code)}
                    activeOpacity={0.72}
                    style={[s.optRow, sel && { backgroundColor: theme.colors.primary + '14' }]}
                  >
                    <View style={s.optLeft}>
                      <Text style={s.flagText}>{item.flag}</Text>
                      <Text style={[s.optText, { color: theme.colors.text }, sel && { fontWeight: '700' }]}>
                        {item.label}
                      </Text>
                    </View>
                    {sel ? <Feather name="check" size={18} color={theme.colors.primary} /> : null}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={[s.optText, { textAlign: 'center', color: theme.colors.textMuted }]}>
                  {t('common.noResults')}
                </Text>
              }
            />

            {selected ? (
              <TouchableOpacity
                onPress={onClear}
                style={[
                  s.pickerBtn,
                  s.pickerBtnGhost,
                  { borderColor: theme.colors.borderLight, marginTop: rs(12), marginBottom: insets.bottom > 0 ? insets.bottom - rs(8) : rs(4) },
                ]}
                activeOpacity={0.72}
              >
                <Text style={[s.pickerBtnGhostText, { color: theme.colors.textSecondary }]}>{t('common.clearSelection')}</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ height: insets.bottom }} />
            )}
          </KeyboardAvoidingView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const makeStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scroll: {
      paddingHorizontal: rs(16),
      paddingTop: rs(20),
    },
    intro: {
      fontSize: rf(13),
      color: theme.colors.textMuted,
      marginBottom: rs(20),
      lineHeight: rf(20),
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: rs(16),
      paddingVertical: rs(13),
      gap: rs(12),
    },
    inputIconWrap: {
      width: rs(38),
      height: rs(38),
      borderRadius: rs(11),
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputIcon: {
      fontSize: rf(18),
    },
    inputRowContent: {
      flex: 1,
    },
    inputRowLabel: {
      fontSize: rf(15),
      fontWeight: '600',
      color: theme.colors.text,
    },
    inputRowInput: {
      fontSize: rf(13),
      fontWeight: '500',
      color: theme.colors.text,
      paddingVertical: 0,
      paddingHorizontal: 0,
      marginTop: rs(1),
      backgroundColor: 'transparent',
    },
    saveBtn: {
      minHeight: rs(52),
      borderRadius: rs(14),
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: rs(8),
    },
    saveBtnText: {
      fontSize: rf(15),
      fontWeight: '800',
      color: '#FFFFFF',
    },

    // Picker (modal sheet) ortak
    pickerOverlay: {
      flex: 1,
      backgroundColor: 'rgba(7,7,26,0.78)',
      justifyContent: 'flex-end',
    },
    pickerSheet: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: rs(22),
      borderTopRightRadius: rs(22),
      paddingHorizontal: rs(20),
      paddingTop: 0,
      borderTopWidth: 1,
      borderColor: theme.colors.border,
    },
    countrySheet: {
      height: '88%',
    },
    countryListWrap: {
      flex: 1,
    },
    emptyContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    pickerTitle: {
      fontSize: rf(17),
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: rs(16),
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: rs(14),
      gap: rs(12),
    },
    closeBtn: {
      width: rs(32),
      height: rs(32),
      borderRadius: rs(16),
      backgroundColor: theme.colors.surfaceElevated || theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    searchWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: rs(12),
      paddingHorizontal: rs(12),
      marginBottom: rs(10),
      backgroundColor: theme.colors.background,
    },
    searchIcon: {
      marginRight: rs(8),
    },
    searchInput: {
      flex: 1,
      fontSize: rf(15),
      fontWeight: '500',
      color: theme.colors.text,
      paddingVertical: rs(10),
      backgroundColor: 'transparent',
    },
    searchClear: {
      paddingLeft: rs(6),
      paddingVertical: rs(4),
    },
    pickerActions: {
      flexDirection: 'row',
      gap: rs(10),
      marginTop: rs(18),
    },
    pickerBtn: {
      flex: 1,
      minHeight: rs(48),
      borderRadius: rs(12),
      alignItems: 'center',
      justifyContent: 'center',
    },
    pickerBtnGhost: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
    },
    pickerBtnGhostText: {
      fontSize: rf(15),
      fontWeight: '600',
    },
    pickerBtnPrimaryText: {
      fontSize: rf(15),
      fontWeight: '800',
      color: '#FFFFFF',
    },

    // Wheel
    wheelRow: {
      flexDirection: 'row',
      gap: rs(8),
    },
    wheel: {
      flex: 1,
      height: rs(40 * 5),
      position: 'relative',
    },
    wheelHighlight: {
      position: 'absolute',
      top: rs(40 * 2),
      left: 0,
      right: 0,
      height: rs(40),
      borderTopWidth: 1,
      borderBottomWidth: 1,
    },
    wheelItem: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    wheelText: {
      fontSize: rf(15),
      color: theme.colors.textMuted,
    },

    // Option rows
    optRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: rs(14),
      paddingVertical: rs(12),
      borderRadius: rs(10),
      marginBottom: rs(2),
    },
    optLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: rs(10),
      flex: 1,
    },
    flagText: {
      fontSize: rf(20),
    },
    optText: {
      fontSize: rf(15),
    },
  });
