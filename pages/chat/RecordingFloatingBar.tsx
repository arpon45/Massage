import React, { useEffect, useRef } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';

interface RecordingFloatingBarProps {
  recordingTime: number;
  isPaused: boolean;
  onPause: () => void;
  onStop: () => void;
  audioStream?: MediaStream | null;
}

// Real waveform visualizer using Web Audio API
const Waveform: React.FC<{ active: boolean; audioStream?: MediaStream | null }> = ({ active, audioStream }) => {
  const [barHeights, setBarHeights] = React.useState<number[]>(Array(24).fill(12));
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!audioStream || !active) {
      // fallback animation
      animationRef.current = window.setInterval(() => {
        setBarHeights(Array.from({ length: 24 }, (_, i) => 10 + Math.abs(Math.sin(Date.now()/200 + i) * 14)));
      }, 120);
      return () => { if (animationRef.current) clearInterval(animationRef.current); };
    }
    // Real analyser
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    const source = audioCtx.createMediaStreamSource(audioStream);
    source.connect(analyser);
    analyserRef.current = analyser;
    dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
    function draw() {
      if (!analyserRef.current || !dataArrayRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      const arr = Array.from(dataArrayRef.current).slice(0, 24).map(v => 8 + (v/255)*24);
      setBarHeights(arr);
      animationRef.current = requestAnimationFrame(draw);
    }
    if (active) draw();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current as any);
      audioCtx.close();
    };
  }, [audioStream, active]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', height: 28, mx: 2 }}>
      {barHeights.map((h, i) => (
        <Box
          key={i}
          sx={{
            width: 3,
            height: `${active ? h : 12}px`,
            bgcolor: active ? '#00e676' : '#444',
            borderRadius: 1,
            mx: 0.3,
            transition: 'height 0.18s',
          }}
        />
      ))}
    </Box>
  );
};

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

const RecordingFloatingBar: React.FC<RecordingFloatingBarProps> = ({ recordingTime, isPaused, onPause, onStop, audioStream }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        left: '50%',
        bottom: { xs: 16, md: 36 },
        transform: 'translateX(-50%)',
        bgcolor: '#111',
        borderRadius: 3,
        boxShadow: '0 4px 32px #000a',
        display: 'flex',
        alignItems: 'center',
        px: { xs: 2, md: 3 },
        py: 1.2,
        zIndex: 9999,
        minWidth: 260,
        maxWidth: '92vw',
        width: 'fit-content',
        gap: 2,
      }}
    >
      <Waveform active={!isPaused} audioStream={audioStream} />
      <Typography sx={{ color: '#fff', fontWeight: 700, fontFamily: 'monospace', fontSize: 20, minWidth: 64, textAlign: 'center', letterSpacing: 1 }}>
        {formatTime(recordingTime)}
      </Typography>
      <IconButton onClick={onPause} sx={{ color: isPaused ? '#ffeb3b' : '#fff', mx: 1 }}>
        <PauseIcon />
      </IconButton>
      <IconButton onClick={onStop} sx={{ color: '#ff1744', mx: 1 }}>
        <StopIcon />
      </IconButton>
    </Box>
  );
};

export default RecordingFloatingBar;
