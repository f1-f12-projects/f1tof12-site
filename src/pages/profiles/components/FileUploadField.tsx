import React, { useState } from 'react';
import { Grid, Box, Typography, Button, Alert } from '@mui/material';
import { CloudUpload, Description } from '@mui/icons-material';

interface FileUploadFieldProps {
  xs: number;
  sm: number;
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}

const FileUploadField: React.FC<FileUploadFieldProps> = ({ xs, sm, file, onChange, error }) => {
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File) => {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    return validTypes.includes(file.type) && file.size <= maxSize;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    onChange(selectedFile && validateFile(selectedFile) ? selectedFile : null);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && validateFile(droppedFile)) {
      onChange(droppedFile);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <Grid item xs={xs} sm={sm}>
      <Box 
        sx={{
          p: 2,
          borderRadius: 3,
          backgroundColor: isDragging ? 'rgba(102, 126, 234, 0.1)' : 'rgba(255, 255, 255, 0.8)',
          border: '2px dashed',
          borderColor: error ? 'error.main' : isDragging ? 'primary.main' : 'divider',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: 'primary.main'
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          accept=".pdf,.doc,.docx"
          style={{ display: 'none' }}
          id="profile-upload"
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="profile-upload">
          <Button
            variant="outlined"
            component="span"
            startIcon={<CloudUpload />}
            fullWidth
            sx={{
              borderRadius: 2,
              py: 1.5,
              borderStyle: 'dashed',
              '&:hover': {
                borderStyle: 'solid'
              }
            }}
          >
            Upload Resume
          </Button>
        </label>
        
        {file && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Description color="primary" fontSize="small" />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {file.name}
            </Typography>
          </Box>
        )}
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {isDragging ? 'Drop file here' : 'Drag & drop or click to upload • PDF/Word • Max 5MB'}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mt: 1, py: 0 }}>
            {error}
          </Alert>
        )}
      </Box>
    </Grid>
  );
};

export default FileUploadField;