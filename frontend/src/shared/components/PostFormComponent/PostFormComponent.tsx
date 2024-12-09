import { ChangeEvent, FC, FormEvent, useState } from 'react';
import { useSelector } from 'react-redux';

import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import { Alert, Box, Button, IconButton, Modal, TextField, Typography } from '@mui/material';

import { camelToSnakeCaseObject } from '../../../common/helpers/convert-case';
import { isValidText } from '../../../common/helpers/validators/validator-post';
import { modalStyle } from '../../constants/modal-style';
import { useApiPost } from '../../hooks/use-api-fetch';

import type { RootState } from '../../stores/store';

import type { PostApi } from '../../../common/types/post';
import type { Result } from '../../../common/types/result';
type Props = {
  /** 投稿が完了した後に呼ばれる関数 */
  onAfterSubmit?: () => void;
}

type FormData = { text: string };

/** Post Form Component */
export const PostFormComponent: FC<Props> = ({ onAfterSubmit }) => {
  const apiPost = useApiPost();
  const userState = useSelector((state: RootState) => state.user);
  
  const [formData, setFormData] = useState<FormData>({ text: '' });
  const [errorMessage, setErrorMessage] = useState<string>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  /** On Change */
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(previousFormData => ({ ...previousFormData, [name]: value }));
  };
  
  /** On Submit */
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
  
  /** Ctrl + Enter or Cmd + Enter で投稿できるようにする */
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      onSubmit(event as unknown as FormEvent<HTMLFormElement>);
      return;
    }
  };
  
  return <>
    {errorMessage != null && <Alert severity="error" sx={{ mt: 3 }}>{errorMessage}</Alert>}
    
    <Box component="form" onSubmit={onSubmit} sx={{ mt: 3 }}>
      <Box component="div" sx={{ textAlign: 'right' }}>
        <IconButton sx={{ mr: 3 }} onClick={() => setIsModalOpen(true)}><HelpOutlineOutlinedIcon /></IconButton>
        <Button type="submit" variant="contained">投稿</Button>
      </Box>
      <TextField
        multiline name="text" label="投稿" value={formData.text} onChange={onChange} onKeyDown={onKeyDown}
        required
        fullWidth rows={4} margin="normal"
      />
    </Box>
    
    <Modal open={isModalOpen}>
      <Box component="div" sx={modalStyle}>
        <Typography component="h2" variant="h5">投稿で使える機能</Typography>
        <Box component="div" sx={{ mt: 3, maxHeight: '47vh', overflowY: 'auto' }}>
          <Typography component="p">以下の HTML タグが利用できます :</Typography>
          <ul style={{ margin: '1rem 0 0', paddingLeft: '1.25rem' }} className="font-parser-component">
            <li>font :
              <ul style={{ margin: '0', paddingLeft: '1rem' }}>
                <li>size … 1 ～ 7・-4 ～ +4</li>
                <li>color</li>
                <li>face</li>
              </ul>
            </li>
            <li>marquee : direction・scrollamout</li>
            <li>blink … <span style={{ animation: 'blink-animation 1.5s step-start infinite' }}>Example</span></li>
            <li><b>b</b>・<i>i</i>・<s>s</s>・<del>del</del>・<ins>ins</ins></li>
            <li><em>em</em>・<strong>strong</strong>・<mark>mark</mark></li>
            <li><code>code</code>・<var>var</var>・<samp>samp</samp>・<kbd>kbd</kbd></li>
          </ul>
        </Box>
        <Box component="div" sx={{ mt: 3, textAlign: 'right' }}>
          <Button variant="contained" color="primary" onClick={() => setIsModalOpen(false)}>OK</Button>
        </Box>
      </Box>
    </Modal>
  </>;
};
