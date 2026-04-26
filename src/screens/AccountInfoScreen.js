import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, Modal, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../ThemeContext';
import { useUserProfile } from '../context/UserProfileContext';
import { COUNTRIES, findCountry } from '../data/countries';
import ScreenHeader from '../components/ScreenHeader';
import SettingsRow, { SettingsRowDivider } from '../components/SettingsRow';
import SettingsGroup from '../components/SettingsGroup';
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
    return c ? c.name : null;
  }, [countryCode]);

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
            <View style={s.fieldRow}>
              <Text style={s.fieldLabel}>{t('accountInfo.firstName')}</Text>
              <TextInput
                style={s.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder={t('accountInfo.firstNamePlaceholder')}
                placeholderTextColor={theme.colors.textMuted}
                maxLength={40}
                autoCapitalize="words"
                returnKeyType="done"
              />
            </View>
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
              icon="👤"
              label={t('accountInfo.gender')}
              sublabel={genderLabel || t('common.notSpecified')}
              right={<Feather name="chevron-right" size={18} color={theme.colors.textMuted} />}
              onPress={() => setGenderPickerVisible(true)}
            />
          </SettingsGroup>

          <SettingsGroup title={tu('accountInfo.locationGroup')}>
            <View style={s.fieldRow}>
              <Text style={s.fieldLabel}>{t('accountInfo.city')}</Text>
              <TextInput
                style={s.input}
                value={city}
                onChangeText={setCity}
                placeholder={t('accountInfo.cityPlaceholder')}
                placeholderTextColor={theme.colors.textMuted}
                maxLength={60}
                autoCapitalize="words"
                returnKeyType="done"
              />
            </View>
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

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.pickerOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
        <View style={s.pickerSheet}>
          <View style={s.pickerHandle} />
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
        </View>
      </View>
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

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.pickerOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
        <View style={s.pickerSheet}>
          <View style={s.pickerHandle} />
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
        </View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────
// Country picker — search + scrollable list
// ─────────────────────────────────────────────
function CountryPickerModal({ visible, selected, onClose, onSelect, onClear }) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const s = useMemo(() => makeStyles(theme), [theme]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!visible) setQuery('');
  }, [visible]);

  const filtered = useMemo(() => {
    const lang = i18n.language || 'tr';
    const q = query.trim().toLocaleLowerCase(lang);
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((c) => c.name.toLocaleLowerCase(lang).includes(q));
  }, [query, i18n.language]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.pickerOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
        <View style={[s.pickerSheet, { maxHeight: '78%' }]}>
          <View style={s.pickerHandle} />
          <Text style={s.pickerTitle}>{t('accountInfo.country')}</Text>

          <TextInput
            style={[s.input, { marginHorizontal: 0, marginBottom: rs(8) }]}
            value={query}
            onChangeText={setQuery}
            placeholder={t('accountInfo.countrySearch')}
            placeholderTextColor={theme.colors.textMuted}
            autoCorrect={false}
            autoCapitalize="none"
          />

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const sel = item.code === selected;
              return (
                <TouchableOpacity
                  onPress={() => onSelect(item.code)}
                  activeOpacity={0.72}
                  style={[s.optRow, sel && { backgroundColor: theme.colors.primary + '14' }]}
                >
                  <Text style={[s.optText, { color: theme.colors.text }, sel && { fontWeight: '700' }]}>
                    {item.name}
                  </Text>
                  {sel ? <Feather name="check" size={18} color={theme.colors.primary} /> : null}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <Text style={[s.optText, { textAlign: 'center', color: theme.colors.textMuted, marginTop: rs(20) }]}>
                {t('common.noResults')}
              </Text>
            }
          />

          {selected ? (
            <TouchableOpacity
              onPress={onClear}
              style={[s.pickerBtn, s.pickerBtnGhost, { borderColor: theme.colors.borderLight, marginTop: rs(12) }]}
              activeOpacity={0.72}
            >
              <Text style={[s.pickerBtnGhostText, { color: theme.colors.textSecondary }]}>{t('common.clearSelection')}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
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
    fieldRow: {
      paddingHorizontal: rs(16),
      paddingVertical: rs(13),
      gap: rs(4),
    },
    fieldLabel: {
      fontSize: rf(12),
      fontWeight: '600',
      color: theme.colors.textMuted,
      letterSpacing: 0.4,
    },
    input: {
      fontSize: rf(15),
      fontWeight: '500',
      color: theme.colors.text,
      paddingVertical: rs(6),
      paddingHorizontal: 0,
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
      paddingTop: rs(8),
      paddingBottom: rs(28),
      borderTopWidth: 1,
      borderColor: theme.colors.border,
    },
    pickerHandle: {
      alignSelf: 'center',
      width: rs(40),
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.border,
      marginBottom: rs(12),
    },
    pickerTitle: {
      fontSize: rf(17),
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: rs(16),
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
    optText: {
      fontSize: rf(15),
    },
  });
