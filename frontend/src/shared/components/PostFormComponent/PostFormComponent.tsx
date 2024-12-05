import React, { FC, useState } from 'react';
import { useSelector } from 'react-redux';

import { Alert, Box, Button, TextField } from '@mui/material';

import { camelToSnakeCaseObject } from '../../../common/helpers/convert-case';
import { isValidText } from '../../../common/helpers/validators/validator-post';
import { useApiPost } from '../../hooks/use-api-fetch';
import { RootState } from '../../stores/store';

import type { PostApi } from '../../../common/types/post';
import type { Result } from '../../../common/types/result';

type Props = {
  /** 投稿が完了した後に呼ばれる関数 */
  onAfterSubmit?: () => void;
}

type FormData = { text: string };

/** Post Form Component */
export const PostFormComponent: FC<Props> = ({ onAfterSubmit }) => {
  const [formData, setFormData] = useState<FormData>({ text: '' });
  const [errorMessage, setErrorMessage] = useState<string>(null);
  const userState = useSelector((state: RootState) => state.user);
  const apiPost = useApiPost();
  
  /** On Change */
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((previousFormData) => ({ ...previousFormData, [name]: value }));
  };
  
  /** On Submit */
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    
    const userId = userState.id;
    const text   = formData.text;
    
    // 入力チェック
    const validationText = isValidText(text);
    if(validationText.error != null) return setErrorMessage(validationText.error);
    
    const newPostApi: PostApi = camelToSnakeCaseObject({ userId, text });
    try {
      const response = await apiPost(`/users/${userId}/posts`, newPostApi);  // Throws
      
      if(!response.ok) {
        const responseResult: Result<null> = await response.json();  // Throws
        return setErrorMessage(responseResult.error);
      }
      
      // 投稿成功
      setFormData({ text: '' });
      onAfterSubmit();
    }
    catch(error) {
      setErrorMessage('投稿処理に失敗しました。もう一度やり直してください');
      console.error('投稿処理に失敗しました', error);
    }
  };
  
  return (
    <>
      {errorMessage != null && <Alert severity="error" sx={{ my: 3 }}>{errorMessage}</Alert>}
      
      <Box component="form" onSubmit={onSubmit}>
        <TextField
          multiline name="text" label="Text" value={formData.text} onChange={onChange}
          required
          fullWidth rows={4} margin="normal"
        />
        <Button
          type="submit" variant="contained"
          fullWidth sx={{ my: 2 }}
        >
          Post
        </Button>
      </Box>
    </>
  );
};
