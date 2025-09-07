import React, { useState } from 'react';
import { Box, Tabs, Tab, Paper, Typography, Button, Link } from '@mui/material';
import { OpenInNew } from '@mui/icons-material';
import BannerForm from './BannerForm';
import BannerCarousel from './BannerCarousel';
import BannerList from './BannerList';
import TVDisplay from './TVDisplay';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
}

const AdminDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '1200px', mx: 'auto', p: 2 }}>
      <Paper elevation={3} sx={{ mb: 3 }}>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            🏋️ FitLoop - Admin de Banners
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Gerencie os banners que aparecem no app FitLoop
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
          <Tab label="📝 Criar Banner" {...a11yProps(0)} />
          <Tab label="👁️ Preview Online" {...a11yProps(1)} />
          <Tab label="📋 Listar Banners" {...a11yProps(2)} />
          <Tab label="📺 TV Display" {...a11yProps(3)} />
        </Tabs>
      </Box>

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
            📺 TV Display
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
    </Box>
  );
};

export default AdminDashboard;
