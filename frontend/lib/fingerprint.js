// frontend/lib/fingerprint.js
/**
 * Generates a lightweight, stable device fingerprint from browser signals.
 * Stored in localStorage after first computation.
 * Sent to backend via X-Device-Fingerprint header for anti-cheat analysis.
 */

const STORAGE_KEY = 'fsr_fingerprint';

const hashString = async (str) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
};

const collectSignals = () => {
  const signals = [
    navigator.userAgent,
    navigator.language,
    navigator.languages?.join(',') || '',
    String(screen.width),
    String(screen.height),
    String(screen.colorDepth),
    String(navigator.hardwareConcurrency || ''),
    Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    String(navigator.maxTouchPoints || 0),
    navigator.platform || '',
  ];
  return signals.join('|');
};

export const getFingerprint = async () => {
  if (typeof window === 'undefined') return null;

  // Return cached value if available
  const cached = localStorage.getItem(STORAGE_KEY);
  if (cached) return cached;

  try {
    const raw = collectSignals();
    const fp = await hashString(raw);
    localStorage.setItem(STORAGE_KEY, fp);
    return fp;
  } catch {
    return null;
  }
};

export const initFingerprint = async () => {
  const fp = await getFingerprint();
  if (fp) localStorage.setItem(STORAGE_KEY, fp);
  return fp;
};
