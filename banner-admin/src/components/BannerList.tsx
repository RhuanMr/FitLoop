import React, { useEffect, useState } from 'react';
import { Banner } from '../types/Banner';
import { getBanners, deleteBanner } from '../services/bannerService';
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

const BannerList: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchBanners = () => {
    setLoading(true);
    getBanners({ include_scheduled: true }) // Buscar todos os banners, incluindo agendados
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
      await deleteBanner(deleteId);
      setDeleteId(null);
      setConfirmOpen(false);
      fetchBanners();
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

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 5 }}>
      <Typography variant="h5" mb={2}>
        Lista de Banners
      </Typography>
      <List>
        {banners.map((banner) => (
          <ListItem key={banner.id} alignItems="flex-start"
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="delete"
                color="error"
                onClick={() => handleDeleteClick(banner.id!)}
              >
                <DeleteIcon />
              </IconButton>
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
                  <Typography variant="body2" component="span">
                    Ordem: {banner.exhibition_order} | Status: {banner.status}
                  </Typography>
                  {banner.description && (
                    <Typography variant="body2" color="text.secondary" display="block">
                      {banner.description}
                    </Typography>
                  )}
                  {banner.scheduled_start && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Início: {new Date(banner.scheduled_start).toLocaleString()}
                    </Typography>
                  )}
                  {banner.scheduled_end && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Fim: {new Date(banner.scheduled_end).toLocaleString()}
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