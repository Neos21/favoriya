import { FC } from 'react';
import { Link } from 'react-router-dom';

import { Button, Container, Stack, Typography } from '@mui/material';

/** Home Page */
export const HomePage: FC = () => {
  return (
    <Container maxWidth="sm">
      <Typography component="h1" variant="h4" marginY={2}>Pseudo</Typography>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" sx={{ whiteSpace: 'nowrap' }} component={Link} to="/login">
          Log In
        </Button>
        <Button variant="contained" sx={{ whiteSpace: 'nowrap' }} disabled>
          Sign Up
        </Button>
      </Stack>
    </Container>
  );
};
