import { ChangeEvent, FC, useState } from 'react';

import { Alert, Box, Button, Grid2, TextField, Typography } from '@mui/material';

import { isEmptyString } from '../../../common/helpers/is-empty-string';
import { FontParserComponent } from '../../../shared/components/FontParserComponent/FontParserComponent';
import { useApiGet, useApiPost } from '../../../shared/hooks/use-api-fetch';

import type { Result } from '../../../common/types/result';
type FormData = {
  text         : string,
  generatedText: string,
  numberOfPosts: number
};

/** Shumai Page */
export const ShumaiPage: FC = () => {
  const apiGet = useApiGet();
  const apiPost = useApiPost();
  
  const [formData, setFormData] = useState<FormData>({ text: '', generatedText: '', numberOfPosts: 5 });
  const [errorMessage, setErrorMessage] = useState<string>(null);
  const [succeededMessage, setSucceededMessage] = useState<string>(null);
  
  /** ランダムに投稿文を取得する */
  const onLoadTexts = async () => {
    setErrorMessage(null);
    setSucceededMessage(null);
    try {
      if(!Number.isInteger(Number(formData.numberOfPosts))) return setErrorMessage('整数を入力してください');
      
      const response = await apiGet('/admin/shumai/get-random-posts', `?number_of_posts=${formData.numberOfPosts}`);  // Throws
      const textsResult: Result<Array<string>> = await response.json();  // Throws
      setFormData(previousFormData => ({
        ...previousFormData,
        text: (previousFormData.text + '\n' + textsResult.result.join('\n')).trim()
      }));
    }
    catch(error) {
      setErrorMessage('ランダムな投稿文の取得に失敗');
      console.error('ランダムな投稿文の取得に失敗', error);
    }
  };
  
  /** フォームの値保持 */
  const onChangeText = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(previousFormData => ({ ...previousFormData, [name]: value }));
  };
  
  /** 投稿文を生成する */
  const onGenerate = async () => {
    setErrorMessage(null);
    setSucceededMessage(null);
    
    // 入力チェック
    if(isEmptyString(formData.text.trim())) return setErrorMessage('元となるテキストを用意してください');
    
    try {
      const response = await apiPost('/admin/shumai/generate', { text: formData.text.trim() });
      const result: Result<string> = await response.json();
      if(result.error != null) return setErrorMessage(result.error);
      
      setFormData(previousFormData => ({ ...previousFormData, generatedText: result.result }));
    }
    catch(error) {
      setErrorMessage('生成処理中にエラーが発生しました。もう一度やり直してください');
      console.error('生成処理中にエラーが発生', error);
    }
  };
  
  /** フォームの Submit 処理 */
  const onSubmit = async () => {
    setErrorMessage(null);
    setSucceededMessage(null);
    
    // 入力チェック
    if(isEmptyString(formData.generatedText)) return setErrorMessage('投稿するテキストを用意してください');
    
    try {
      const response = await apiPost('/admin/shumai/post', { text: formData.generatedText.trim() });
      const result: Result<boolean> = await response.json();
      if(result.error != null) return setErrorMessage(result.error);
      
      setFormData(previousFormData => ({ ...previousFormData, text: '', generatedText: '' }));
      setSucceededMessage('投稿が完了しました');
    }
    catch(error) {
      setErrorMessage('投稿処理中にエラーが発生しました。もう一度やり直してください');
      console.error('投稿処理中にエラーが発生', error);
    }
  };
  
  return <>
    <Typography component="h1" sx={{ mt: 3 }}>しゅうまい君</Typography>
    
    <Grid2 container sx={{ mt: 3 }} spacing={1} alignItems="end">
      <Grid2 size="grow">
        <TextField name="numberOfPosts" label="取得件数" value={formData.numberOfPosts} onChange={onChangeText} fullWidth margin="normal" size="small" sx={{ mb: 0 }} />
      </Grid2>
      <Grid2>
        <Button variant="contained" color="primary" onClick={onLoadTexts}>取得する</Button>
      </Grid2>
    </Grid2>
    
    <Box component="div" sx={{ mt: 3 }}>
      <TextField multiline name="text" label="テキスト" value={formData.text} onChange={onChangeText} fullWidth rows={10} margin="normal"
      />
    </Box>
    
    <Box component="div" sx={{ mt: 3, textAlign: 'right' }}>
      <Button variant="contained" color="primary" onClick={onGenerate}>生成する</Button>
    </Box>
    
    <Box component="div" sx={{ mt: 3 }}>
      <TextField
        multiline name="generatedText" label="生成文" value={formData.generatedText} onChange={onChangeText}
        fullWidth rows={4} margin="normal"
      />
    </Box>
    
    {formData.generatedText !== '' &&  // プレビュー
      <Box component="div" sx={{ mt: 2, p: 1, border: '1px solid', borderColor: 'grey.600', borderRadius: 1, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
        <FontParserComponent input={formData.generatedText} />
      </Box>
    }
    
    <Box component="div" sx={{ mt: 3, textAlign: 'right' }}>
      <Button variant="contained" color="primary" onClick={onSubmit}>投稿する</Button>
    </Box>
    
    {errorMessage != null && <Alert severity="error" sx={{ mt: 3 }}>{errorMessage}</Alert>}
    {succeededMessage != null && <Alert severity="success" sx={{ mt: 3 }}>{succeededMessage}</Alert>}
  </>;
};
