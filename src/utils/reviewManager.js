import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';
import { Linking, Platform } from 'react-native';

const STORAGE_KEY = '@kartoyunu_review';

// TODO: Ayarla — bundle ID kararından sonra doldur
const IOS_APP_ID = 'XXXXXXXX';
const ANDROID_PACKAGE = 'com.kartoyunu.app';

const STORE_URL = Platform.select({
  ios: `https://apps.apple.com/app/id${IOS_APP_ID}?action=write-review`,
  android: `market://details?id=${ANDROID_PACKAGE}`,
});

async function getReviewData() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { lastAsked: null, timesAsked: 0 };
  } catch {
    return { lastAsked: null, timesAsked: 0 };
  }
}

async function saveReviewData(data) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function daysSince(isoDate) {
  if (!isoDate) return Infinity;
  return (Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24);
}

export async function shouldAutoAsk(totalGames) {
  const { timesAsked, lastAsked } = await getReviewData();

  if (timesAsked >= 3) return false;
  if (totalGames < 3) return false;

  if (timesAsked === 0) return true;
  if (timesAsked === 1) return daysSince(lastAsked) >= 15;
  if (timesAsked === 2) return daysSince(lastAsked) >= 30;

  return false;
}

export async function markAsked() {
  const data = await getReviewData();
  await saveReviewData({
    lastAsked: new Date().toISOString(),
    timesAsked: data.timesAsked + 1,
  });
}

export async function openReview() {
  const available = await StoreReview.isAvailableAsync();
  if (available) {
    await StoreReview.requestReview();
  } else {
    Linking.openURL(STORE_URL);
  }
}
