import React, { useRef, useEffect, useState } from 'react';
import { Box, IconButton, Slider, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

interface CustomAudioPlayerProps {
  src: string;
  duration: number | null;
  setDuration: (d: number) => void;
  sx?: React.CSSProperties;
}

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

const CustomAudioPlayer: React.FC<CustomAudioPlayerProps> = ({ src, duration, setDuration, sx }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const loaded = () => {
      if (audio.duration && isFinite(audio.duration)) setDuration(audio.duration);
      else {
        audio.currentTime = 1e101;
        audio.ontimeupdate = () => {
          audio.ontimeupdate = null;
          setDuration(audio.duration);
          audio.currentTime = 0;
        };
      }
    };
    audio.addEventListener('loadedmetadata', loaded);
    return () => audio.removeEventListener('loadedmetadata', loaded);
  }, [src, setDuration]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    playing ? audio.play() : audio.pause();
  }, [playing]);

  const handleTimeChange = (_: any, value: number | number[]) => {
    const t = Array.isArray(value) ? value[0] : value;
    setCurrentTime(t);
    if (audioRef.current) audioRef.current.currentTime = t;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        background: '#111',
        borderRadius: 2,
        p: { xs: 0.5, md: 1.5 },
        px: { xs: 1, md: 2 },
        gap: { xs: 1, md: 2 },
        ...sx,
        minWidth: 0,
        maxWidth: '100%',
        justifyContent: 'center',
        boxSizing: 'border-box',
        flexWrap: 'wrap',
      }}
    >
      <audio
        ref={audioRef}
        src={src}
        style={{ display: 'none' }}
        onTimeUpdate={e => setCurrentTime(e.currentTarget.currentTime)}
        onEnded={() => setPlaying(false)}
        onLoadedMetadata={e => setDuration(e.currentTarget.duration)}
      />
      <IconButton onClick={() => setPlaying(p => !p)} sx={{ color: '#fff', mr: 1, p: 1.2 }}>
        {playing ? <PauseIcon sx={{ fontSize: 28 }} /> : <PlayArrowIcon sx={{ fontSize: 28 }} />}
      </IconButton>

      <Slider
        min={0}
        max={duration || 1}
        value={currentTime}
        onChange={handleTimeChange}
        sx={{ color: '#fff', width: 140, mx: 1 }}
      />

      <VolumeUpIcon sx={{ color: '#fff', ml: 1, mr: 0.5 }} />
      <Slider
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={(_, v) => {
          const val = Array.isArray(v) ? v[0] : v;
          setVolume(val);
          if (audioRef.current) audioRef.current.volume = val;
        }}
        sx={{ color: '#fff', width: 60, ml: 1 }}
      />
    </Box>
  );
};

export default CustomAudioPlayer;
