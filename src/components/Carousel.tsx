import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, IconButton } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';

const Carousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    { title: 'Innovation at Scale', description: 'Leading technology solutions for modern businesses' },
    { title: 'Expert Team', description: 'Skilled professionals delivering exceptional results' },
    { title: 'Global Reach', description: 'Serving clients worldwide with excellence' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <Box sx={{ position: 'relative', height: 400, overflow: 'hidden' }}>
      <Paper
        sx={{
          height: '100%',
          background: `linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          position: 'relative'
        }}
      >
        <Box sx={{ textAlign: 'center', px: 4 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            {slides[currentSlide].title}
          </Typography>
          <Typography variant="h6">
            {slides[currentSlide].description}
          </Typography>
        </Box>
        
        <IconButton
          onClick={prevSlide}
          sx={{ position: 'absolute', left: 16, color: 'white' }}
        >
          <ArrowBackIos />
        </IconButton>
        
        <IconButton
          onClick={nextSlide}
          sx={{ position: 'absolute', right: 16, color: 'white' }}
        >
          <ArrowForwardIos />
        </IconButton>
        
        <Box sx={{ position: 'absolute', bottom: 16, display: 'flex', gap: 1 }}>
          {slides.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: currentSlide === index ? 'white' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer'
              }}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default Carousel;