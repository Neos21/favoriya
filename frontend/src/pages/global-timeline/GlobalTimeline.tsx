import { FC } from 'react';
import { useSelector } from 'react-redux';

import { Container, Typography } from '@mui/material';

import { RootState } from '../../shared/stores/store';

/** Global Timeline */
export const GlobalTimelinePage: FC = () => {
  const userState = useSelector((state: RootState) => state.user);
  
  return (
    <Container maxWidth="sm">
      <Typography component="h1" variant="h4" marginY={2}>Global Timeline</Typography>
      <Typography component="p">
        ようこそ {userState.userName} さん
      </Typography>
    </Container>
  );
};
