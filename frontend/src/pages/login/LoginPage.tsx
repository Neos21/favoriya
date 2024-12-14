import { FC, FormEvent, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import { Alert, Box, Button, Container, Divider, TextField, Typography } from '@mui/material';

import { userConstants } from '../../shared/constants/user-constants';
import { initialUserState, setUser } from '../../shared/stores/user-slice';
import { apiLogin } from './services/api-login';

/** Login Page */
export const LoginPage: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [errorMessage, setErrorMessage] = useState<string>(null);
  
  // 本画面に遷移してきた時はログイン済の情報があったら削除する
  useEffect(() => {
    dispatch(setUser(Object.assign({}, initialUserState)));
    localStorage.removeItem(userConstants.localStorageKey);
  }, [dispatch]);
  
  /** On Submit */
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    setErrorMessage(null);
    
    const data     = new FormData(event.currentTarget);
    const id       = data.get('id')!.toString();
    const password = data.get('password')!.toString();
    
    try {
      const loginResult = await apiLogin(id, password);  // ログイン認証してユーザ情報を返してもらう
      if(loginResult.error) return setErrorMessage(loginResult.error);
      
      const user = loginResult.result;
      dispatch(setUser(user));  // Store に保存する
      localStorage.setItem(userConstants.localStorageKey, JSON.stringify(user));  // 初期起動時に参照する LocalStorage
      navigate('/global-timeline');
    }
    catch(error) {
      setErrorMessage('ログイン処理に失敗しました。もう一度やり直してください');
      console.warn('ログイン処理に失敗', error);
    }
  };
  
  return <Box component="div" sx={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
    <Container maxWidth="sm" sx={{ minWidth: 300, py: 1 }}>
      <Typography component="div" sx={{ textAlign: 'center' }}>
        <img src="/apple-touch-icon.png" width="64" height="64" alt="Favoriya" loading="lazy" />
      </Typography>
      <Typography component="h1" variant="h3" sx={{ textAlign: 'center' }}>Favoriya</Typography>
      
      {errorMessage != null && <Alert severity="error" sx={{ mt: 2 }}>{errorMessage}</Alert>}
      
      <Box component="form" onSubmit={onSubmit} sx={{ mt: 2 }}>
        <TextField
          type="text" name="id" label="User ID"
          required autoFocus
          fullWidth margin="normal"
        />
        <TextField
          type="password" name="password" label="Password"
          required autoComplete="current-password"
          fullWidth margin="normal"
        />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>Log In</Button>
      </Box>
      
      <Divider sx={{ mt: 4 }} />
      <Box component="div" sx={{ mt: 4, textAlign: 'right' }}>
        <Button component={Link} to="/signup" variant="outlined">Sign Up</Button>
      </Box>
    </Container>
  </Box>;
};
