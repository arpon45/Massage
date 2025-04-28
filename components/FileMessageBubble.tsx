import React, { useState } from 'react';
import { Box, Typography, Modal, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';

interface FileMessageBubbleProps {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  isMine: boolean;
}

export const FileMessageBubble: React.FC<FileMessageBubbleProps> = ({ fileUrl, fileName, fileType, isMine }) => {
  const isImage = fileType.startsWith('image/');
  const [open, setOpen] = useState(false);

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
              sx={{ position: 'fixed', top: 24, right: 90, color: '#fff', bgcolor: '#2228', '&:hover': { bgcolor: '#000c' }, zIndex: 1400 }}
            >
              <DownloadIcon />
            </IconButton>
          </Box>
        </Modal>
      </>
    );
  }
  // Not an image: show file info
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
        color: isMine ? '#fff' : '#23262b',
        cursor: 'pointer',
      }}
      onClick={async () => {
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
    >
      <DownloadIcon sx={{ mr: 1, fontSize: 26 }} />
      <Box>
        <Typography sx={{ fontWeight: 600, fontSize: 15, color: isMine ? '#fff' : '#23262b' }}>{fileName}</Typography>
        <Typography sx={{ fontSize: 12, color: isMine ? '#b0b3ba' : '#23262b', opacity: 0.7 }}>{fileType}</Typography>
      </Box>
    </Box>
  );
};
