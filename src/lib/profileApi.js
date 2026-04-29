import { apiFetch } from './apiClient';

export const PROFILE_FIELDS = [
  'firstName',
  'displayName',
  'birthDate',
  'gender',
  'city',
  'countryCode',
  'locale',
  'email',
];

export function getProfile() {
  return apiFetch('/me/profile', { method: 'GET' });
}

export function patchProfile(partial) {
  return apiFetch('/me/profile', { method: 'PATCH', body: partial });
}

export function deleteProfile() {
  return apiFetch('/me/profile', { method: 'DELETE' });
}
