import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import { Add as AddIcon, Sports as SportsIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Site } from '../types/Site';
import { createSite, getSelectorsForUrl } from '../services/siteService';

const validationSchema = Yup.object({
  name: Yup.string().required('Nome é obrigatório'),
  url: Yup.string().url('URL inválida').required('URL é obrigatória'),
  interval_hours: Yup.number()
    .min(1, 'Mínimo 1 hora')
    .max(24, 'Máximo 24 horas')
    .required('Intervalo é obrigatório'),
});

const SimpleSiteForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      name: '',
      url: '',
      interval_hours: 6,
      is_active: true,
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(false);

        // Obter seletores automaticamente
        const { selectors } = await getSelectorsForUrl(values.url);

        const siteData: Omit<Site, 'id' | 'created_at'> = {
          name: values.name,
          url: values.url,
          interval_hours: values.interval_hours,
          selector_title: selectors.title,
          selector_image: selectors.image,
          selector_link: selectors.link,
          is_active: values.is_active
        };

        await createSite(siteData);
        
        setSuccess(true);
        resetForm();
        
        // Limpar mensagem de sucesso após 3 segundos
        setTimeout(() => setSuccess(false), 3000);
        
      } catch (error) {
        console.error('Erro ao criar site:', error);
        setError('Erro ao criar site. Verifique a URL e tente novamente.');
      } finally {
        setLoading(false);
      }
    },
  });

  const predefinedSites = [
    {
      name: 'ESPN Brasil',
      url: 'https://www.espn.com.br/',
      interval_hours: 4,
      icon: <SportsIcon />
    },
    {
      name: 'G1 Notícias',
      url: 'https://g1.globo.com/',
      interval_hours: 6,
      icon: <SportsIcon />
    },
    {
      name: 'UOL Esporte',
      url: 'https://www.uol.com.br/esporte/',
      interval_hours: 8,
      icon: <SportsIcon />
    }
  ];

  const handlePredefinedSite = (site: typeof predefinedSites[0]) => {
    formik.setValues({
      name: site.name,
      url: site.url,
      interval_hours: site.interval_hours,
      is_active: true,
    });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        🌐 Adicionar Site para Monitoramento
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Adicione sites de notícias para monitorar automaticamente e gerar posts sugeridos.
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          ✅ Site adicionado com sucesso! O sistema começará a monitorar automaticamente.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          ❌ {error}
        </Alert>
      )}

      {/* Sites Pré-definidos */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          🚀 Sites Populares (Clique para adicionar)
        </Typography>
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: 2 
          }}
        >
          {predefinedSites.map((site, index) => (
            <Card 
              key={index}
              sx={{ 
                cursor: 'pointer',
                '&:hover': { 
                  backgroundColor: 'primary.light',
                  color: 'white',
                  '& .MuiTypography-root': { color: 'white' }
                },
                transition: 'all 0.3s'
              }}
              onClick={() => handlePredefinedSite(site)}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                {site.icon}
                <Typography variant="h6" gutterBottom>
                  {site.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  A cada {site.interval_hours}h
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Paper>

      {/* Formulário Manual */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          ✏️ Adicionar Site Personalizado
        </Typography>
        
        <form onSubmit={formik.handleSubmit}>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Nome do Site"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              fullWidth
              placeholder="Ex: ESPN Brasil"
            />
            
            <TextField
              label="URL do Site"
              name="url"
              value={formik.values.url}
              onChange={formik.handleChange}
              error={formik.touched.url && Boolean(formik.errors.url)}
              helperText={formik.touched.url && formik.errors.url}
              fullWidth
              placeholder="Ex: https://www.espn.com.br/"
            />
            
            <TextField
              label="Intervalo de Verificação (horas)"
              name="interval_hours"
              type="number"
              value={formik.values.interval_hours}
              onChange={formik.handleChange}
              error={formik.touched.interval_hours && Boolean(formik.errors.interval_hours)}
              helperText={formik.touched.interval_hours && formik.errors.interval_hours}
              inputProps={{ min: 1, max: 24 }}
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
              label="Ativar monitoramento automaticamente"
            />
            
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
              disabled={loading}
              fullWidth
              size="large"
            >
              {loading ? 'Adicionando...' : 'Adicionar Site'}
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Informações */}
      <Paper sx={{ p: 2, mt: 2, backgroundColor: 'info.light' }}>
        <Typography variant="body2" color="info.contrastText">
          💡 <strong>Dica:</strong> O sistema detecta automaticamente os seletores CSS do site. 
          Você pode usar sites populares clicando nos cards acima ou adicionar sites personalizados.
        </Typography>
      </Paper>
    </Box>
  );
};

export default SimpleSiteForm;
