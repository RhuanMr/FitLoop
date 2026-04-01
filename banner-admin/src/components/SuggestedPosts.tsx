import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
  Tooltip,
  TextField,
  Pagination,
  Card,
  CardMedia,
  CardContent,
  Container,
  Grid,
} from '@mui/material';
import {
  Check as ApproveIcon,
  Close as RejectIcon,
  Delete as DeleteIcon,
  Add as ConvertIcon,
} from '@mui/icons-material';
import { SuggestedPost } from '../types/Site';
import { 
  getSuggestedPosts, 
  approvePost, 
  rejectPost, 
  convertToBanner, 
  deleteSuggestedPost 
} from '../services/siteService';
import { formatDate } from '../utils/formatting';

const SuggestedPosts: React.FC = () => {
  const [posts, setPosts] = useState<SuggestedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<SuggestedPost | null>(null);
  const [exhibitionOrder, setExhibitionOrder] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    fetchPosts();
  }, [page, filter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 12 };
      
      if (filter === 'approved') {
        params.is_approved = true;
      } else if (filter === 'pending') {
        params.is_approved = false;
      }

      const data = await getSuggestedPosts(params);
      setPosts(data.posts);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (error) {
      console.error('Erro ao buscar posts sugeridos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await approvePost(id);
      await fetchPosts();
    } catch (error) {
      console.error('Erro ao aprovar post:', error);
    }
  };

  const handleReject = async (id: number) => {
    if (window.confirm('Tem certeza que deseja rejeitar este post?')) {
      try {
        await rejectPost(id);
        await fetchPosts();
      } catch (error) {
        console.error('Erro ao rejeitar post:', error);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este post?')) {
      try {
        await deleteSuggestedPost(id);
        await fetchPosts();
      } catch (error) {
        console.error('Erro ao excluir post:', error);
      }
    }
  };

  const handleConvertToBanner = async () => {
    if (!selectedPost) return;
    
    try {
      await convertToBanner(selectedPost.id!, exhibitionOrder, 'active');
      setConvertDialogOpen(false);
      setSelectedPost(null);
      await fetchPosts();
    } catch (error) {
      console.error('Erro ao converter para banner:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Posts Sugeridos ({total})
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant={viewMode === 'grid' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('grid')}
            size="small"
          >
            Grade
          </Button>
          <Button
            variant={viewMode === 'table' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('table')}
            size="small"
          >
            Tabela
          </Button>
        </Box>
      </Box>

      <Box display="flex" gap={1} mb={3}>
        <Chip
          label="Todos"
          color={filter === 'all' ? 'primary' : 'default'}
          onClick={() => setFilter('all')}
        />
        <Chip
          label="Pendentes"
          color={filter === 'pending' ? 'primary' : 'default'}
          onClick={() => setFilter('pending')}
        />
        <Chip
          label="Aprovados"
          color={filter === 'approved' ? 'primary' : 'default'}
          onClick={() => setFilter('approved')}
        />
      </Box>

      {viewMode === 'grid' ? (
        <Grid 
          container 
          spacing={2}
          sx={{ mb: 3 }}
        >
          {posts.map((post) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={post.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={post.image_url}
                  alt={post.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    fontSize: '1rem',
                    fontWeight: 600,
                  }}>
                    {post.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {post.source_site}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    {formatDate(post.created_at)}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={0.5}>
                    <Chip
                      label={post.is_approved ? 'Aprovado' : 'Pendente'}
                      color={post.is_approved ? 'success' : 'warning'}
                      size="small"
                    />
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {!post.is_approved && (
                        <>
                          <Tooltip title="Converter para Banner">
                            <IconButton 
                              size="small" 
                              onClick={() => {
                                setSelectedPost(post);
                                setConvertDialogOpen(true);
                              }}
                            >
                              <ConvertIcon color="primary" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir">
                            <IconButton size="small" onClick={() => handleDelete(post.id!)}>
                              <DeleteIcon color="error" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper elevation={2} sx={{ mb: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Imagem</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Título</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Fonte</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Data</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                    <TableCell>
                      <img
                        src={post.image_url}
                        alt={post.title}
                        style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {post.title}
                      </Typography>
                    </TableCell>
                    <TableCell>{post.source_site}</TableCell>
                    <TableCell>
                      <Chip
                        label={post.is_approved ? 'Aprovado' : 'Pendente'}
                        color={post.is_approved ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(post.created_at)}</TableCell>
                    <TableCell align="right">
                      {!post.is_approved && (
                        <>
                          <Tooltip title="Aprovar">
                            <IconButton size="small" onClick={() => handleApprove(post.id!)}>
                              <ApproveIcon color="success" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Converter para Banner">
                            <IconButton 
                              size="small" 
                              onClick={() => {
                                setSelectedPost(post);
                                setConvertDialogOpen(true);
                              }}
                            >
                              <ConvertIcon color="primary" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Rejeitar">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleReject(post.id!)}
                            >
                              <RejectIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Dialog open={convertDialogOpen} onClose={() => setConvertDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Converter para Banner</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedPost && (
            <Box display="flex" flexDirection="column" gap={2}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  <strong>Título:</strong>
                </Typography>
                <Typography variant="body2">{selectedPost.title}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  <strong>Fonte:</strong>
                </Typography>
                <Typography variant="body2">{selectedPost.source_site}</Typography>
              </Box>
              <TextField
                label="Ordem de Exibição"
                type="number"
                value={exhibitionOrder}
                onChange={(e) => setExhibitionOrder(Number(e.target.value))}
                inputProps={{ min: 1 }}
                fullWidth
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConvertDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleConvertToBanner} variant="contained" color="primary">
            Converter
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SuggestedPosts;
