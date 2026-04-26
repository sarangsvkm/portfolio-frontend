import type { OtpRequest } from '../../types';

export const PUBLIC_CONTACT_VERIFIED_KEY = 'public_contact_verified';
const PUBLIC_CONTACT_PENDING_KEY = 'public_contact_pending';

export interface VerifiedContact extends OtpRequest {
  verifiedAt: string;
  ownerPhone?: string;
  ownerResumeUrl?: string;
}

const SESSION_EXPIRY_MS = 60 * 60 * 1000; // 1 Hour

export function getVerifiedContact(): VerifiedContact | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = localStorage.getItem(PUBLIC_CONTACT_VERIFIED_KEY);

  if (!raw) {
    return null;
  }

  try {
    const contact = JSON.parse(raw) as VerifiedContact;
    
    // 🕒 AUTO-LOCK: Check if session has expired
    const verifiedAt = new Date(contact.verifiedAt).getTime();
    const now = new Date().getTime();
    
    if (now - verifiedAt > SESSION_EXPIRY_MS) {
      localStorage.removeItem(PUBLIC_CONTACT_VERIFIED_KEY);
      return null;
    }
    
    return contact;
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
