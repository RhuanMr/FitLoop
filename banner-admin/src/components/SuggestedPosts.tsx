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
} from '@mui/material';
import {
  Check as ApproveIcon,
  Close as RejectIcon,
  Delete as DeleteIcon,
  Add as ConvertIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { SuggestedPost } from '../types/Site';
import { 
  getSuggestedPosts, 
  approvePost, 
  rejectPost, 
  convertToBanner, 
  deleteSuggestedPost 
} from '../services/siteService';

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
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
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
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: 2 
          }}
        >
          {posts.map((post) => (
            <Card key={post.id}>
              <CardMedia
                component="img"
                height="200"
                image={post.image_url}
                alt={post.title}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {post.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Fonte: {post.source_site}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(post.created_at)}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                  <Chip
                    label={post.is_approved ? 'Aprovado' : 'Pendente'}
                    color={post.is_approved ? 'success' : 'warning'}
                    size="small"
                  />
                  <Box>
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
          ))}
        </Box>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Imagem</TableCell>
                  <TableCell>Título</TableCell>
                  <TableCell>Fonte</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
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
                    <TableCell>
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
                        </>
                      )}
                      <Tooltip title="Rejeitar">
                        <IconButton size="small" onClick={() => handleReject(post.id!)}>
                          <RejectIcon color="error" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton size="small" onClick={() => handleDelete(post.id!)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>
      )}

      <Dialog open={convertDialogOpen} onClose={() => setConvertDialogOpen(false)}>
        <DialogTitle>Converter para Banner</DialogTitle>
        <DialogContent>
          {selectedPost && (
            <Box>
              <Typography variant="body1" gutterBottom>
                <strong>Título:</strong> {selectedPost.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Fonte:</strong> {selectedPost.source_site}
              </Typography>
              <TextField
                label="Ordem de Exibição"
                type="number"
                value={exhibitionOrder}
                onChange={(e) => setExhibitionOrder(Number(e.target.value))}
                inputProps={{ min: 1 }}
                fullWidth
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConvertDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleConvertToBanner} variant="contained">
            Converter
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SuggestedPosts;
