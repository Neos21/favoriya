import { FC, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import { Alert, Box, Button, Divider, Typography } from '@mui/material';

import { userConstants } from '../../../shared/constants/user-constants';
import { useApiDelete } from '../../../shared/hooks/use-api-fetch';
import { initialUserState, setUser } from '../../../shared/stores/user-slice';

import type { RootState } from '../../../shared/stores/store';

/** Delete Account Page */
export const DeleteAccountPage: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userState = useSelector((state: RootState) => state.user);
  const apiDelete = useApiDelete();
  
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>(null);
  
  /** アカウント削除 */
  const onDeleteAccount = async () => {
    setErrorMessage(null);
    setIsDeleting(true);
    try {
      const response = await apiDelete(`/users/${userState.id}`);
      if(!response.ok) return setErrorMessage('アカウントの削除処理に失敗');
      
      // Store・LocalStorage を削除する
      dispatch(setUser(Object.assign({}, initialUserState)));
      localStorage.removeItem(userConstants.localStorageKey);
      navigate('/login');
    }
    catch(error) {
      setErrorMessage('アカウントの削除処理に失敗しました。もう一度やり直してください');
      setIsDeleting(false);
      console.error('アカウントの削除処理に失敗', error);
    }
  };
  
  return <>
    <Typography component="h1" sx={{ mt: 3 }}>アカウントを削除する</Typography>
    
    <Typography component="p" sx={{ mt: 3 }}>
      <Button component={Link} to="/settings" variant="contained">戻る</Button>
    </Typography>
    
    <Divider sx={{ mt: 4 }} />
    
    <Typography component="div" sx={{ mt: 3 }}>
      <ul>
        <li>アカウントを削除すると、アバター画像、過去の投稿の全てのデータが物理削除されます
          <ul>
            <li>管理者でもデータ復元はできなくなります</li>
          </ul>
        </li>
        <li>削除したアカウントのユーザ ID は、他の人が登録に利用できるようになります
          <ul>
            <li>ご自身で再度同じ ID を使って登録することもできます</li>
          </ul>
        </li>
        <li>アカウント削除処理には若干時間がかかります。削除が完了するとログイン画面に遷移しますので、ボタンを押したらしばらくお待ちください</li>
        <li>以上の内容を認識したうえで、問題なければ以下の「アカウントを削除する」ボタンを押してください</li>
      </ul>
    </Typography>
    
    <Typography component="p" sx={{ mt: 3, color: 'error.main', fontWeight: 'bold' }}>確認ダイアログなどは出ませんので、よく確認のうえ「アカウントを削除する」ボタンを押してください。</Typography>
    
    <Divider sx={{ mt: 4 }} />
    
    {errorMessage != null && <Alert severity="error" sx={{ mt: 3 }}>{errorMessage}</Alert>}
    
    <Box component="div" sx={{ mt: 3, textAlign: 'right' }}>
      <Button variant="contained" color="error" onClick={onDeleteAccount} disabled={isDeleting}>アカウントを削除する</Button>
    </Box>
  </>;
};
