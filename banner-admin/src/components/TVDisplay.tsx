import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, IconButton, Paper } from '@mui/material';
import { Fullscreen, FullscreenExit, Refresh } from '@mui/icons-material';
import { getBanners, Banner } from '../services/bannerService';

const TVDisplay: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    fetchBanners();
    
    // Atualizar banners a cada 5 minutos
    const interval = setInterval(fetchBanners, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (banners.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
      }, 60000); // 60 segundos (1 minuto) por banner

      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getBanners({ status: 'active', include_scheduled: true });
      setBanners(data.banners || []);
      
      // Resetar índice se necessário
      if (currentIndex >= (data.banners || []).length) {
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error('Erro ao buscar banners:', err);
      setError('Erro ao carregar banners');
    } finally {
      setLoading(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const goToBanner = (index: number) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Typography variant="h4">Carregando banners...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Typography variant="h4" color="error" gutterBottom>
          Erro ao carregar banners
        </Typography>
        <Button variant="contained" onClick={fetchBanners}>
          Tentar Novamente
        </Button>
      </Box>
    );
  }

  if (banners.length === 0) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Typography variant="h4" gutterBottom>
          Nenhum banner disponível
        </Typography>
        <Typography variant="h6" color="rgba(255,255,255,0.8)">
          Crie um banner para vê-lo aqui
        </Typography>
      </Box>
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Header - oculto no fullscreen */}
      {!isFullscreen && (
        <Paper
          elevation={3}
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            🏋️ FitLoop - TV Display
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              color="inherit"
              onClick={fetchBanners}
              title="Atualizar banners"
            >
              <Refresh />
            </IconButton>
            <IconButton
              color="inherit"
              onClick={toggleFullscreen}
              title="Fullscreen"
            >
              <Fullscreen />
            </IconButton>
          </Box>
        </Paper>
      )}

      {/* Área principal do carrossel */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          p: 4,
        }}
      >
        {/* Banner atual */}
        <Box
          sx={{
            textAlign: 'center',
            maxWidth: '90%',
            maxHeight: '90%',
            animation: 'fadeIn 1s ease-in-out',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'scale(0.9)' },
              to: { opacity: 1, transform: 'scale(1)' },
            },
          }}
        >
          <img
            src={currentBanner.url_image}
            alt={currentBanner.title}
            style={{
              maxWidth: '100%',
              maxHeight: '70vh',
              objectFit: 'contain',
              borderRadius: '15px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
              marginBottom: '20px',
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          
          <Typography
            variant="h2"
            sx={{
              color: 'white',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
              marginBottom: '10px',
              fontWeight: 'bold',
              fontSize: { xs: '2rem', md: '3rem', lg: '4rem' },
            }}
          >
            {currentBanner.title}
          </Typography>
          
          {currentBanner.description && (
            <Typography
              variant="h5"
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)',
                maxWidth: '800px',
                margin: '0 auto',
                fontSize: { xs: '1.2rem', md: '1.5rem', lg: '2rem' },
              }}
            >
              {currentBanner.description}
            </Typography>
          )}
        </Box>

        {/* Indicadores */}
        {banners.length > 1 && (
          <Box
            sx={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 1,
            }}
          >
            {banners.map((_, index) => (
              <Box
                key={index}
                onClick={() => goToBanner(index)}
                sx={{
                  width: 15,
                  height: 15,
                  borderRadius: '50%',
                  backgroundColor: index === currentIndex ? 'white' : 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s',
                  '&:hover': {
                    backgroundColor: 'white',
                  },
                }}
              />
            ))}
          </Box>
        )}

        {/* Botão de sair do fullscreen */}
        {isFullscreen && (
          <IconButton
            onClick={toggleFullscreen}
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              },
            }}
            title="Sair do fullscreen"
          >
            <FullscreenExit />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

export default TVDisplay;
