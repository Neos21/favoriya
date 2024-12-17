import { FC, FormEvent, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import { Alert, Box, Button, Container, Divider, Fade, Modal, TextField, Tooltip, Typography } from '@mui/material';

import { isValidId, isValidPassword } from '../../common/helpers/validators/validator-user';
import { modalStyle } from '../../shared/constants/modal-style';
import { userConstants } from '../../shared/constants/user-constants';
import { apiGetWithoutToken } from '../../shared/services/api/api-fetch';
import { initialUserState, setUser } from '../../shared/stores/user-slice';
import { apiSignup } from './services/api-signup';

import type { Result } from '../../common/types/result';

/** Signup Page */
export const SignupPage: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [isIn, setIsIn] = useState<boolean>(false);
  const [numberOfUsersMessage, setNumberOfUsersMessage] = useState<string>('AI に作らせる SNS。');
  const [errorMessage, setErrorMessage] = useState<string>(null);
  const [formErrors, setFormErrors] = useState<{ id?: string; password?: string }>({});
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
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
  
  /** 入力チェック : エラーがあれば formErrors にメッセージをセット・エラーがなければ `true` を返す */
  const isValidForm = (id: string, password: string): boolean => {
    const newErrors: { id?: string, password?: string } = {
      id      : isValidId(id).error,
      password: isValidPassword(password).error
    };
    setFormErrors(newErrors);
    return Object.values(newErrors).every(newError => newError == null);
  };
  
  /** On Submit */
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    
    const data     = new FormData(event.currentTarget);
    const id       = data.get('id')!.toString();
    const password = data.get('password')!.toString();
    
    // バリデーション失敗時 : ココでエラーメッセージがセットされ各フォーム部品の下部に表示される
    if(!isValidForm(id, password)) return;
    
    try {
      const signupResult = await apiSignup(id, password);  // ユーザ登録する
      if(signupResult.error != null) return setErrorMessage(signupResult.error);
      
      // ユーザ登録成功
      setIsModalOpen(true);  // モーダルを開く
    }
    catch(error) {
      setErrorMessage('ユーザ登録処理に失敗しました。もう一度やり直してください');
      console.error('ユーザ登録処理に失敗', error);
    }
  };
  
  /** On Close Modal */
  const onCloseModal = () => {
    setIsModalOpen(false);
    navigate('/login');
  };
  
  return <Box component="div" sx={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
    <Container maxWidth="sm" sx={{ minWidth: 300, py: 1 }}>
      <Typography component="div" sx={{ textAlign: 'center' }}>
        <img src="/apple-touch-icon.png" width="80" height="80" alt="Favoriya" loading="lazy" />
      </Typography>
      <Typography component="h1" variant="h3" sx={{ textAlign: 'center' }}>Sign Up</Typography>
      
      <Fade in={isIn}>
        <Typography component="p" sx={{ mt: 2, color: 'grey.500', textAlign: 'center'}}>{numberOfUsersMessage}</Typography>
      </Fade>
      
      {errorMessage != null && <Alert severity="error" sx={{ mt: 2 }}>{errorMessage}</Alert>}
      
      <Box component="form" onSubmit={onSubmit} sx={{ mt: 1 }}>
        <TextField
          type="text" name="id" label="User ID"
          required autoFocus
          fullWidth margin="normal"
          error={formErrors.id != null}
          helperText={formErrors.id}
        />
        <TextField
          type="password" name="password" label="Password"
          required autoComplete="current-password"
          fullWidth margin="normal"
          error={formErrors.password != null}
          helperText={formErrors.password}
        />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }} endIcon={<PersonAddAlt1Icon />}>Sign Up</Button>
      </Box>
      
      <Divider sx={{ mt: 4 }} />
      <Box component="div" sx={{ mt: 4 }}>
        <Button component={Link} to="/login" variant="outlined" endIcon={<LoginIcon />}>Log In</Button>
      </Box>
      
      <Divider sx={{ mt: 4 }} />
      <Box component="div" sx={{ mt: 4, textAlign: 'center', color: 'grey.500' }}>
        <Tooltip title="Help (GitHub Wiki)">
          <Button variant="outlined" color="inherit" endIcon={<HelpOutlineOutlinedIcon />} onClick={() => window.open('https://github.com/Neos21/pseudo/wiki')}>About</Button>
        </Tooltip>
      </Box>
      
      <Modal open={isModalOpen}>
        <Box component="div" sx={modalStyle}>
          <Typography component="h2" variant="h5">ユーザ登録が完了しました</Typography>
          <Typography component="p" sx={{ mt: 3 }}>ログイン画面でログインしてください</Typography>
          <Box component="div" sx={{ mt: 3, textAlign: 'right' }}>
            <Button variant="contained" autoFocus onClick={onCloseModal}>OK</Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  </Box>;
};
