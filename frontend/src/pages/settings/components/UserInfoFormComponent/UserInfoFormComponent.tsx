import { ChangeEvent, FC, FormEvent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Alert, Box, Button, Checkbox, FormControlLabel, TextField, Typography } from '@mui/material';

import { camelToSnakeCaseObject, snakeToCamelCaseObject } from '../../../../common/helpers/convert-case';
import { isValidName, isValidProfileText } from '../../../../common/helpers/validators/validator-user';
import { userConstants } from '../../../../shared/constants/user-constants';
import { useApiPatch } from '../../../../shared/hooks/use-api-fetch';
import { setUser } from '../../../../shared/stores/user-slice';

import type { UserApi } from '../../../../common/types/user';
import type { Result } from '../../../../common/types/result';
import type { RootState } from '../../../../shared/stores/store';

type FormData = {
  name                     : string,
  profileText              : string,
  showOwnFavouritesCount   : boolean,
  showOthersFavouritesCount: boolean
};

/** User Info Form Component */
export const UserInfoFormComponent: FC = () => {
  const dispatch = useDispatch();
  const apiPatch = useApiPatch();
  
  const userState = useSelector((state: RootState) => state.user);
  
  const [formData, setFormData] = useState<FormData>({
    name                     : '',
    profileText              : '',
    showOwnFavouritesCount   : false,
    showOthersFavouritesCount: false
  });
  const [formErrors, setFormErrors] = useState<{
    name?       : string,
    profileText?: string
  }>({});
  const [errorMessage, setErrorMessage] = useState<string>(null);
  const [succeededMessage, setSucceededMessage] = useState<string>(null);
  
  // 初回読み込み
  useEffect(() => {
    setFormData({
      name                     : userState.name,
      profileText              : userState.profileText,
      showOwnFavouritesCount   : userState.showOwnFavouritesCount    ?? false,
      showOthersFavouritesCount: userState.showOthersFavouritesCount ?? false
    });
  }, [setFormData, userState]);
  
  /** フォームの値保持 */
  const onChangeText = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(previousFormData => ({ ...previousFormData, [name]: value }));
  };
  const onChangeChecked = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setFormData(previousFormData => ({ ...previousFormData, [name]: checked }));
  };
  
  /** フォームの入力チェック */
  const isValidForm = (name: string, profileText: string): boolean => {
    const newErrors: { name: string, profileText: string } = {
      name       : isValidName(name).error,
      profileText: isValidProfileText(profileText).error
    };
    setFormErrors(newErrors);
    return Object.values(newErrors).every(newError => newError == null);
  };
  
  /** フォームの Submit 処理 */
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSucceededMessage(null);
    
    // 入力チェック
    if(!isValidForm(formData.name, formData.profileText)) return;
    
    try {
      const response = await apiPatch(`/users/${userState.id}`, camelToSnakeCaseObject(formData));  // Throws
      const updatedUserApi: Result<UserApi> = await response.json();  // Throws
      if(updatedUserApi.error != null) return setErrorMessage(updatedUserApi.error);
      
      const updatedUser = snakeToCamelCaseObject(updatedUserApi.result);
      const user = Object.assign(Object.assign({}, userState), {
        name                     : updatedUser.name,
        profileText              : updatedUser.profileText,
        showOwnFavouritesCount   : updatedUser.showOwnFavouritesCount,
        showOthersFavouritesCount: updatedUser.showOthersFavouritesCount
      });
      dispatch(setUser(user));
      localStorage.setItem(userConstants.localStorageKey, JSON.stringify(user));
      setSucceededMessage('ユーザ情報を更新しました');  // 成功時のメッセージを表示する
    }
    catch(error) {
      setErrorMessage('ユーザ情報更新処理に失敗しました。もう一度やり直してください');
      console.error('ユーザ情報更新処理に失敗', error);
    }
  };
  
  return <>
    <Typography component="h2" variant="h5" sx={{ mt: 3 }}>ユーザ情報</Typography>
    
    {errorMessage != null && <Alert severity="error" sx={{ mt: 3 }}>{errorMessage}</Alert>}
    
    {succeededMessage != null && <Alert severity="success" sx={{ mt: 3 }}>{succeededMessage}</Alert>}
    
    <Box component="form" onSubmit={onSubmit} sx={{ mt: 3 }}>
      <TextField
        type="text" name="name" label="ユーザ名" value={formData.name} onChange={onChangeText}
        required
        fullWidth margin="normal"
        error={formErrors.name != null}
        helperText={formErrors.name}
      />
      <TextField
        multiline name="profileText" label="プロフィールテキスト" value={formData.profileText} onChange={onChangeText}
        fullWidth rows={4} margin="normal"
        error={formErrors.profileText != null}
        helperText={formErrors.profileText}
      />
      <Typography component="div"><FormControlLabel control={<Checkbox name="showOwnFavouritesCount"    checked={formData.showOwnFavouritesCount   } onChange={onChangeChecked} />} label="自分の投稿のふぁぼられ数を表示する" /></Typography>
      <Typography component="div"><FormControlLabel control={<Checkbox name="showOthersFavouritesCount" checked={formData.showOthersFavouritesCount} onChange={onChangeChecked} />} label="他人の投稿のふぁぼられ数を表示する" /></Typography>
      <Box component="div" sx={{ mt: 4, textAlign: 'right' }}>
        <Button type="submit" variant="contained">更新</Button>
      </Box>
    </Box>
  </>;
};
