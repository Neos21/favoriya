import { createTheme } from '@mui/material';

export const theme = createTheme({
  palette: {
    mode: 'dark'
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
    button: {
      textTransform: 'none'
    }
  }
});
