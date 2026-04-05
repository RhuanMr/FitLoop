import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#E63946', // Vermelho principal
      light: '#F4A3A9',
      dark: '#A4212B',
      contrastText: '#888888',
    },
    secondary: {
      main: '#1B1B1B', // Preto
      light: '#4F4F4F',
      dark: '#000000',
      contrastText: '#888888',
    },
    background: {
      default: '#000000',
      paper: '#2a2a2a',
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
    h1: {
      color: '#E63946',
    },
    h2: {
      color: '#E63946',
    },
    h3: {
      color: '#E63946',
    },
    h4: {
      fontSize: '2rem',
      fontWeight: 700,
      color: '#E63946',
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#E63946',
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#E63946',
    },
    body1: {
      color: '#E63946',
    },
    body2: {
      color: '#E63946',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      color: '#E63946',
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
        outlined: {
          borderColor: '#E63946',
          '&:hover': {
            borderColor: '#F4A3A9',
            backgroundColor: 'rgba(230, 57, 70, 0.1)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#2a2a2a',
          borderBottom: '2px solid #E63946',
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#2a2a2a',
          backgroundImage: 'none',
          border: '1px solid #3a3a3a',
          '&:hover': {
            borderColor: '#E63946',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#2a2a2a',
          border: '2px solid transparent',
          borderImage: 'linear-gradient(135deg, #E63946 0%, #A4212B 100%) 1',
          '&:hover': {
            boxShadow: '0px 0px 12px rgba(230, 57, 70, 0.3)',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            color: '#888888',
            '& fieldset': {
              borderColor: '#3a3a3a',
            },
            '&:hover fieldset': {
              borderColor: '#E63946',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#E63946',
              borderWidth: 2,
            },
          },
          '& .MuiInputBase-input::placeholder': {
            color: '#A4212B',
            opacity: 1,
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: '#888888',
          '&.Mui-selected': {
            color: '#E63946',
            borderBottom: '3px solid #E63946',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#888888',
          '&:hover': {
            backgroundColor: 'rgba(230, 57, 70, 0.1)',
            color: '#E63946',
          },
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
});

export default theme;
