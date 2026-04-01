import React, { useRef } from 'react';
import { Box, Button, TextField, Typography, Paper, MenuItem, Container, Card, CardContent, Alert } from '@mui/material';
import { CloudUpload, Save } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { createBanner } from '../services/bannerService';
import { BannerStatus } from '../types/Banner';


const validationSchema = Yup.object({
  title: Yup.string().required('Título obrigatório'),
  exhibition_order: Yup.number()
    .typeError('Informe um número')
    .integer('Deve ser um número inteiro')
    .min(1, 'Mínimo 1')
    .required('Ordem obrigatória'),
  description: Yup.string(),
  status: Yup.string().oneOf(['active', 'inactive', 'archived']).required('Status obrigatório'),
  imagem: Yup.mixed().required('Imagem obrigatória'),
  scheduled_start: Yup.string().nullable(),
  scheduled_end: Yup.string().nullable().test(
    'is-after-start',
    'Data de fim deve ser posterior à data de início',
    function(value) {
      const { scheduled_start } = this.parent;
      if (!value || !scheduled_start) return true;
      return new Date(value) > new Date(scheduled_start);
    }
  ),
});

const BannerForm: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formik = useFormik({
    initialValues: {
      title: '',
      exhibition_order: 1,
      description: '',
      status: 'active' as BannerStatus,
      imagem: null as File | null,
      scheduled_start: '',
      scheduled_end: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        console.log('=== SUBMIT FORM DEBUG ===');
        console.log('Values:', values);
        console.log('Imagem:', values.imagem);
        
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('exhibition_order', String(values.exhibition_order));
        formData.append('description', values.description);
        formData.append('status', values.status);
        if (values.scheduled_start) {
          formData.append('scheduled_start', values.scheduled_start);
        }
        if (values.scheduled_end) {
          formData.append('scheduled_end', values.scheduled_end);
        }
        if (values.imagem) {
          formData.append('imagem', values.imagem);
          console.log('Imagem adicionada ao FormData:', values.imagem.name);
        } else {
          console.log('ERRO: Nenhuma imagem selecionada!');
          alert('Por favor, selecione uma imagem');
          return;
        }

        console.log('Enviando FormData...');
        const result = await createBanner(formData);
        console.log('Resultado:', result);
        
        resetForm();
        if (fileInputRef.current) fileInputRef.current.value = '';
        alert('Banner cadastrado com sucesso!');
      } catch (error) {
        console.error('Erro no submit:', error);
        alert(`Erro ao cadastrar banner: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    },
  });

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Card elevation={2}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 700 }}>
            Cadastro de Banner
          </Typography>
          
          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            display="flex"
            flexDirection="column"
            gap={2.5}
          >
            <TextField
              label="Título"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.title && Boolean(formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
              required
              fullWidth
            />
            
            <TextField
              label="Ordem de Exibição"
              name="exhibition_order"
              type="number"
              value={formik.values.exhibition_order}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.exhibition_order && Boolean(formik.errors.exhibition_order)}
              helperText={formik.touched.exhibition_order && formik.errors.exhibition_order}
              required
              fullWidth
              inputProps={{ min: 1 }}
            />
            
            <TextField
              label="Descrição"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
              multiline
              rows={3}
              fullWidth
            />
            
            <TextField
              select
              label="Status"
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.status && Boolean(formik.errors.status)}
              helperText={formik.touched.status && formik.errors.status}
              required
              fullWidth
            >
              <MenuItem value="active">Ativo</MenuItem>
              <MenuItem value="inactive">Inativo</MenuItem>
              <MenuItem value="archived">Arquivado</MenuItem>
            </TextField>
            
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Agendamento (Opcional)
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  label="Data/Hora de Início"
                  name="scheduled_start"
                  type="datetime-local"
                  value={formik.values.scheduled_start}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.scheduled_start && Boolean(formik.errors.scheduled_start)}
                  helperText={formik.touched.scheduled_start && formik.errors.scheduled_start}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  fullWidth
                />
                
                <TextField
                  label="Data/Hora de Fim"
                  name="scheduled_end"
                  type="datetime-local"
                  value={formik.values.scheduled_end}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.scheduled_end && Boolean(formik.errors.scheduled_end)}
                  helperText={formik.touched.scheduled_end && formik.errors.scheduled_end}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  fullWidth
                />
              </Box>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Imagem do Banner
              </Typography>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  border: '2px dashed',
                  borderColor: formik.touched.imagem && formik.errors.imagem ? 'error.main' : 'divider',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUpload />}
                  sx={{ mb: 1 }}
                >
                  Selecionar Imagem
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="imagem"
                    accept="image/*"
                    hidden
                    onChange={(event) => {
                      const file = event.currentTarget.files?.[0] || null;
                      console.log('Arquivo selecionado:', file);
                      formik.setFieldValue('imagem', file);
                    }}
                  />
                </Button>

                {formik.values.imagem && (
                  <Box sx={{ mt: 2 }}>
                    <Alert severity="success" sx={{ mb: 1 }}>
                      Arquivo selecionado: {formik.values.imagem.name} ({(formik.values.imagem.size / 1024 / 1024).toFixed(2)} MB)
                    </Alert>
                  </Box>
                )}

                {formik.touched.imagem && formik.errors.imagem && (
                  <Alert severity="error">
                    {formik.errors.imagem as string}
                  </Alert>
                )}
              </Paper>
            </Box>

            <Button 
              type="submit" 
              variant="contained" 
              startIcon={<Save />}
              size="large"
              sx={{ mt: 3 }}
            >
              Salvar Banner
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default BannerForm;