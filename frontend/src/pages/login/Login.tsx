import React, { FC } from 'react';

import { Box, Button, Container, TextField, Typography } from '@mui/material';

import { apiLogin } from './services/api-login';

/** Login Page */
export const LoginPage: FC = () => {
  /** On Submit */
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data     = new FormData(event.currentTarget);
    const userId   = data.get('userId')!.toString();
    const password = data.get('password')!.toString();
    try {
      const result = await apiLogin(userId, password);
      alert(`ログイン成功 : ${JSON.stringify(result)}`);
    }
    catch(error) {
      alert(`ログイン失敗 : ${error}`);
    }
  };
  
  return (
    <Container maxWidth="sm">
      <Typography component="h1" variant="h4" marginY={2}>Log In</Typography>
      <Box component="form" onSubmit={onSubmit}>
        <TextField
          type="text" name="userId" label="User ID"
          required autoFocus
          fullWidth margin="normal"
        />
        <TextField
          type="password" name="password" label="Password"
          required autoComplete="current-password"
          fullWidth margin="normal"
        />
        <Button
          type="submit" variant="contained"
          fullWidth sx={{ my: 3, mb: 2 }}
        >
          Log In
        </Button>
      </Box>
    </Container>
  );
};
