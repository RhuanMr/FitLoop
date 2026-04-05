import React, { useState } from 'react';
import { Box, Tabs, Tab, Paper, Typography, Button, AppBar, Toolbar } from '@mui/material';
import { OpenInNew } from '@mui/icons-material';
import BannerForm from './BannerForm';
import BannerCarousel from './BannerCarousel';
import BannerList from './BannerList';
import TVDisplay from './TVDisplay';
import SiteManagement from './SiteManagement';
import SuggestedPosts from './SuggestedPosts';
import SimpleSiteForm from './SimpleSiteForm';
import TabPanel from './common/TabPanel';
import { a11yProps } from '../utils/formatting';

const AdminDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #E63946 0%, #A4212B 100%)' }}>
        <Toolbar>
          <Typography variant="h5" component="h1" sx={{ flexGrow: 1, fontWeight: 700, color: '#000000' }}>
            FitLoop - Admin de Banners
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, color: '#000000' }}>
            Gerenciamento de conteúdo
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ width: '100%', maxWidth: '1400px', mx: 'auto', p: 2, flex: 1 }}>
        <Paper elevation={1} sx={{ mb: 3, p: 2, backgroundColor: '#F8F9FA' }}>
          <Typography variant="subtitle1" color="text.secondary">
            Gerencie os banners, sites e posts sugeridos que aparecem no app FitLoop
          </Typography>
        </Paper>

        <Paper>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="admin tabs" 
            variant="scrollable" 
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '0.95rem',
              }
            }}
          >
            <Tab label="Criar Banner" {...a11yProps(0)} />
            <Tab label="Preview Online" {...a11yProps(1)} />
            <Tab label="Listar Banners" {...a11yProps(2)} />
            <Tab label="TV Display" {...a11yProps(3)} />
            <Tab label="Adicionar Site" {...a11yProps(4)} />
            <Tab label="Gerenciar Sites" {...a11yProps(5)} />
            <Tab label="Posts Sugeridos" {...a11yProps(6)} />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <BannerForm />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <BannerCarousel />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <BannerList />
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                TV Display
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Esta é a visualização otimizada para exibição em TV. Use o botão abaixo para abrir em uma nova aba.
              </Typography>
              <Button
                variant="contained"
                startIcon={<OpenInNew />}
                onClick={() => window.open('/tv', '_blank')}
                sx={{ mb: 3 }}
              >
                Abrir TV Display em Nova Aba
              </Button>
            </Box>
            <TVDisplay />
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <SimpleSiteForm />
          </TabPanel>

          <TabPanel value={tabValue} index={5}>
            <SiteManagement />
          </TabPanel>

          <TabPanel value={tabValue} index={6}>
            <SuggestedPosts />
          </TabPanel>
        </Paper>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
