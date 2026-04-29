import { jsAuth } from './firebase';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!BASE_URL) {
  throw new Error(
    'EXPO_PUBLIC_API_BASE_URL is not set. Add it to .env and rebuild the native app.'
  );
}

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message || code || `HTTP ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function readBody(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

async function buildAuthHeader(forceRefresh = false) {
  const current = jsAuth.currentUser;
  if (!current) throw new ApiError(401, 'no_current_user', 'No Firebase user');
  const idToken = await current.getIdToken(forceRefresh);
  return `Bearer ${idToken}`;
}

async function execute(path, { method = 'GET', body } = {}, forceRefresh = false) {
  const headers = {
    Authorization: await buildAuthHeader(forceRefresh),
    Accept: 'application/json',
  };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) return null;

  const payload = await readBody(response);

  if (!response.ok) {
    const code = payload?.code || payload?.error || null;
    const message = payload?.message || payload?.raw || null;
    throw new ApiError(response.status, code, message);
  }

  return payload;
}

export async function apiFetch(path, options = {}) {
  try {
    return await execute(path, options, false);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      return execute(path, options, true);
    }
    throw err;
  }
}
