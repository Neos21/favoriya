import { ChangeEvent, FC, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';

import { Alert, Box, Button, TextField, Typography } from '@mui/material';

import { useApiGet, useApiPost } from '../../../shared/hooks/use-api-fetch';

import type { Result } from '../../../common/types/result';
import type { RootState } from '../../../shared/stores/store';
import { FontParserComponent } from '../../../shared/components/FontParserComponent/FontParserComponent';
import { isValidText } from '../../../common/helpers/validators/validator-post';

type FormData = {
  text: string
};

/** Shumai Page */
export const ShumaiPage: FC = () => {
  const userState = useSelector((state: RootState) => state.user);
  const apiGet = useApiGet();
  const apiPost = useApiPost();
  
  const [formData, setFormData] = useState<FormData>({ text: '' });
  const [formErrors, setFormErrors] = useState<{ text?: string }>({});
  const [errorMessage, setErrorMessage] = useState<string>(null);
  const [succeededMessage, setSucceededMessage] = useState<string>(null);
  
  // ランダムに投稿文を取得する
  const onLoadTexts = useCallback(async () => {
    try {
      const response = await apiGet('/admin/shumai/get-random-texts', '?number-of-texts=10');  // Throws
      const textsResult = await response.json();  // Throws
      setFormData(previousFormData => ({
        ...previousFormData,
        text: previousFormData.text + '\n' + textsResult.result
      }));
    }
    catch(error) {
      setErrorMessage('ランダムな投稿文の取得に失敗');
      console.error('ランダムな投稿文の取得に失敗', error);
    }
  }, [apiGet]);
  
  /** フォームの値保持 */
  const onChangeText = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(previousFormData => ({ ...previousFormData, [name]: value }));
  };
  
  /** フォームの入力チェック */
  const isValidForm = (text: string): boolean => {
    const newErrors: { text: string } = {
      text: isValidText(text).error
    };
    setFormErrors(newErrors);
    return Object.values(newErrors).every(newError => newError == null);
  };
  
  /** フォームの Submit 処理 */
  const onSubmit = async () => {
    setErrorMessage(null);
    setSucceededMessage(null);
    
    // 入力チェック
    if(!isValidForm(formData.text)) return;
    
    try {
      const response = await apiPost('/')
      const newAvatarUrlResult: Result<string> = await response.json();
      if(newAvatarUrlResult.error != null) return setErrorMessage(newAvatarUrlResult.error);
      
      setSelectedFile(null);
      setPreviewUrl(null);
      setFormData({ name: '' });
      setSucceededMessage('絵文字リアクションが登録できました');
      await onLoadTexts();  // 再読込
    }
    catch(error) {
      setErrorMessage('画像アップロード中にエラーが発生しました。もう一度やり直してください');
      console.error('画像アップロード中にエラーが発生', error);
    }
    finally {
      setIsUploading(false);
    }
  };
  
  return <>
    <Typography component="h1" variant="h4" sx={{ mt: 3 }}>しゅうまい君</Typography>
    
    <TextField
      multiline name="text" label="テキスト" value={formData.text} onChange={onChangeText}
      fullWidth rows={4} margin="normal"
      error={formErrors.text != null}
      helperText={formErrors.text}
    />
    
    {formData.text !== '' &&  // プレビュー
      <Box component="div" sx={{ mt: 2, p: 1, border: '1px solid', borderColor: 'grey.600', borderRadius: 1, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
        <FontParserComponent input={formData.text} />
      </Box>
    }
    
    {errorMessage != null && <Alert severity="error" sx={{ mt: 3 }}>{errorMessage}</Alert>}
    {succeededMessage != null && <Alert severity="success" sx={{ mt: 3 }}>{succeededMessage}</Alert>}
    
    <Box component="div" sx={{ mt: 3, textAlign: 'right' }}>
      <Button variant="contained" color="primary" onClick={onUploadFile}>投稿する</Button>
    </Box>
  </>;
};
