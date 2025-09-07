import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { getBanners, Banner } from '../services/bannerService';

const BannerCarousel: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchBanners();
    
    // Atualizar banners a cada 30 segundos
    const interval = setInterval(fetchBanners, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getBanners({ status: 'active', include_scheduled: false });
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

  useEffect(() => {
    if (banners.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
      }, 5000); // Trocar banner a cada 5 segundos

      return () => clearInterval(interval);
    }
  }, [banners.length]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Carregando banners...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (banners.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Nenhum banner ativo encontrado
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Crie um banner para vê-lo aqui
        </Typography>
      </Paper>
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Preview dos Banners Online
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Esta é a visualização dos banners como aparecem no app FitLoop
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '400px',
            borderRadius: 2,
            overflow: 'hidden',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={currentBanner.url_image}
            alt={currentBanner.title}
            style={{
              width: '100%',
              height: '70%',
              objectFit: 'cover',
              borderRadius: '8px',
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          
          <Box sx={{ p: 2, textAlign: 'center', width: '100%' }}>
            <Typography variant="h6" gutterBottom>
              {currentBanner.title}
            </Typography>
            {currentBanner.description && (
              <Typography variant="body2" color="text.secondary">
                {currentBanner.description}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Indicadores */}
        <Box display="flex" justifyContent="center" gap={1} mt={2}>
          {banners.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: index === currentIndex ? 'primary.main' : 'grey.300',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
              }}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </Box>

        {/* Informações do banner atual */}
        <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
          <Typography variant="body2" color="text.secondary">
            Banner {currentIndex + 1} de {banners.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ordem de exibição: {currentBanner.exhibition_order}
          </Typography>
          {currentBanner.scheduled_start && (
            <Typography variant="body2" color="text.secondary">
              Início: {new Date(currentBanner.scheduled_start).toLocaleString()}
            </Typography>
          )}
          {currentBanner.scheduled_end && (
            <Typography variant="body2" color="text.secondary">
              Fim: {new Date(currentBanner.scheduled_end).toLocaleString()}
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Lista de todos os banners */}
      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Todos os Banners Ativos ({banners.length})
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={2}>
          {banners.map((banner, index) => (
            <Paper
              key={banner.id}
              elevation={1}
              sx={{
                p: 2,
                minWidth: '200px',
                cursor: 'pointer',
                border: index === currentIndex ? 2 : 1,
                borderColor: index === currentIndex ? 'primary.main' : 'grey.300',
                transition: 'border-color 0.3s',
              }}
              onClick={() => setCurrentIndex(index)}
            >
              <img
                src={banner.url_image}
                alt={banner.title}
                style={{
                  width: '100%',
                  height: '100px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                {banner.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Ordem: {banner.exhibition_order}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default BannerCarousel;
