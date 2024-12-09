import { FC, FormEvent, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import { Alert, Box, Button, Divider, Modal, TextField, Typography } from '@mui/material';

import { isValidId, isValidPassword } from '../../common/helpers/validators/validator-user';
import { modalStyle } from '../../shared/constants/modal-style';
import { userConstants } from '../../shared/constants/user-constants';
import { initialUserState, setUser } from '../../shared/stores/user-slice';
import { apiSignup } from './services/api-signup';

/** Signup Page */
export const SignupPage: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [errorMessage, setErrorMessage] = useState<string>(null);
  const [formErrors, setFormErrors] = useState<{ id?: string; password?: string }>({});
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  // 本画面に遷移してきた時はログイン済の情報があったら削除する
  useEffect(() => {
    dispatch(setUser(Object.assign({}, initialUserState)));
    localStorage.removeItem(userConstants.localStorageKey);
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
      console.error('ユーザ登録処理に失敗しました', error);
    }
  };
  
  /** On Close Modal */
  const onCloseModal = () => {
    setIsModalOpen(false);
    navigate('/login');
  };
  
  return <>
    <Typography component="h1" variant="h4" sx={{ mt: 3 }}>登録</Typography>
    
    {errorMessage != null && <Alert severity="error" sx={{ mt: 3 }}>{errorMessage}</Alert>}
    
    <Box component="form" onSubmit={onSubmit} sx={{ mt: 3 }}>
      <TextField
        type="text" name="id" label="ユーザ ID"
        required autoFocus
        fullWidth margin="normal"
        error={formErrors.id != null}
        helperText={formErrors.id}
      />
      <TextField
        type="password" name="password" label="パスワード"
        required autoComplete="current-password"
        fullWidth margin="normal"
        error={formErrors.password != null}
        helperText={formErrors.password}
      />
      <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>登録</Button>
    </Box>
    
    <Divider sx={{ mt: 4 }} />
    <Box component="div" sx={{ mt: 4, textAlign: 'right' }}>
      <Button component={Link} to="/" variant="contained">ホームに戻る</Button>
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
  </>;
};
