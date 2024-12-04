import React, { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { Alert, Box, Button, Container, Modal, TextField, Typography } from '@mui/material';

import { isValidPassword, isValidUserId } from '../../common/helpers/validators/validator-user';
import { userConstants } from '../../shared/constants/user-constants';
import { setUser } from '../../shared/stores/user-slice';
import { apiSignup } from './services/api-signup';

/** Signup Page */
export const SignupPage: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [errorMessage, setErrorMessage] = useState<string>(null);
  const [formErrors, setFormErrors] = useState<{ userId?: string; password?: string }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 本画面に遷移してきた時はログイン済の情報があったら削除する
  useEffect(() => {
    dispatch(setUser({ userId: null }));
    localStorage.removeItem(userConstants.localStorageKey);
  }, [dispatch]);
  
  /** 入力チェック : エラーがあれば formErrors にメッセージをセット・エラーがなければ `true` を返す */
  const isValidForm = (userId: string, password: string): boolean => {
    const newErrors: { userId?: string, password?: string } = {
      userId  : isValidUserId(userId).error,
      password: isValidPassword(password).error
    };
    setFormErrors(newErrors);
    return Object.values(newErrors).every(newError => newError == null);
  };
  
  /** On Submit */
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    setErrorMessage(null);
    
    const data     = new FormData(event.currentTarget);
    const userId   = data.get('user-id')!.toString();
    const password = data.get('password')!.toString();
    
    // バリデーション失敗時 : ココでエラーメッセージがセットされ各フォーム部品の下部に表示される
    if(!isValidForm(userId, password)) return;
    
    try {
      const signupResult = await apiSignup(userId, password);  // ユーザ登録する
      if(signupResult.error) return setErrorMessage(signupResult.error);
      
      // ユーザ登録成功
      setIsModalOpen(true);  // モーダルを開く
    }
    catch(error) {
      setErrorMessage('ユーザ登録処理に失敗しました。もう一度やり直してください');
      console.error('ユーザ登録処理に失敗しました', error);
    }
  };
  
  /** On Close Modal */
  const onCloseModal = () => {
    setIsModalOpen(false);
    navigate('/login');
  };
  
  /** モーダルのスタイル */
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #999',
    borderRadius: 4,
    boxShadow: 24,
    p: 4
  };
  
  return (
    <Container maxWidth="sm">
      <Typography component="h1" variant="h4" marginY={2}>Sign Up</Typography>
      
      {errorMessage != null && <Alert severity="error" sx={{ my: 3 }}>{errorMessage}</Alert>}
      
      <Box component="form" onSubmit={onSubmit}>
        <TextField
          type="text" name="user-id" label="User ID"
          required autoFocus
          fullWidth margin="normal"
          error={formErrors.userId != null}
          helperText={formErrors.userId}
        />
        <TextField
          type="password" name="password" label="Password"
          required
          fullWidth margin="normal"
          error={formErrors.password != null}
          helperText={formErrors.password}
        />
        <Button
          type="submit" variant="contained"
          fullWidth sx={{ my: 3, mb: 2 }}
        >
          Sign Up
        </Button>
      </Box>
      
      <Modal open={isModalOpen}>
        <Box sx={modalStyle}>
          <Typography component="h2" variant="h5" marginBottom={2}>ユーザ登録が完了しました</Typography>
          <Typography>ログイン画面でログインしてください</Typography>
          <Box sx={{ textAlign: 'right' }}>
            <Button
              variant="contained"
              autoFocus
              onClick={onCloseModal}
              sx={{ mt: 2 }}
            >
              OK
            </Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};
