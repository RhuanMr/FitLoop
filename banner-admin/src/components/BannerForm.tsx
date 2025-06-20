import React, { useRef } from 'react';
import { Box, Button, TextField, Typography, Paper, MenuItem } from '@mui/material';
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
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('exhibition_order', String(values.exhibition_order));
        formData.append('description', values.description);
        formData.append('status', values.status);
        if (values.imagem) {
          formData.append('imagem', values.imagem);
        }

        await createBanner(formData);
        resetForm();
        if (fileInputRef.current) fileInputRef.current.value = '';
        alert('Banner cadastrado com sucesso!');
      } catch (error) {
        alert('Erro ao cadastrar banner');
      }
    },
  });

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 5 }}>
      <Typography variant="h5" mb={2}>
        Cadastro de Banner
      </Typography>
      <Box
        component="form"
        onSubmit={formik.handleSubmit}
        display="flex"
        flexDirection="column"
        gap={2}
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
          rows={2}
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
        >
          <MenuItem value="active">Ativo</MenuItem>
          <MenuItem value="inactive">Inativo</MenuItem>
          <MenuItem value="archived">Arquivado</MenuItem>
        </TextField>
        <Button
          variant="contained"
          component="label"
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
              formik.setFieldValue('imagem', file);
            }}
          />
        </Button>
        {formik.touched.imagem && formik.errors.imagem && (
          <Typography color="error" variant="caption">
            {formik.errors.imagem as string}
          </Typography>
        )}
        <Button type="submit" variant="contained" color="primary">
          Salvar
        </Button>
      </Box>
    </Paper>
  );
};

export default BannerForm;