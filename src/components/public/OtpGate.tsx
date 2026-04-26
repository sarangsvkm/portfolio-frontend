import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getVerifiedContact, type VerifiedContact } from '../public/verificationStorage';

interface OtpGateProps {
  children: React.ReactNode;
  featureLabel?: string;
}

const OtpGate: React.FC<OtpGateProps> = ({ children }) => {
  const location = useLocation();
  const [verifiedContact, setVerifiedContact] = useState<VerifiedContact | null>(getVerifiedContact());

  useEffect(() => {
    const handleStorage = () => {
      setVerifiedContact(getVerifiedContact());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  if (!verifiedContact) {
    // Redirect to home and tell it to show verification
    return <Navigate to="/" state={{ from: location, requireVerify: true }} replace />;
  }

  return <>{children}</>;
};

export default OtpGate;
