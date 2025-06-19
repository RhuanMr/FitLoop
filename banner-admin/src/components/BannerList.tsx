import React, { useEffect, useState } from 'react';
import { Banner } from '../types/Banner';
import { getBanners } from '../services/bannerService';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Box,
} from '@mui/material';

const BannerList: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBanners()
      .then((data) => setBanners(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 5 }}>
      <Typography variant="h5" mb={2}>
        Lista de Banners
      </Typography>
      <List>
        {banners.map((banner) => (
          <ListItem key={banner.id} alignItems="flex-start">
            <ListItemAvatar>
              <Avatar
                variant="rounded"
                src={banner.url_image}
                alt={banner.title}
                sx={{ width: 56, height: 56, mr: 2 }}
              />
            </ListItemAvatar>
            <ListItemText
              primary={banner.title}
              secondary={`Ordem: ${banner.exhibition_order}`}
            />
          </ListItem>
        ))}
      </List>
      {banners.length === 0 && (
        <Typography color="text.secondary" align="center">
          Nenhum banner cadastrado.
        </Typography>
      )}
    </Paper>
  );
};

export default BannerList;