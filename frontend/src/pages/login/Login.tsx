import React, { FC } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { Box, Button, Container, TextField, Typography } from '@mui/material';

import { setUser } from '../../shared/stores/user-slice';
import { apiLogin } from './services/api-login';

/** Login Page */
export const LoginPage: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  /** On Submit */
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data     = new FormData(event.currentTarget);
    const userId   = data.get('userId')!.toString();
    const password = data.get('password')!.toString();
    try {
      const user = await apiLogin(userId, password);  // ログイン認証してユーザ情報を返してもらう
      localStorage.setItem('user', JSON.stringify(user));  // 初期起動時に参照する LocalStorage
      dispatch(setUser(user));  // Store に保存する
      console.log('ログイン成功', user);
      navigate('/');
    }
    catch(error) {
      alert(`ログイン失敗 : ${error}`);  // TODO : MUI っぽいエラー表示にしたい
      console.warn('ログイン失敗', error);
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
