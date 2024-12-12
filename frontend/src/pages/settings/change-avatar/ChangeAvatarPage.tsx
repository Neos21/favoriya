import { ChangeEvent, FC, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import styled from '@emotion/styled';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Alert, Avatar, Box, Button, Divider, Grid2, Typography } from '@mui/material';

import { commonUserConstants } from '../../../common/constants/user-constants';
import { isEmptyString } from '../../../common/helpers/is-empty-string';
import { userConstants } from '../../../shared/constants/user-constants';
import { useApiDelete } from '../../../shared/hooks/use-api-fetch';
import { setUser } from '../../../shared/stores/user-slice';

import type { RootState } from '../../../shared/stores/store';
import type { Result } from '../../../common/types/result';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1
});

/** Change Avatar Page */
export const ChangeAvatarPage: FC = () => {
  const dispatch = useDispatch();
  const userState = useSelector((state: RootState) => state.user);
  const apiDelete = useApiDelete();
  
  const [selectedFile, setSelectedFile] = useState<File>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>(null);
  const [succeededMessage, setSucceededMessage] = useState<string>(null);
  
  /** ファイル選択 */
  const onChangeFile = (event: ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setSucceededMessage(null);
    const file = event.target.files?.[0];
    if(file == null) return console.warn('ファイルを選択せずにダイアログを閉じた', event);
    if(file.size > commonUserConstants.avatarMaxFileSizeKb) return setErrorMessage('ファイルサイズが 500KB を超えています');
    
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));  // プレビュー用の URL を作成する
  };
  
  /** ファイルアップロード */
  const onUploadFile = async () => {
    setErrorMessage(null);
    setSucceededMessage(null);
    if(selectedFile == null) return setErrorMessage('ファイルを選択してください');
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    setIsUploading(true);
    try {
      const response = await fetch(`/api/users/${userState.id}/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userState.token}` },
        body: formData
      });
      const newAvatarUrlResult: Result<string> = await response.json();
      if(newAvatarUrlResult.error != null) return setErrorMessage(newAvatarUrlResult.error);
      
      // Store・LocalStorage を更新する
      const newUserState = Object.assign({}, userState);
      newUserState.avatarUrl = newAvatarUrlResult.result;
      dispatch(setUser(newUserState));
      localStorage.setItem(userConstants.localStorageKey, JSON.stringify(newUserState));
      
      setSelectedFile(null);
      setPreviewUrl(null);
      setSucceededMessage('アバター画像が変更できました');
    }
    catch(error) {
      setErrorMessage('画像アップロード中にエラーが発生しました。もう一度やり直してください');
      console.error('画像アップロード中にエラーが発生', error);
    }
    finally {
      setIsUploading(false);
    }
  };
  
  /** フォームリセット */
  const onResetFile = () => {
    setErrorMessage(null);
    setSucceededMessage(null);
    
    setSelectedFile(null);
    setPreviewUrl(null);
  };
  
  /** ファイル削除 */
  const onRemoveFile = async () => {
    setErrorMessage(null);
    setSucceededMessage(null);
    try {
      const response = await apiDelete(`/users/${userState.id}/avatar`);
      if(!response.ok) return setErrorMessage('画像ファイルの削除に失敗しました。もう一度やり直してください');
      
      // Store・LocalStorage を更新する
      const newUserState = Object.assign({}, userState);
      newUserState.avatarUrl = '';
      dispatch(setUser(newUserState));
      localStorage.setItem(userConstants.localStorageKey, JSON.stringify(newUserState));
      
      setSucceededMessage('画像ファイルを削除しました');
      setSelectedFile(null);
      setPreviewUrl(null);
    }
    catch(error) {
      setErrorMessage('画像ファイルの削除処理に失敗しました。もう一度やり直してください');
      console.error('画像ファイルの削除処理に失敗', error);
    }
  };
  
  return <>
    <Typography component="h1" variant="h4" sx={{ mt: 3 }}>アバター変更</Typography>
    
    <Typography component="p" sx={{ mt: 3 }}>
      <Button component={Link} to="/settings" variant="contained">戻る</Button>
    </Typography>
    
    <Divider sx={{ mt: 4 }} />
    
    <Avatar
      src={previewUrl ?? (isEmptyString(userState.avatarUrl) ? '' : `${userConstants.ossUrl}${userState.avatarUrl}`)}
      sx={{ mt: 3, width: commonUserConstants.avatarMaxImageSizePx, height: commonUserConstants.avatarMaxImageSizePx }}
    />
    
    <Typography component="p" sx={{ mt: 3 }}>
      <Button component="label" variant="contained" tabIndex={-1} startIcon={<CloudUploadIcon />}>
        画像を選択
        <VisuallyHiddenInput type="file" accept="image/*" onChange={onChangeFile} />
      </Button>
    </Typography>
    
    {selectedFile != null && (
      <Typography component="p" sx={{ mt: 3 }}>
        選択されたファイル : {selectedFile.name}
      </Typography>
    )}
    
    {errorMessage != null && <Alert severity="error" sx={{ mt: 3 }}>{errorMessage}</Alert>}
    
    {succeededMessage != null && <Alert severity="success" sx={{ mt: 3 }}>{succeededMessage}</Alert>}
    
    <Grid2 container spacing={3} sx={{ mt: 3 }}>
      <Grid2 size={6}>
        <Button variant="contained" color="primary"
          onClick={onUploadFile}
          disabled={selectedFile == null || errorMessage != null || isUploading}
        >
          アップロード
        </Button>
      </Grid2>
      <Grid2 size={6} sx={{ textAlign: 'right' }}>
        <Button variant="contained" color="primary"
          onClick={onResetFile}
          disabled={isUploading}
        >
          リセット
        </Button>
      </Grid2>
    </Grid2>
    
    <Divider sx={{ mt: 4 }} />
    
    <Box component="div" sx={{ mt: 3, textAlign: 'right' }}>
      <Button variant="contained" color="error" onClick={onRemoveFile} disabled={isUploading}>画像を削除</Button>
    </Box>
  </>;
};
