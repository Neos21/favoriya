import { FC, FormEvent, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import { Alert, Box, Button, Container, Divider, Fade, TextField, Tooltip, Typography } from '@mui/material';

import { userConstants } from '../../shared/constants/user-constants';
import { apiGetWithoutToken } from '../../shared/services/api/api-fetch';
import { initialUserState, setUser } from '../../shared/stores/user-slice';
import { apiLogin } from './services/api-login';

import type { Result } from '../../common/types/result';

/** Login Page */
export const LoginPage: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [isIn, setIsIn] = useState<boolean>(false);
  const [numberOfUsersMessage, setNumberOfUsersMessage] = useState<string>('AI に作らせる SNS。');
  const [errorMessage, setErrorMessage] = useState<string>(null);
  
  useEffect(() => {
    // 本画面に遷移してきた時はログイン済の情報があったら削除する
    dispatch(setUser(Object.assign({}, initialUserState)));
    localStorage.removeItem(userConstants.localStorageKey);
    
    setTimeout(() => {
      setIsIn(true);
    }, 500);
    
    (async () => {
      try {
        const response = await apiGetWithoutToken('/public/number-of-users');
        const result: Result<number> = await response.json();
        if(result.result !== -1) setNumberOfUsersMessage(`ユーザ数 : ${result.result} 人`);
      }
      catch(error) {
        console.warn('Failed To Get Number Of Users', error);
      }
    })();
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
        <img src="/apple-touch-icon.png" width="80" height="80" alt="Favoriya" loading="lazy" />
      </Typography>
      <Typography component="h1" variant="h3" sx={{ textAlign: 'center' }}>Favoriya</Typography>
      
      <Fade in={isIn}>
        <Typography component="p" sx={{ mt: 2, color: 'grey.500', textAlign: 'center'}}>{numberOfUsersMessage}</Typography>
      </Fade>
      
      {errorMessage != null && <Alert severity="error" sx={{ mt: 2 }}>{errorMessage}</Alert>}
      
      <Box component="form" onSubmit={onSubmit} sx={{ mt: 1 }}>
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
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }} endIcon={<LoginIcon />}>Log In</Button>
      </Box>
      
      <Divider sx={{ mt: 4 }} />
      <Box component="div" sx={{ mt: 4, textAlign: 'right' }}>
        <Button component={Link} to="/signup" variant="outlined" endIcon={<PersonAddAlt1Icon />}>Sign Up</Button>
      </Box>
      
      <Divider sx={{ mt: 4 }} />
      <Box component="div" sx={{ mt: 4, textAlign: 'center', color: 'grey.500' }}>
        <Tooltip title="Help (GitHub Wiki)">
          <Button variant="outlined" color="inherit" endIcon={<HelpOutlineOutlinedIcon />} onClick={() => window.open('https://github.com/Neos21/pseudo/wiki')}>About</Button>
        </Tooltip>
      </Box>
    </Container>
  </Box>;
};
