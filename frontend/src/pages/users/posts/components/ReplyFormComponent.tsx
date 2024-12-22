import { ChangeEvent, FC, FormEvent, useState } from 'react';
import { useSelector } from 'react-redux';

import { Alert, Box, Button, Grid2, TextField } from '@mui/material';

import { topicsConstants } from '../../../../common/constants/topics-constants';
import { camelToSnakeCaseObject } from '../../../../common/helpers/convert-case';
import { isValidText } from '../../../../common/helpers/validators/validator-post';
import { FontParserComponent } from '../../../../shared/components/FontParserComponent/FontParserComponent';
import { useApiPost } from '../../../../shared/hooks/use-api-fetch';

import type { RootState } from '../../../../shared/stores/store';
import type { PostApi } from '../../../../common/types/post';
import type { Result } from '../../../../common/types/result';

type Props = {
  inReplyToPostId: string,
  inReplyToUserId: string,
  onAfterReply   : () => void
};

type FormData = {
  text: string,
};

/** Reply Form Component */
export const ReplyFormComponent: FC<Props> = ({ inReplyToPostId, inReplyToUserId, onAfterReply }) => {
  const apiPost = useApiPost();
  const userState = useSelector((state: RootState) => state.user);
  
  const [formData, setFormData] = useState<FormData>({ text: '' });
  const [errorMessage, setErrorMessage] = useState<string>(null);
  
  /** On Change */
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(previousFormData => ({ ...previousFormData, [name]: value }));
  };
  
  /** Ctrl + Enter or Cmd + Enter で投稿できるようにする */
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if((event.ctrlKey || event.metaKey) && event.key === 'Enter') onSubmit(event as unknown as FormEvent<HTMLFormElement>);
  };
  
  /** On Submit */
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    
    const userId  = userState.id;
    const text    = formData.text.trim();
    const topicId = topicsConstants.normal.id;
    
    // 基本的な入力チェック
    const validationText = isValidText(text);
    if(validationText.error != null) return setErrorMessage(validationText.error);
    
    const newPostApi: PostApi = camelToSnakeCaseObject({ userId, text, topicId, inReplyToPostId, inReplyToUserId });
    try {
      const response = await apiPost(`/users/${inReplyToUserId}/posts/${inReplyToPostId}/replies`, newPostApi);  // Throws
      
      if(!response.ok) {
        const responseResult: Result<null> = await response.json();  // Throws
        return setErrorMessage(responseResult.error);
      }
      
      // 投稿成功
      setFormData({ text: '' });
      onAfterReply();
    }
    catch(error) {
      setErrorMessage('リプライ処理に失敗しました。もう一度やり直してください');
      console.error('リプライ処理に失敗', error);
    }
  };
  
  return <>
    {errorMessage != null && <Alert severity="error" sx={{ mt: 3 }}>{errorMessage}</Alert>}
    
    <Box component="form" onSubmit={onSubmit} sx={{ mt: 3 }}>
      <Grid2 container>
        <Grid2 size="grow" sx={{ textAlign: 'right' }}>
          <Button type="submit" variant="contained">リプする</Button>
        </Grid2>
      </Grid2>
      <TextField
        name="text" label="リプライ" value={formData.text} onChange={onChange} onKeyDown={onKeyDown}
        required multiline
        fullWidth rows={4} margin="normal"
      />
    </Box>
    
    {formData.text !== '' &&  // プレビュー
      <Box component="div" sx={{ mt: 2, p: 1, border: '1px solid', borderColor: 'grey.600', borderRadius: 1, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
        <FontParserComponent input={formData.text} />
      </Box>
    }
  </>;
};
