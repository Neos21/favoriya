import { ChangeEvent, FC, FormEvent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Alert, Box, Button, TextField, Typography } from '@mui/material';

import { snakeToCamelCaseObject } from '../../../../common/helpers/convert-case';
import { isValidName } from '../../../../common/helpers/validators/validator-user';
import { userConstants } from '../../../../shared/constants/user-constants';
import { useApiPatch } from '../../../../shared/hooks/use-api-fetch';
import { setUser } from '../../../../shared/stores/user-slice';

import type { UserApi } from '../../../../common/types/user';
import type { Result } from '../../../../common/types/result';
import type { RootState } from '../../../../shared/stores/store';

type FormData = { name: string };

/** User Info Form Component */
export const UserInfoFormComponent: FC = () => {
  const dispatch = useDispatch();
  const apiPatch = useApiPatch();
  
  const userState = useSelector((state: RootState) => state.user);
  
  const [formData, setFormData] = useState<FormData>({ name: '' });
  const [formErrors, setFormErrors] = useState<{ name?: string }>({});
  const [errorMessage, setErrorMessage] = useState<string>(null);
  const [succeededMessage, setSucceededMessage] = useState<string>(null);
  
  // 初回読み込み
  useEffect(() => {
    setFormData({ name: userState.name });
  }, [setFormData, userState]);
  
  /** フォームの値保持 */
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((previousFormData) => ({ ...previousFormData, [name]: value }));
  };
  
  /** フォームの入力チェック */
  const isValidForm = (name: string): boolean => {
    const newErrors: { name: string } = {
      name: isValidName(name).error
    };
    setFormErrors(newErrors);
    return Object.values(newErrors).every(newError => newError == null);
  };
  
  /** フォームの Submit 処理 */
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSucceededMessage(null);
    
    const name = formData.name;
    if(!isValidForm(name)) return;
    
    try {
      const id = userState.id;
      const response = await apiPatch(`/users/${id}`, { name });  // Throws
      const updatedUserApi: Result<UserApi> = await response.json();  // Throws
      if(updatedUserApi.error != null) return setErrorMessage(updatedUserApi.error);
      
      const updatedUser = snakeToCamelCaseObject(updatedUserApi.result);
      const user = Object.assign(Object.assign({}, userState), { name: updatedUser.name });
      dispatch(setUser(user));
      localStorage.setItem(userConstants.localStorageKey, JSON.stringify(user));
      setSucceededMessage('ユーザ情報を更新しました');  // 成功時のメッセージを表示する
    }
    catch(error) {
      setErrorMessage('ユーザ情報更新処理に失敗しました。もう一度やり直してください');
      console.error('ユーザ情報更新処理に失敗しました', error);
    }
  };
  
  return (<>
    <Typography component="h2" variant="h5" marginY={2}>User Info</Typography>
    
    {errorMessage != null && <Alert severity="error" sx={{ my: 3 }}>{errorMessage}</Alert>}
    
    {succeededMessage != null && <Alert severity="success" sx={{ my: 3 }}>{succeededMessage}</Alert>}
    
    <Box component="form" onSubmit={onSubmit}>
      <TextField
        type="text" name="name" label="User Name" value={formData.name} onChange={onChange}
        required
        fullWidth margin="normal"
        error={formErrors.name != null}
        helperText={formErrors.name}
      />
      <Button
        type="submit" variant="contained"
        fullWidth sx={{ mt: 3 }}
      >
        Update
      </Button>
    </Box>
  </>);
};
