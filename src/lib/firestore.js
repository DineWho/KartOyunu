import {
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebase';

export const PROFILE_SCHEMA_VERSION = 1;

export const PROFILE_FIELDS = [
  'firstName',
  'birthDate',
  'gender',
  'city',
  'countryCode',
  'locale',
  // Auth tarafından doldurulur (login sonrası senkronize edilir);
  // AccountInfoScreen bu alanları göstermez/yazmaz.
  'email',
  'displayName',
];

export function userDocRef(uid) {
  return doc(db, 'users', uid);
}

export function subscribeUserProfile(uid, onData, onError) {
  return onSnapshot(
    userDocRef(uid),
    (snap) => {
      onData(snap.exists() ? snap.data() : null);
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

export async function writeUserProfile(uid, partial) {
  const ref = userDocRef(uid);
  const snap = await getDoc(ref);
  const payload = {
    ...partial,
    schemaVersion: PROFILE_SCHEMA_VERSION,
    updatedAt: serverTimestamp(),
  };
  if (!snap.exists()) {
    payload.createdAt = serverTimestamp();
  }
  await setDoc(ref, payload, { merge: true });
}

export async function getUserProfileOnce(uid) {
  const snap = await getDoc(userDocRef(uid));
  return snap.exists() ? snap.data() : null;
}

export async function deleteUserProfile(uid) {
  await deleteDoc(userDocRef(uid));
}
