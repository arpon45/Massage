import React, { useState } from 'react';
import { Box, Typography, Modal, IconButton, Snackbar, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';

interface FileMessageBubbleProps {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  isMine: boolean;
}

export const FileMessageBubble: React.FC<FileMessageBubbleProps> = ({ fileUrl, fileName, fileType, fileSize, isMine }) => {
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  const isImage = fileType.startsWith('image/');
  const isVideo = fileType.startsWith('video/');
  const [open, setOpen] = useState(false);
  const [videoModal, setVideoModal] = useState(false);

  const isText = fileType.startsWith('text/');

  if (isImage) {
    return (
      <>
        <Box
          sx={{
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            background: isMine ? '#23262b' : '#f3f4f8',
            borderRadius: 3,
            boxShadow: '0 2px 8px #0002',
            px: 2,
            py: 1.5,
            minWidth: 120,
            maxWidth: 220,
            color: isMine ? '#fff' : '#23262b',
          }}
          onClick={() => setOpen(true)}
        >
          <img src={fileUrl} alt={fileName} style={{ maxWidth: 200, maxHeight: 160, borderRadius: 8 }} />
        </Box>
        <Modal open={open} onClose={() => setOpen(false)}>
          <Box sx={{
            position: 'fixed',
            top: 0, left: 0, width: '100vw', height: '100vh',
            bgcolor: 'rgba(0,0,0,0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300
          }}>
            <img src={fileUrl} alt={fileName} style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 12, boxShadow: '0 6px 32px #0009' }} />
            <IconButton
              onClick={() => setOpen(false)}
              sx={{ position: 'fixed', top: 24, right: 36, color: '#fff', bgcolor: '#2228', '&:hover': { bgcolor: '#000c' }, zIndex: 1400 }}
            >
              <CloseIcon />
            </IconButton>
            <IconButton
              onClick={async () => {
                try {
                  const response = await fetch(fileUrl, { mode: 'cors' });
                  if (!response.ok) throw new Error('Download failed');
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = fileName;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  window.URL.revokeObjectURL(url);
                } catch (err) {
                  setSnackMsg('Download failed. Please check permissions or try again.');
                  setSnackOpen(true);
                }
              }}
              sx={{ position: 'fixed', top: 24, right: 90, color: '#fff', bgcolor: '#2228', '&:hover': { bgcolor: '#000c' }, zIndex: 1400 }}
            >
              <DownloadIcon />
            </IconButton>
          </Box>
        </Modal>
      <Snackbar open={snackOpen} autoHideDuration={4000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" variant="filled" onClose={() => setSnackOpen(false)}>{snackMsg}</Alert>
      </Snackbar>
      </>
    );
  }

  // VIDEO preview
  if (isVideo) {
    return (
      <>
        <Box
          sx={{
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            background: isMine ? '#23262b' : '#f3f4f8',
            borderRadius: 3,
            boxShadow: '0 2px 8px #0002',
            px: 2,
            py: 1.5,
            minWidth: 120,
            maxWidth: 220,
            color: isMine ? '#fff' : '#23262b',
            position: 'relative',
          }}
          onClick={() => setVideoModal(true)}
        >
          <Box sx={{ position: 'relative', width: 200, height: 120, borderRadius: 8, overflow: 'hidden', bgcolor: '#000' }}>
            <video src={fileUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.7)' }} muted preload="metadata" />
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2 }}>
              <svg width="48" height="48" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="24" fill="#000a" />
                <polygon points="19,16 34,24 19,32" fill="#fff" />
              </svg>
            </Box>
          </Box>
        </Box>
        <Modal open={videoModal} onClose={() => setVideoModal(false)}>
          <Box sx={{
            position: 'fixed',
            top: 0, left: 0, width: '100vw', height: '100vh',
            bgcolor: 'rgba(0,0,0,0.97)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300
          }}>
            <video src={fileUrl} controls autoPlay style={{ maxWidth: '94vw', maxHeight: '90vh', borderRadius: 12, background: '#000', boxShadow: '0 6px 32px #0009' }} />
            <IconButton
              onClick={() => setVideoModal(false)}
              sx={{ position: 'fixed', top: 24, right: 36, color: '#fff', bgcolor: '#2228', '&:hover': { bgcolor: '#000c' }, zIndex: 1400 }}
            >
              <CloseIcon />
            </IconButton>
            <IconButton
              onClick={async () => {
                try {
                  const response = await fetch(fileUrl, { mode: 'cors' });
                  if (!response.ok) throw new Error('Download failed');
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = fileName;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  window.URL.revokeObjectURL(url);
                } catch (err) {
                  setSnackMsg('Download failed. Please check permissions or try again.');
                  setSnackOpen(true);
                }
              }}
              sx={{ position: 'fixed', top: 24, right: 90, color: '#fff', bgcolor: '#2228', '&:hover': { bgcolor: '#000c' }, zIndex: 1400 }}
            >
              <DownloadIcon />
            </IconButton>
          </Box>
        </Modal>
      <Snackbar open={snackOpen} autoHideDuration={4000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" variant="filled" onClose={() => setSnackOpen(false)}>{snackMsg}</Alert>
      </Snackbar>
      </>
    );
  }
  // Not an image: show text file preview if text, otherwise just file info
  const [textPreview, setTextPreview] = useState<string | null>(null);
  React.useEffect(() => {
    if (isText) {
      fetch(fileUrl)
        .then(res => res.text())
        .then(text => {
          // Show only the first 8 lines or 600 chars
          const lines = text.split('\n').slice(0, 8).join('\n');
          setTextPreview(lines.length > 600 ? lines.slice(0, 600) + '\n...' : lines);
        })
        .catch(() => setTextPreview('Could not preview file.'));
    }
  }, [fileUrl, isText]);

  if (isText) {
    return (
      <Box sx={{
        background: isMine ? '#23262b' : '#f3f4f8',
        borderRadius: 3,
        boxShadow: '0 2px 8px #0002',
        px: 2,
        py: 1.5,
        minWidth: 180,
        maxWidth: 380,
        color: isMine ? '#23262b' : '#23262b',
        gap: 1.5,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Typography sx={{ fontWeight: 600, fontSize: 15, color: isMine ? '#fff' : '#23262b', wordBreak: 'break-all', mb: 0.5 }}>{fileName}</Typography>
        <Typography sx={{ fontSize: 12, color: isMine ? '#b0b3ba' : '#23262b', opacity: 0.7, mb: 1 }}>{fileType}</Typography>
        <Box sx={{
          bgcolor: isMine ? '#18191b' : '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          px: 1.5,
          py: 1,
          fontFamily: 'monospace',
          fontSize: 14,
          color: isMine ? '#e0e0e0' : '#23262b',
          maxHeight: 180,
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
          mb: 1.5
        }}>
          {textPreview === null ? 'Loading preview...' : textPreview}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', border: '2px solid red', p: 0.5 }}>
          <IconButton
            size="medium"
            sx={{ color: '#fff', bgcolor: '#bdbdbd', borderRadius: 2, '&:hover': { color: '#1976d2', bgcolor: '#e3e3e3' }, boxShadow: '0 2px 8px #0001' }}
            onClick={async (e) => {
              e.stopPropagation();
              try {
                const response = await fetch(fileUrl, { mode: 'cors' });
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
              } catch (err) {}
            }}
            title="Download"
            aria-label="Download file"
          >
            <DownloadIcon sx={{ fontSize: 24 }} />
          </IconButton>
        </Box>
        <Box sx={{ mt: 1 }}>
          <a href={fileUrl} download={fileName} style={{ color: 'red', fontWeight: 600 }}>Plain Download Link (Debug)</a>
        </Box>
      </Box>
    );
  }

  // Otherwise, show file info and download button
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        background: isMine ? '#23262b' : '#f3f4f8',
        borderRadius: 3,
        boxShadow: '0 2px 8px #0002',
        px: 2,
        py: 1.5,
        minWidth: 120,
        maxWidth: 320,
        color: isMine ? '#23262b' : '#23262b',
        gap: 1.5
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 600, fontSize: 15, color: isMine ? '#fff' : '#23262b', wordBreak: 'break-all' }}>{fileName}</Typography>
        <Typography sx={{ fontSize: 12, color: isMine ? '#b0b3ba' : '#23262b', opacity: 0.7 }}>{fileType}</Typography>
      </Box>
      <IconButton
        size="medium"
        sx={{ ml: 2, color: '#fff', bgcolor: '#bdbdbd', borderRadius: 2, '&:hover': { color: '#1976d2', bgcolor: '#e3e3e3' }, boxShadow: '0 2px 8px #0001' }}
        onClick={async (e) => {
          e.stopPropagation();
          try {
            const response = await fetch(fileUrl, { mode: 'cors' });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
          } catch (err) {}
        }}
        title="Download"
        aria-label="Download file"
      >
        <DownloadIcon sx={{ fontSize: 24 }} />
      </IconButton>
    </Box>
  );
};
