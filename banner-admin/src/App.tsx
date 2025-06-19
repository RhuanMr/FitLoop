import React from 'react';
import './App.css';
import { Container, CssBaseline, Box } from '@mui/material';
import BannerList from './components/BannerList';
import BannerForm from './components/BannerForm';

function App() {
  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="md">
        <Box my={4}>
          <BannerForm />
          <BannerList />
        </Box>
      </Container>
    </React.Fragment>
  );
}

export default App;
