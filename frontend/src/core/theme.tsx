import { createTheme } from '@mui/material';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3'
    }
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Helvetica Neue"',
      'Helvetica',
      'YuGothic',
      '"Yu Gothic"',
      '"Noto Sans JP"',
      '"Noto Sans CJK JP"',
      '"Hiragino Sans"',
      '"Hiragino Kaku Gothic ProN"',
      'Meiryo',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
      '"Noto Color Emoji"'
    ].join(','),
    h1: {
      fontWeight: 'bold'
    },
    h2: {
      fontWeight: 'bold'
    },
    h3: {
      fontWeight: 'bold'
    },
    h4: {
      fontWeight: 'bold'
    },
    h5: {
      fontWeight: 'bold'
    },
    h6: {
      fontWeight: 'bold'
    },
    button: {
      textTransform: 'none'
    }
  }
});
