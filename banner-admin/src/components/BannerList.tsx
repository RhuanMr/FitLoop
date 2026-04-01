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
  Chip,
  Container,
  Card,
} from '@mui/material';
import { Delete as DeleteIcon, Refresh as RefreshIcon, Restore as RestoreIcon } from '@mui/icons-material';
import { formatDate } from '../utils/formatting';

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

  const statusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'archived': return 'error';
      case 'expired': return 'warning';
      default: return 'default';
    }
  };

  const statusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      'active': 'Ativo',
      'inactive': 'Inativo',
      'archived': 'Arquivado',
      'expired': 'Expirado'
    };
    return labels[status] || status;
  };

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Card elevation={2}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Lista de Banners
            </Typography>
            <Button
              variant={showExpired ? "contained" : "outlined"}
              onClick={() => {
                setShowExpired(!showExpired);
                fetchBanners();
              }}
              size="small"
            >
              {showExpired ? "Ocultar Expirados" : "Mostrar Expirados"}
            </Button>
          </Box>

          {banners.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              Nenhum banner cadastrado.
            </Typography>
          ) : (
            <List sx={{ width: '100%' }}>
              {banners.map((banner) => (
                <ListItem 
                  key={banner.id} 
                  alignItems="flex-start"
                  sx={{
                    mb: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                  secondaryAction={
                    <Box>
                      {banner.status === 'expired' && (
                        <IconButton
                          edge="end"
                          aria-label="reactivate"
                          color="primary"
                          onClick={() => handleReactivate(banner.id!)}
                          sx={{ mr: 1 }}
                          title="Reativar"
                        >
                          <RestoreIcon />
                        </IconButton>
                      )}
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        color="error"
                        onClick={() => handleDeleteClick(banner.id!)}
                        title="Excluir"
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
                      sx={{ width: 80, height: 80, mr: 2 }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {banner.title}
                        </Typography>
                        <Chip 
                          label={statusLabel(banner.status)}
                          color={statusColor(banner.status)}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography component="span" variant="body2" color="text.primary">
                          Ordem: {banner.exhibition_order}
                        </Typography>
                        {banner.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {banner.description}
                          </Typography>
                        )}
                        {banner.scheduled_start && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            Início: {formatDate(banner.scheduled_start)}
                          </Typography>
                        )}
                        {banner.scheduled_end && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Fim: {formatDate(banner.scheduled_end)}
                          </Typography>
                        )}
                        {banner.from_suggested_post && (
                          <Chip 
                            label="Post Sugerido" 
                            variant="outlined"
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Card>

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
    </Container>
  );
};

export default BannerList;