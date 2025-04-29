import React, { useEffect, useState } from 'react';
import PinLockModal from './PinLockModal';
import SetPinModal from './SetPinModal';
import { supabase } from '../src/utils/supabaseClient';

export default function PinLockGate({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [pinHash, setPinHash] = useState<string | null>(null);
  const [showSetPin, setShowSetPin] = useState(false);
  const [showPinLock, setShowPinLock] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);
      // Fetch pin_hash
      const { data, error } = await supabase
        .from('profiles')
        .select('pin_hash')
        .eq('id', user.id)
        .single();
      if (!error && data && data.pin_hash) {
        setPinHash(data.pin_hash);
        // Check if user just set their PIN (first time)
        if (localStorage.getItem('justSetPin') === 'true') {
          // Don't show PinLockModal this time, clear the flag
          localStorage.removeItem('justSetPin');
          setUnlocked(true);
          setShowPinLock(false);
        } else {
          setShowPinLock(true);
        }
      } else {
        setShowSetPin(true);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) return null;
  if (!userId) return <>{children}</>; // Not logged in

  return (
    <>
      <SetPinModal open={showSetPin} onSet={() => {
        setShowSetPin(false);
        setUnlocked(true); // Unlock for this session, do not show PinLockModal
        localStorage.setItem('justSetPin', 'true'); // Mark that user just set PIN
      }} userId={userId} />
      <PinLockModal open={showPinLock && !unlocked} onUnlock={() => { setUnlocked(true); setShowPinLock(false); }} userId={userId} />
      {unlocked || (!pinHash && !showSetPin) ? children : null}
    </>
  );
}
