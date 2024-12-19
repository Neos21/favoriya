import { ChangeEvent, FC, FormEvent, useEffect, useState } from 'react';

import { Alert, Box, Button, TextField, Typography } from '@mui/material';

import { snakeToCamelCaseObject } from '../../../../../common/helpers/convert-case';
import { isValidIntroductionText } from '../../../../../common/helpers/validators/validator-introduction';
import { httpStatusConstants } from '../../../../../shared/constants/http-status-constants';
import { useApiGet, useApiPut } from '../../../../../shared/hooks/use-api-fetch';

import type { Result } from '../../../../../common/types/result';
import type { Introduction, IntroductionApi } from '../../../../../common/types/introduction';

type Props = {
  recipientUserId: string,
  actorUserId: string
};

type FormData = {
  text: string
};

/** Introduction Form Component */
export const IntroductionFormComponent: FC<Props> = ({ recipientUserId, actorUserId }) => {
  const apiGet = useApiGet();
  const apiPut = useApiPut();
  
  const [formData, setFormData] = useState<FormData>({ text: '' });
  const [formErrors, setFormErrors] = useState<{ text?: string, }>({});
  const [errorMessage, setErrorMessage] = useState<string>(null);
  const [succeededMessage, setSucceededMessage] = useState<string>(null);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  
  // 初回読み込み
  useEffect(() => {
    (async () => {
      try {
        // 相互フォロー状態なら投稿欄に紹介文を復元する (未記入の場合は 404 になる)
        const introductionResponse = await apiGet(`/users/${recipientUserId}/introductions/${actorUserId}`);  // Throws
        if(introductionResponse.status !== httpStatusConstants.ok) return console.warn('紹介文取得できず・未記入扱いとする', introductionResponse.status);  // 取得できなかった場合は未記入・何もしない
        
        const introductionResult: Result<IntroductionApi> = await introductionResponse.json();  // Throws
        const introduction: Introduction = snakeToCamelCaseObject(introductionResult.result) as Introduction;
        setFormData({ text: introduction.text ?? '' });
        setIsApproved(introduction.isApproved ?? false);
      }
      catch(error) {
        return console.error('紹介文の取得に失敗', error);
      }
    })();
  }, [actorUserId, apiGet, recipientUserId]);
  
  /** フォームの値保持 */
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(previousFormData => ({ ...previousFormData, [name]: value }));
  };
  
  /** フォームの入力チェック */
  const isValidForm = (text: string): boolean => {
    const newErrors: { text: string } = {
      text: isValidIntroductionText(text).error
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
    if(!isValidForm(formData.text)) return;
    
    try {
      const response = await apiPut(`/users/${recipientUserId}/introductions/${actorUserId}`, { text: formData.text });  // Throws
      const introductionApiResult: Result<IntroductionApi> = await response.json();  // Throws
      if(introductionApiResult.error != null) return setErrorMessage(introductionApiResult.error);
      
      setIsApproved(false);  // 未承認状態に戻す
      setSucceededMessage('紹介文を投稿しました。紹介文は被紹介者本人の承認後、一般公開されるようになります');  // 成功時のメッセージを表示する
    }
    catch(error) {
      setErrorMessage('紹介文の投稿処理に失敗しました。もう一度やり直してください');
      console.error('紹介文の投稿処理に失敗', error);
    }
  };
  
  return <>
    <Typography component="h2" variant="h5" sx={{ mt: 3 }}>紹介文を書く</Typography>
    
    {errorMessage != null && <Alert severity="error" sx={{ mt: 3 }}>{errorMessage}</Alert>}
    
    {succeededMessage != null && <Alert severity="success" sx={{ mt: 3 }}>{succeededMessage}</Alert>}
    
    {isApproved &&
      <Alert severity="info" sx={{ mt: 3 }}>
        現在この投稿は承認済みです。編集を行うと一旦未承認の状態に戻ります。
      </Alert>
    }
    
    <Box component="form" onSubmit={onSubmit} sx={{ mt: 3 }}>
      <TextField
        multiline name="text" label="紹介文" value={formData.text} onChange={onChange}
        fullWidth rows={4} margin="normal"
        error={formErrors.text != null}
        helperText={formErrors.text}
      />
      <Box component="div" sx={{ mt: 4, textAlign: 'right' }}>
        <Button type="submit" variant="contained">投稿</Button>
      </Box>
    </Box>
  </>;
};
