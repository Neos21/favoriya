import { Link } from 'react-router-dom';

import { Button, Container, Stack, Typography } from '@mui/material';

export const HomePage = () => {
  return (
    <Container maxWidth="sm">
      <Typography variant="h1" sx={{ my: 2, fontSize: '2rem', fontWeight: 'bold' }}>Pseudo</Typography>
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
