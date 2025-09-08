import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Switch,
  FormControlLabel,
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as TestIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Site } from '../types/Site';
import { getSites, createSite, updateSite, deleteSite, testSite, getSelectorsForUrl } from '../services/siteService';

const validationSchema = Yup.object({
  name: Yup.string().required('Nome é obrigatório'),
  url: Yup.string().url('URL inválida').required('URL é obrigatória'),
  interval_hours: Yup.number()
    .min(0.5, 'Mínimo 0.5 horas')
    .max(168, 'Máximo 168 horas (7 dias)')
    .required('Intervalo é obrigatório'),
  selector_title: Yup.string().required('Seletor de título é obrigatório'),
  selector_image: Yup.string().required('Seletor de imagem é obrigatório'),
});

const SiteManagement: React.FC = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [testingSite, setTestingSite] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; posts: any[]; error?: string } | null>(null);

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const data = await getSites();
      setSites(data);
    } catch (error) {
      console.error('Erro ao buscar sites:', error);
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      url: '',
      interval_hours: 6,
      selector_title: '',
      selector_image: '',
      selector_link: '',
      is_active: true,
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (editingSite) {
          await updateSite(editingSite.id!, values);
        } else {
          await createSite(values);
        }
        await fetchSites();
        setDialogOpen(false);
        setEditingSite(null);
        resetForm();
      } catch (error) {
        console.error('Erro ao salvar site:', error);
      }
    },
  });

  const handleEdit = (site: Site) => {
    setEditingSite(site);
    formik.setValues({
      name: site.name,
      url: site.url,
      interval_hours: site.interval_hours,
      selector_title: site.selector_title,
      selector_image: site.selector_image,
      selector_link: site.selector_link || '',
      is_active: site.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este site?')) {
      try {
        await deleteSite(id);
        await fetchSites();
      } catch (error) {
        console.error('Erro ao excluir site:', error);
      }
    }
  };

  const handleTest = async (site: Site) => {
    try {
      setTestingSite(site.id!);
      setTestResult(null);
      const result = await testSite(site.id!);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        posts: [],
        error: 'Erro ao testar site'
      });
    } finally {
      setTestingSite(null);
    }
  };

  const handleUrlChange = async (url: string) => {
    if (url && url.startsWith('http')) {
      try {
        const { selectors } = await getSelectorsForUrl(url);
        formik.setFieldValue('selector_title', selectors.title);
        formik.setFieldValue('selector_image', selectors.image);
        if (selectors.link) {
          formik.setFieldValue('selector_link', selectors.link);
        }
      } catch (error) {
        console.error('Erro ao obter seletores:', error);
      }
    }
  };

  const formatLastCrawled = (dateString?: string) => {
    if (!dateString) return 'Nunca';
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
        <Typography variant="h5">Gerenciamento de Sites</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingSite(null);
            formik.resetForm();
            setDialogOpen(true);
          }}
        >
          Adicionar Site
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>URL</TableCell>
                <TableCell>Intervalo</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Último Crawl</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sites.map((site) => (
                <TableRow key={site.id}>
                  <TableCell>{site.name}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="primary" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {site.url}
                    </Typography>
                  </TableCell>
                  <TableCell>{site.interval_hours}h</TableCell>
                  <TableCell>
                    <Chip
                      label={site.is_active ? 'Ativo' : 'Inativo'}
                      color={site.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatLastCrawled(site.last_crawled)}</TableCell>
                  <TableCell>
                    <Tooltip title="Testar Site">
                      <IconButton
                        size="small"
                        onClick={() => handleTest(site)}
                        disabled={testingSite === site.id}
                      >
                        {testingSite === site.id ? <CircularProgress size={20} /> : <TestIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => handleEdit(site)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton size="small" onClick={() => handleDelete(site.id!)}>
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

      {testResult && (
        <Alert 
          severity={testResult.success ? 'success' : 'error'} 
          sx={{ mt: 2 }}
          onClose={() => setTestResult(null)}
        >
          {testResult.success 
            ? `Teste bem-sucedido! Encontrados ${testResult.posts.length} posts.`
            : `Erro no teste: ${testResult.error}`
          }
        </Alert>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingSite ? 'Editar Site' : 'Adicionar Site'}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} pt={1}>
              <TextField
                label="Nome do Site"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                fullWidth
              />
              
              <TextField
                label="URL"
                name="url"
                value={formik.values.url}
                onChange={(e) => {
                  formik.handleChange(e);
                  handleUrlChange(e.target.value);
                }}
                error={formik.touched.url && Boolean(formik.errors.url)}
                helperText={formik.touched.url && formik.errors.url}
                fullWidth
              />
              
              <TextField
                label="Intervalo (horas)"
                name="interval_hours"
                type="number"
                value={formik.values.interval_hours}
                onChange={formik.handleChange}
                error={formik.touched.interval_hours && Boolean(formik.errors.interval_hours)}
                helperText={formik.touched.interval_hours && formik.errors.interval_hours}
                inputProps={{ min: 0.5, max: 168, step: 0.5 }}
                fullWidth
              />
              
              <TextField
                label="Seletor de Título (CSS)"
                name="selector_title"
                value={formik.values.selector_title}
                onChange={formik.handleChange}
                error={formik.touched.selector_title && Boolean(formik.errors.selector_title)}
                helperText={formik.touched.selector_title && formik.errors.selector_title}
                fullWidth
              />
              
              <TextField
                label="Seletor de Imagem (CSS)"
                name="selector_image"
                value={formik.values.selector_image}
                onChange={formik.handleChange}
                error={formik.touched.selector_image && Boolean(formik.errors.selector_image)}
                helperText={formik.touched.selector_image && formik.errors.selector_image}
                fullWidth
              />
              
              <TextField
                label="Seletor de Link (CSS) - Opcional"
                name="selector_link"
                value={formik.values.selector_link}
                onChange={formik.handleChange}
                helperText="Seletor para o link do artigo (opcional)"
                fullWidth
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.is_active}
                    onChange={formik.handleChange}
                    name="is_active"
                  />
                }
                label="Site Ativo"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">
              {editingSite ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default SiteManagement;
