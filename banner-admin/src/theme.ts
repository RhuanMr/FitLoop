import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#E63946', // Vermelho principal
      light: '#F4A3A9',
      dark: '#A4212B',
      contrastText: '#fff',
    },
    secondary: {
      main: '#1B1B1B', // Preto
      light: '#4F4F4F',
      dark: '#000000',
      contrastText: '#fff',
    },
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
    },
    error: {
      main: '#E63946',
    },
    success: {
      main: '#2A9D8F',
    },
    warning: {
      main: '#F4A261',
    },
    info: {
      main: '#457B9D',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
      fontSize: '2rem',
      fontWeight: 700,
      color: '#1B1B1B',
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#1B1B1B',
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#1B1B1B',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        contained: {
          boxShadow: '0px 2px 8px rgba(230, 57, 70, 0.15)',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(230, 57, 70, 0.25)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
});

export default theme;
