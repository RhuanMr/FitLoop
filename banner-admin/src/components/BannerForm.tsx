import React from 'react';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { createBanner } from '../services/bannerService';


const validationSchema = Yup.object({
  title: Yup.string().required('Título obrigatório'),
  url_image: Yup.string().url('URL inválida').required('URL da imagem obrigatória'),
  exhibition_order: Yup.number()
    .typeError('Informe um número')
    .integer('Deve ser um número inteiro')
    .min(1, 'Mínimo 1')
    .required('Ordem obrigatória'),
  status: Yup.boolean(),
});

const BannerForm: React.FC = () => {
  const formik = useFormik({
    initialValues: {
      title: '',
      url_image: '',
      exhibition_order: 1,
      status: true,
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await createBanner(values);
        resetForm();
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
          label="URL da Imagem"
          name="url_image"
          value={formik.values.url_image}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.url_image && Boolean(formik.errors.url_image)}
          helperText={formik.touched.url_image && formik.errors.url_image}
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
        <Button type="submit" variant="contained" color="primary">
          Salvar
        </Button>
      </Box>
    </Paper>
  );
};

export default BannerForm;