import { ChangeEvent, FC, FormEvent, useState } from 'react';
import { useSelector } from 'react-redux';

import { Alert, Box, Button, TextField, Typography } from '@mui/material';

import { camelToSnakeCaseObject } from '../../../../common/helpers/convert-case';
import { isValidPassword } from '../../../../common/helpers/validators/validator-user';
import { useApiPost } from '../../../../shared/hooks/use-api-fetch';

import type { Result } from '../../../../common/types/result';
import type { RootState } from '../../../../shared/stores/store';

type FormData = { currentPassword: string, newPassword: string };

/** Change Password Form Component */
export const ChangePasswordFormComponent: FC = () => {
  const apiPost = useApiPost();
  
  const userState = useSelector((state: RootState) => state.user);
  
  const [formData, setFormData] = useState<FormData>({ currentPassword: '', newPassword: '' });
  const [formErrors, setFormErrors] = useState<{ currentPassword?: string, newPassword: string }>({ currentPassword: null, newPassword: null });
  const [errorMessage, setErrorMessage] = useState<string>(null);
  const [succeededMessage, setSucceededMessage] = useState<string>(null);
  
  /** フォームの値保持 */
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(previousFormData => ({ ...previousFormData, [name]: value }));
  };
  
  /** フォームの入力チェック */
  const isValidForm = (currentPassword: string, newPassword: string): boolean => {
    const newErrors: { currentPassword: string, newPassword: string } = {
      currentPassword: isValidPassword(currentPassword).error,
      newPassword    : isValidPassword(newPassword).error
    };
    setFormErrors(newErrors);
    return Object.values(newErrors).every(newError => newError == null);
  };
  
  /** フォームの Submit 処理 */
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSucceededMessage(null);
    
    const currentPassword = formData.currentPassword;
    const newPassword     = formData.newPassword;
    if(!isValidForm(currentPassword, newPassword)) return;
    if(currentPassword === newPassword) return setErrorMessage('同じパスワード文字列が入力されています');
    
    try {
      const id = userState.id;
      const response = await apiPost(`/users/${id}/change-password`, camelToSnakeCaseObject({ currentPassword, newPassword }));  // Throws
      const result: Result<boolean> = await response.json();  // Throws
      if(result.error != null) return setErrorMessage(result.error);
      
      setFormData({ currentPassword: '', newPassword: '' });  // フォームをリセットする
      setSucceededMessage('パスワードを変更しました');  // 成功時のメッセージを表示する
    }
    catch(error) {
      setErrorMessage('パスワードの変更処理に失敗しました。もう一度やり直してください');
      console.error('パスワードの変更処理に失敗しました', error);
    }
  };
  
  return (<>
    <Typography component="h2" variant="h5" sx={{ mt: 3 }}>パスワード変更</Typography>
    
    {errorMessage != null && <Alert severity="error" sx={{ mt: 3 }}>{errorMessage}</Alert>}
    
    {succeededMessage != null && <Alert severity="success" sx={{ mt: 3 }}>{succeededMessage}</Alert>}
    
    <Box component="form" onSubmit={onSubmit} sx={{ mt: 3 }}>
      <TextField
        type="password" name="currentPassword" label="現在のパスワード" value={formData.currentPassword} onChange={onChange}
        required autoComplete="current-passowrd"
        fullWidth margin="normal"
        error={formErrors.currentPassword != null}
        helperText={formErrors.currentPassword}
      />
      <TextField
        type="password" name="newPassword" label="新規パスワード" value={formData.newPassword} onChange={onChange}
        required autoComplete="new-passowrd"
        fullWidth margin="normal"
        error={formErrors.newPassword != null}
        helperText={formErrors.newPassword}
      />
      <Box component="div" sx={{ mt: 4, textAlign: 'right' }}>
        <Button type="submit" variant="contained">パスワード変更</Button>
      </Box>
    </Box>
  </>);
};
