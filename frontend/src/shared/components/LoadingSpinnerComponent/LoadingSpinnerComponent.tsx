import { FC, useEffect, useState } from 'react';

import { CircularProgress, Fade, Typography } from '@mui/material';

/** Loading Spinner Component */
export const LoadingSpinnerComponent: FC = () => {
  const [isIn, setIsIn] = useState<boolean>(false);
  
  useEffect(() => {
    setTimeout(() => {
      setIsIn(true);
    }, 1000);
  }, []);
  
  return (
    <Fade in={isIn}>
      <Typography sx={{ mt: 5, textAlign: 'center' }}>
        <CircularProgress />
      </Typography>
    </Fade>
  );
};
