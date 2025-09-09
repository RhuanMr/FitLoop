import React, { useEffect, useState } from 'react';
import { Banner } from '../types/Banner';
import { getBanners, deleteBanner, reactivateBanner } from '../services/bannerService';
import axios from 'axios';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';

const BannerList: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showExpired, setShowExpired] = useState(false);

  const fetchBanners = () => {
    setLoading(true);
    getBanners({ 
      include_scheduled: true,
      include_expired: showExpired 
    })
      .then((data) => setBanners(data.banners ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId !== null) {
      try {
        await deleteBanner(deleteId);
        setDeleteId(null);
        setConfirmOpen(false);
        fetchBanners();
      } catch (error: unknown) {
        console.error('Erro ao deletar banner:', error);
        // Se for um erro 404, podemos atualizar a lista mesmo assim
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setDeleteId(null);
          setConfirmOpen(false);
          fetchBanners();
        }
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteId(null);
    setConfirmOpen(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  const handleReactivate = async (id: number) => {
    try {
      await reactivateBanner(id);
      fetchBanners();
    } catch (error) {
      console.error('Erro ao reativar banner:', error);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          Lista de Banners
        </Typography>
        <Button
          variant={showExpired ? "contained" : "outlined"}
          onClick={() => {
            setShowExpired(!showExpired);
            fetchBanners();
          }}
        >
          {showExpired ? "Ocultar Expirados" : "Mostrar Expirados"}
        </Button>
      </Box>
      <List>
        {banners.map((banner) => (
          <ListItem key={banner.id} alignItems="flex-start"
            secondaryAction={
              <Box>
                {banner.status === 'expired' && (
                  <IconButton
                    edge="end"
                    aria-label="reactivate"
                    color="primary"
                    onClick={() => handleReactivate(banner.id!)}
                    sx={{ mr: 1 }}
                  >
                    <RefreshIcon />
                  </IconButton>
                )}
                <IconButton
                  edge="end"
                  aria-label="delete"
                  color="error"
                  onClick={() => handleDeleteClick(banner.id!)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
          >
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
              secondary={
                <Box>
                  <Typography component="span" variant="body2" color="text.primary">
                    Ordem: {banner.exhibition_order} | Status: {banner.status}
                  </Typography>
                  {banner.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'block' }}>
                      {banner.description}
                    </Typography>
                  )}
                  {banner.scheduled_start && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Início: {new Date(banner.scheduled_start).toLocaleString()}
                    </Typography>
                  )}
                  {banner.scheduled_end && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Fim: {new Date(banner.scheduled_end).toLocaleString()}
                    </Typography>
                  )}
                  {banner.from_suggested_post && (
                    <Typography component="span" variant="body2" color="info.main" sx={{ display: 'block' }}>
                      Post sugerido
                    </Typography>
                  )}
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
      {banners.length === 0 && (
        <Typography color="text.secondary" align="center">
          Nenhum banner cadastrado.
        </Typography>
      )}

      <Dialog open={confirmOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir este banner? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default BannerList;