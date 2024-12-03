import React, { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Button, Container, Modal, TextField, Typography } from '@mui/material';

import { apiSignup } from './services/api-signup';
import { validatePassword, validateUserId } from './services/validators-signup';

/** Signup Page */
export const SignupPage: FC = () => {
  const navigate = useNavigate();
  
  const [errors, setErrors] = useState<{ userId?: string; password?: string }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  /** 入力チェック : エラーがあれば errors にメッセージをセット・エラーがなければ `true` を返す */
  const validate = (userId: string, password: string): boolean => {
    const newErrors: { userId?: string; password?: string } = {};
    newErrors.userId   = validateUserId(userId);
    newErrors.password = validatePassword(password);
    setErrors(newErrors);
    return Object.values(newErrors).every(newError => newError == null);
  };
  
  /** On Submit */
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data     = new FormData(event.currentTarget);
    const userId   = data.get('user-id')!.toString();
    const password = data.get('password')!.toString();
    
    // バリデーション失敗時 : ココでエラーメッセージがセットされ各フォーム部品の下部に表示される
    if(!validate(userId, password)) return;
    
    try {
      const result = await apiSignup(userId, password);  // ユーザ登録する
      console.log('ユーザ登録成功', result);
      setIsModalOpen(true);  // モーダルを開く
    }
    catch(error) {
      console.error('ユーザ登録失敗', error);
      alert('ユーザ登録 API のコールに失敗しました。もう一度やり直してください');
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
      <Box component="form" onSubmit={onSubmit}>
        <TextField
          type="text" name="user-id" label="User ID"
          required autoFocus
          fullWidth margin="normal"
          error={errors.userId != null}
          helperText={errors.userId}
        />
        <TextField
          type="password" name="password" label="Password"
          required
          fullWidth margin="normal"
          error={errors.password != null}
          helperText={errors.password}
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
