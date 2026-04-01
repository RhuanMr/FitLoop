import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Container, Card, CardContent } from '@mui/material';
import { getBanners, Banner } from '../services/bannerService';
import { formatDate } from '../utils/formatting';

const BannerCarousel: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchBanners();
    
    const interval = setInterval(fetchBanners, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getBanners({ status: 'active', include_scheduled: false });
      setBanners(data.banners || []);
      
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
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [banners.length]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
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
      <Card elevation={0} variant="outlined">
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Nenhum banner ativo encontrado
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Crie um banner para vê-lo aqui
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
        Preview dos Banners Online
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Visualização dos banners como aparecem no app FitLoop
      </Typography>

      <Card elevation={2} sx={{ mb: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '400px',
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
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          
          <Box sx={{ p: 2, textAlign: 'center', width: '100%', backgroundColor: '#fff' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
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
        <Box display="flex" justifyContent="center" gap={1} p={2}>
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
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Banner {currentIndex + 1} de {banners.length} | Ordem de exibição: {currentBanner.exhibition_order}
          </Typography>
          {currentBanner.scheduled_start && (
            <Typography variant="body2" color="text.secondary">
              Início: {formatDate(currentBanner.scheduled_start)}
            </Typography>
          )}
          {currentBanner.scheduled_end && (
            <Typography variant="body2" color="text.secondary">
              Fim: {formatDate(currentBanner.scheduled_end)}
            </Typography>
          )}
        </Box>
      </Card>

      {/* Lista de todos os banners */}
      <Card elevation={1} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Todos os Banners Ativos ({banners.length})
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={2}>
          {banners.map((banner, index) => (
            <Paper
              key={banner.id}
              elevation={0}
              variant="outlined"
              sx={{
                p: 1.5,
                minWidth: '150px',
                cursor: 'pointer',
                border: index === currentIndex ? 3 : 1,
                borderColor: index === currentIndex ? 'primary.main' : 'grey.300',
                transition: 'all 0.3s',
                '&:hover': { borderColor: 'primary.main' }
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
                  marginBottom: '8px'
                }}
              />
              <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
                {banner.title}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Card>
    </Container>
  );
};

export default BannerCarousel;
