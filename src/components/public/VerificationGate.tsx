import { useMemo, useState } from 'react';
import { Loader2, Lock, Mail, ShieldCheck, Smartphone, User } from 'lucide-react';
import { contactService } from '../../services/contactService';
import type { OtpRequest } from '../../types';
import {
  clearPendingContact,
  getPendingContact,
  getVerifiedContact,
  setPendingContact,
  setVerifiedContact,
  type VerifiedContact,
} from './verificationStorage';

interface VerificationGateProps {
  featureLabel: string;
  onVerified: (contact: VerifiedContact) => void;
}

export default function VerificationGate({ featureLabel, onVerified }: VerificationGateProps) {
  const existingContact = useMemo(() => getVerifiedContact(), []);
  const pendingContact = useMemo(() => getPendingContact(), []);
  const initialContact = existingContact ?? pendingContact;
  const [step, setStep] = useState<'request' | 'verify'>(pendingContact ? 'verify' : 'request');
  const [form, setForm] = useState<OtpRequest>({
    name: initialContact?.name ?? '',
    email: initialContact?.email ?? '',
    phone: initialContact?.phone ?? '',
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (field: keyof OtpRequest, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleRequestOtp = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError('Enter name, email, and phone number to continue.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      };

      await contactService.requestOtp(payload);
      setPendingContact(payload);
      setStep('verify');
      setMessage('OTP sent successfully. Enter the OTP from your email to continue.');
    } catch (requestError) {
      console.error('OTP request failed', requestError);
      setError('Unable to send OTP right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!form.email.trim() || !otp.trim()) {
      setError('Enter the OTP sent to your email.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await contactService.verifyOtp({
        email: form.email.trim(),
        otp: otp.trim(),
      });

      const verifiedContact: VerifiedContact = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        verifiedAt: new Date().toISOString(),
      };

      clearPendingContact();
      setVerifiedContact(verifiedContact);
      setMessage('Verification successful. You can now view the protected details.');
      onVerified(verifiedContact);
    } catch (verifyError) {
      console.error('OTP verification failed', verifyError);
      setError('OTP verification failed. Check the OTP and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200">
          <Lock className="h-5 w-5" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Verification Required</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your details and verify with OTP to access {featureLabel}.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <span className="font-semibold">Name</span>
          <span className="flex items-center gap-3 rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
            <User className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={form.name}
              onChange={(event) => handleChange('name', event.target.value)}
              className="w-full bg-transparent outline-none"
              placeholder="Your full name"
            />
          </span>
        </label>

        <label className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <span className="font-semibold">Phone Number</span>
          <span className="flex items-center gap-3 rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
            <Smartphone className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={form.phone}
              onChange={(event) => handleChange('phone', event.target.value)}
              className="w-full bg-transparent outline-none"
              placeholder="Your phone number"
            />
          </span>
        </label>
      </div>

      <div className="mt-4">
        <label className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <span className="font-semibold">Email</span>
          <span className="flex items-center gap-3 rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
            <Mail className="h-4 w-4 text-gray-400" />
            <input
              type="email"
              value={form.email}
              onChange={(event) => handleChange('email', event.target.value)}
              className="w-full bg-transparent outline-none"
              placeholder="you@example.com"
            />
          </span>
        </label>
      </div>

      {step === 'verify' ? (
        <div className="mt-4">
          <label className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold">OTP</span>
            <span className="flex items-center gap-3 rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
              <ShieldCheck className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                className="w-full bg-transparent outline-none"
                placeholder="Enter OTP"
              />
            </span>
          </label>
        </div>
      ) : null}

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      {message ? <p className="mt-4 text-sm text-green-600">{message}</p> : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={step === 'request' ? handleRequestOtp : handleVerifyOtp}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {step === 'request' ? 'Send OTP' : 'Verify OTP'}
        </button>

        {step === 'verify' ? (
          <button
            type="button"
            onClick={() => {
              clearPendingContact();
              setOtp('');
              setStep('request');
              setError('');
              setMessage('');
            }}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900"
          >
            Edit Details
          </button>
        ) : null}

        {step === 'verify' ? (
          <button
            type="button"
            onClick={handleRequestOtp}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900"
          >
            Resend OTP
          </button>
        ) : null}
      </div>
    </div>
  );
}
