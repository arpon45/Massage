import React, { useState } from 'react';
import { Box, IconButton, Button, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

interface FileItem {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
}

interface MultiFilePreviewModalProps {
  files: FileItem[];
  open: boolean;
  onClose: () => void;
  onRemove: (index: number) => void;
  onSendAll: () => void;
}

const MultiFilePreviewModal: React.FC<MultiFilePreviewModalProps> = ({ files, open, onClose, onRemove, onSendAll }) => {
  const [current, setCurrent] = useState(0);
  if (!open || files.length === 0) return null;

  const file = files[current];

  return (
    <Box sx={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', bgcolor: 'rgba(20,20,20,0.95)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Close */}
      <IconButton onClick={onClose} sx={{ position: 'absolute', top: 24, right: 32, color: '#fff', zIndex: 10 }}>
        <CloseIcon fontSize="large" />
      </IconButton>
      {/* Carousel arrows */}
      {files.length > 1 && (
        <IconButton onClick={() => setCurrent((current - 1 + files.length) % files.length)} sx={{ position: 'absolute', left: 40, top: '50%', color: '#fff', bgcolor: '#2228', '&:hover': { bgcolor: '#222' }, zIndex: 10 }}>
          <ArrowBackIosNewIcon fontSize="large" />
        </IconButton>
      )}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '96vw',
        maxHeight: '90vh',
        minWidth: 320,
        minHeight: 120,
        bgcolor: '#222',
        borderRadius: 4,
        boxShadow: '0 8px 32px #000c',
        position: 'relative',
        p: { xs: 1, sm: 3 },
        overflow: 'hidden',
      }}>
        {/* Remove single file */}
        <IconButton onClick={() => onRemove(current)} sx={{ position: 'absolute', top: 12, right: 12, color: '#fff', zIndex: 10 }} title="Remove this file">
          <CloseIcon />
        </IconButton>
        {/* Preview */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          minHeight: 120,
          mb: 2,
        }}>
          {file.fileType.startsWith('image/') ? (
            <img src={file.fileUrl} alt="preview" style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: 12, boxShadow: '0 2px 32px #000a', display: 'block', margin: '0 auto' }} />
          ) : file.fileType.startsWith('video/') ? (
            <video src={file.fileUrl} controls style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: 12, display: 'block', margin: '0 auto' }} />
          ) : (
            <Box sx={{ width: 320, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#222', borderRadius: 2, mb: 2 }}>
              <Typography sx={{ color: '#fff', fontSize: 24 }}>Unsupported file</Typography>
            </Box>
          )}
        </Box>
        <Button color="primary" variant="contained" fullWidth sx={{ mt: 1, fontWeight: 700, fontSize: 17 }} onClick={onSendAll} disabled={files.length === 0}>Send All ({files.length})</Button>
      </Box>
      {/* Next arrow */}
      {files.length > 1 && (
        <IconButton onClick={() => setCurrent((current + 1) % files.length)} sx={{ position: 'absolute', right: 40, top: '50%', color: '#fff', bgcolor: '#2228', '&:hover': { bgcolor: '#222' }, zIndex: 10 }}>
          <ArrowForwardIosIcon fontSize="large" />
        </IconButton>
      )}
    </Box>
  );
};

export default MultiFilePreviewModal;
