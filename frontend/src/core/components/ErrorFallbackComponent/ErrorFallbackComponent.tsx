import { FC } from 'react';

import { Box, Button, Divider, Typography } from '@mui/material';

/** Error Fallback Component */
export const ErrorFallbackComponent: FC = () => {
  return <Box component="div" sx={{ height: '100%', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
    <Box component="div">
      <Typography component="h1">予期しないエラーが発生しました・ゴメンね</Typography>
      <Button variant="contained" sx={{ mt: 3 }} onClick={() => { location.href = '/'; }}>トップに戻る</Button>
      <Divider sx={{ mt: 3 }} />
      <Button variant="contained" sx={{ mt: 3 }} onClick={() => { window.open('https://legacy-of-bbs.pages.dev'); }}>
        エラーが続いたらコチラにドウゾ<br />
        <strong>懐かし掲示板 BBS</strong>
      </Button>
    </Box>
  </Box>;
};
