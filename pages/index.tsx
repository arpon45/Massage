import { useRouter } from 'next/router';
import AuthForm from '../src/components/AuthForm';
import { useEffect } from 'react';
import { supabase } from '../src/utils/supabaseClient';
import { motion } from 'framer-motion';
import Particles from '@tsparticles/react';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        // Check if user has a profile in the 'profiles' table
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (!profile) router.replace('/profile-setup');
        else router.replace('/chat');
      }
    });
  }, [router]);
  return (
    <div style={{ minHeight: '100vh', width: '100vw', position: 'relative', overflow: 'hidden', background: 'linear-gradient(120deg,#1976d2 0%,#00c6ff 100%)' }}>
      <Particles
        id="tsparticles-login"
        options={{
          background: { color: { value: 'transparent' } },
          fpsLimit: 60,
          particles: {
            color: { value: ['#fff', '#1976d2', '#00c6ff'] },
            links: { enable: true, color: '#fff', distance: 120 },
            move: { enable: true, speed: 1.2 },
            number: { value: 45 },
            opacity: { value: 0.5 },
            shape: { type: 'circle' },
            size: { value: 3 },
          },
          detectRetina: true,
        }}
        style={{ position: 'absolute', zIndex: 0 }}
      />
      <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', position: 'relative', zIndex: 2 }}>
        <motion.div
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, type: 'spring', bounce: 0.45 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '100%',
            marginTop: '8vh',
            marginBottom: 0,
            background: 'none',
            boxShadow: 'none',
            borderRadius: 0,
            padding: 0,
            minWidth: 320,
            maxWidth: '92vw',
            backdropFilter: 'none'
          }}
        >
          <motion.div initial={{ scale: 0.99 }} animate={{ scale: 1.06 }} transition={{ duration: 1.4, yoyo: Infinity }}>
            <div style={{
              fontSize: 54,
              fontWeight: 900,
              letterSpacing: 1.5,
              color: '#fff',
              textShadow: '0 0 14px #00c6ff, 0 0 32px #1976d2cc, 0 2px 6px #1976d2',
              marginBottom: 8,
              fontFamily: 'Montserrat Black, Oswald, Orbitron, Arial Black, sans-serif',
              textAlign: 'center',
              lineHeight: 1.08,
              filter: 'brightness(1.25)'
            }}>
              Chatify
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}>
            <div style={{
              fontSize: 27,
              fontWeight: 700,
              color: '#fff',
              textShadow: '0 4px 24px #1976d2bb, 0 0 12px #00c6ffcc',
              marginBottom: 18,
              letterSpacing: 1.2,
              fontFamily: 'Inter, Poppins, Montserrat, sans-serif',
              textAlign: 'center',
              lineHeight: 1.12,
              filter: 'brightness(1.2)'
            }}>
              Sign in to your account
            </div>
          </motion.div>
          <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AuthForm onAuth={async () => {
              // Check for profile after login/signup
              const { data: { session } } = await supabase.auth.getSession();
              if (session) {
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', session.user.id)
                  .single();
                if (!profile) router.replace('/profile-setup');
                else router.replace('/chat');
              }
            }} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
