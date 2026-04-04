import type { OtpRequest } from '../../types';

export const PUBLIC_CONTACT_VERIFIED_KEY = 'public_contact_verified';
const PUBLIC_CONTACT_PENDING_KEY = 'public_contact_pending';

export interface VerifiedContact extends OtpRequest {
  verifiedAt: string;
}

export function getVerifiedContact(): VerifiedContact | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = localStorage.getItem(PUBLIC_CONTACT_VERIFIED_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as VerifiedContact;
  } catch {
    localStorage.removeItem(PUBLIC_CONTACT_VERIFIED_KEY);
    return null;
  }
}

export function setVerifiedContact(contact: VerifiedContact) {
  localStorage.setItem(PUBLIC_CONTACT_VERIFIED_KEY, JSON.stringify(contact));
  localStorage.removeItem(PUBLIC_CONTACT_PENDING_KEY);
}

export function getPendingContact(): OtpRequest | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = localStorage.getItem(PUBLIC_CONTACT_PENDING_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as OtpRequest;
  } catch {
    localStorage.removeItem(PUBLIC_CONTACT_PENDING_KEY);
    return null;
  }
}

export function setPendingContact(contact: OtpRequest) {
  localStorage.setItem(PUBLIC_CONTACT_PENDING_KEY, JSON.stringify(contact));
}

export function clearPendingContact() {
  localStorage.removeItem(PUBLIC_CONTACT_PENDING_KEY);
}
