import { FC, useEffect, useState } from 'react';

import { CircularProgress, Fade, Typography } from '@mui/material';

/** Loading Spinner Component */
export const LoadingSpinnerComponent: FC = () => {
  const [isIn, setIsIn] = useState<boolean>(false);
  
  useEffect(() => {
    setTimeout(() => {
      setIsIn(true);
    }, 500);
  }, []);
  
  return <Typography sx={{ mt: 5, textAlign: 'center' }}>
    <Fade in={isIn}>
      <CircularProgress />
    </Fade>
  </Typography>;
};
