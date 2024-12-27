import { createTheme } from '@mui/material';

/** 共通部分 */
const commonThemeProperties = {
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
};

/** ダークテーマのカラーパレット */
export const darkTheme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'dark',
    background: {
      default: '#001020'  // index.html にてファーストロード時を暗くするため同値を指定している
    },
    primary: {
      main: '#2196f3'
    }
  },
  ...commonThemeProperties as object
});

/** ライトテーマのカラーパレット */
export const lightTheme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'light',
    background: {
      default: '#fffdfe'
    }
  },
  ...commonThemeProperties as object
});
