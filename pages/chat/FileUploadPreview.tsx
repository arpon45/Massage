import React from 'react';
import { Box, Typography, Button, IconButton, LinearProgress, Fade } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface FileUploadPreviewProps {
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  uploadProgress: number; // 0-100
  onSend: () => void;
  onCancel: () => void;
  onClose: () => void;
  uploading: boolean;
  visible: boolean;
}

function getFileIcon(type: string, url: string) {
  if (type.startsWith('image/')) return <img src={url} alt={type} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, display: 'block' }} />;
  if (type.startsWith('video/')) return <span style={{ fontSize: 36 }}>🎬</span>;
  if (type.startsWith('audio/')) return <span style={{ fontSize: 36 }}>🎵</span>;
  if (type === 'application/pdf') return <span style={{ fontSize: 34 }}>📄</span>;
  if (type.includes('zip') || type.includes('rar')) return <span style={{ fontSize: 36 }}>🗜️</span>;
  if (type.includes('csv')) return <span style={{ fontSize: 36 }}>📈</span>;
  if (type.includes('text')) return <span style={{ fontSize: 36 }}>📃</span>;
  return <span style={{ fontSize: 36 }}>📁</span>;
}

const FileUploadPreview: React.FC<FileUploadPreviewProps> = ({ fileName, fileSize, fileType, fileUrl, uploadProgress, onSend, onCancel, onClose, uploading, visible }) => (
  <Fade in={visible} timeout={400}>
    <Box
      sx={{
        position: 'fixed',
        left: '50%',
        bottom: { xs: 16, md: 36 },
        transform: 'translateX(-50%)',
        bgcolor: '#18191b',
        borderRadius: 3,
        boxShadow: '0 4px 32px #000a',
        minWidth: 260,
        maxWidth: '92vw',
        width: 'fit-content',
        zIndex: 9999,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        px: { xs: 2, md: 3 },
        py: 1.2,
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(.4,2,.6,1)',
      }}
    >
      <IconButton onClick={onClose} sx={{ position: 'absolute', top: 6, right: 6, color: '#fff', zIndex: 2 }} size="small">
        <CloseIcon />
      </IconButton>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, bgcolor: '#23262b', borderRadius: 2, mr: { xs: 0, sm: 2 }, mb: { xs: 1, sm: 0 }, overflow: 'hidden' }}>
        {getFileIcon(fileType, fileUrl)}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden', px: 1 }}>
        <Typography sx={{ color: '#fff', fontSize: 16, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>
          {fileName}
        </Typography>
        <Typography sx={{ color: '#aaa', fontSize: 13, mt: 0.5 }}>
          {(fileSize / 1024 / 1024).toFixed(2)} MB
        </Typography>
        {uploading && (
          <Box sx={{ mt: 1 }}>
            <LinearProgress variant="determinate" value={uploadProgress} sx={{ height: 6, borderRadius: 2, bgcolor: '#23262b', '& .MuiLinearProgress-bar': { bgcolor: '#00bcd4' } }} />
            <Typography sx={{ color: '#00bcd4', fontSize: 12, mt: 0.5 }}>{uploadProgress.toFixed(0)}%</Typography>
          </Box>
        )}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, mt: { xs: 2, sm: 0 } }}>
        <Button color="primary" variant="contained" size="medium" onClick={onSend} disabled={uploading}>Send</Button>
        <Button color="secondary" variant="outlined" size="medium" onClick={onCancel} disabled={uploading}>Cancel</Button>
      </Box>
    </Box>
  </Fade>
);

export default FileUploadPreview;
