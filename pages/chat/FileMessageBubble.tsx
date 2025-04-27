import React from 'react';
import { Box, Typography, Link, IconButton } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

interface FileMessageBubbleProps {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  isMine: boolean;
}

export const FileMessageBubble: React.FC<FileMessageBubbleProps> = ({ fileUrl, fileName, fileType, fileSize, isMine }) => {
  const isImage = fileType.startsWith('image/');
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      background: isMine ? '#23262b' : '#f3f4f8',
      borderRadius: 3,
      boxShadow: '0 2px 8px #0002',
      px: 2,
      py: 1.5,
      minWidth: 180,
      maxWidth: 340,
      color: isMine ? '#fff' : '#23262b',
    }}>
      {isImage ? (
        <img src={fileUrl} alt={fileName} style={{ maxWidth: 220, maxHeight: 180, borderRadius: 8, marginBottom: 8 }} />
      ) : null}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <Typography sx={{ fontWeight: 600, fontSize: 15, mr: 1, color: isMine ? '#fff' : '#23262b', wordBreak: 'break-all' }}>
          {fileName}
        </Typography>
        <Typography sx={{ fontSize: 13, color: isMine ? '#bbb' : '#444', ml: 1 }}>
          {fileSize ? `(${(fileSize/1024).toFixed(1)} KB)` : ''}
        </Typography>
        <IconButton component={Link} href={fileUrl} target="_blank" rel="noopener noreferrer" download={fileName} sx={{ ml: 'auto', color: isMine ? '#fff' : '#23262b' }}>
          <DownloadIcon />
        </IconButton>
      </Box>
      {!isImage && (
        <Typography sx={{ fontSize: 12, color: isMine ? '#bbb' : '#444', mt: 0.5 }}>{fileType}</Typography>
      )}
    </Box>
  );
};
