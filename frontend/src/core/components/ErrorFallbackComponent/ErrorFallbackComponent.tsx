import { FC } from 'react';

import { Box, Button, Typography } from '@mui/material';

/** Error Fallback Component */
export const ErrorFallbackComponent: FC = () => {
  return <Box component="div" sx={{ height: '100%', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
    <Box component="div">
      <Typography component="h1">予期しないエラーが発生しました・ゴメンね</Typography>
      <Button variant="contained" sx={{ mt: 3 }} onClick={() => { location.href = '/'; }}>トップに戻る</Button>
    </Box>
  </Box>;
};
