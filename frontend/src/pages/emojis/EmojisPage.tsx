import { ChangeEvent, FC, Fragment, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { Alert, Box, Button, Divider, Grid2, List, ListItem, ListItemText, TextField, Typography } from '@mui/material';

import { emojisConstants } from '../../common/constants/emojis-constants';
import { snakeToCamelCaseObject } from '../../common/helpers/convert-case';
import { isEmptyString } from '../../common/helpers/is-empty-string';
import { LoadingSpinnerComponent } from '../../shared/components/LoadingSpinnerComponent/LoadingSpinnerComponent';
import { VisuallyHiddenInputComponent } from '../../shared/components/VisuallyHiddenInputComponent/VisuallyHiddenInputComponent';
import { emojiConstants } from '../../shared/constants/emoji-constants';
import { useApiGet } from '../../shared/hooks/use-api-fetch';

import type { Result } from '../../common/types/result';
import type { RootState } from '../../shared/stores/store';
import type { Emoji } from '../../common/types/emoji';

type FormData = {
  name: string
};

/** Emojis Page */
export const EmojisPage: FC = () => {
  const userState = useSelector((state: RootState) => state.user);
  const apiGet = useApiGet();
  
  const [selectedFile, setSelectedFile] = useState<File>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  
  const [formData, setFormData] = useState<FormData>({ name: '' });
  const [formErrors, setFormErrors] = useState<{ name?: string }>({});
  const [formErrorMessage, setFormErrorMessage] = useState<string>(null);
  const [formSucceededMessage, setFormSucceededMessage] = useState<string>(null);
  
  const [emojis, setEmojis] = useState<Array<Emoji>>(null);
  const [listErrorMessage, setListErrorMessage] = useState<string>(null);
  
  // 絵文字リアクション一覧を取得する
  const onLoadEmojis = useCallback(async () => {
    setEmojis(null);
    try {
      const response = await apiGet('/emojis');  // Throws
      const emojisApiResult = await response.json();  // Throws
      setEmojis(emojisApiResult.result.map(emojiApi => snakeToCamelCaseObject(emojiApi)));
    }
    catch(error) {
      setEmojis(null);
      setListErrorMessage('絵文字リアクション一覧の取得に失敗');
      console.error('絵文字リアクション一覧の取得に失敗', error);
    }
  }, [apiGet]);
  
  // 初回読込
  useEffect(() => {
    onLoadEmojis();
  }, [onLoadEmojis]);
  
  /** ファイル選択 */
  const onChangeFile = (event: ChangeEvent<HTMLInputElement>) => {
    setFormErrorMessage(null);
    setFormSucceededMessage(null);
    const file = event.target.files?.[0];
    if(file == null) return console.warn('ファイルを選択せずにダイアログを閉じた', event);
    if(file.size > (emojisConstants.maxFileSizeKb * 1024)) return setFormErrorMessage(`ファイルサイズが ${emojisConstants.maxFileSizeKb} KB を超えています`);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));  // プレビュー用の URL を作成する
  };
  
  /** フォームの値保持 */
  const onChangeText = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(previousFormData => ({ ...previousFormData, [name]: value }));
  };
  
  /** フォームの入力チェック */
  const isValidForm = (name: string): boolean => {
    const validateEmojiReactionName = (name: string): Result<boolean> => {
      if(isEmptyString(name)) return { error: '絵文字リアクション名を入力してください' };
      if(!(/^[a-z0-9-]+$/).test(name)) return { error: '絵文字リアクション名は英小文字・数字・ハイフンのみ利用可能です' };
      return { result: true };
    };
    const newErrors: { name: string } = { name: validateEmojiReactionName(name).error };
    setFormErrors(newErrors);
    return Object.values(newErrors).every(newError => newError == null);
  };
  
  /** ファイルアップロード */
  const onUploadFile = async () => {
    setFormErrorMessage(null);
    setFormSucceededMessage(null);
    
    // 入力チェック
    if(selectedFile == null) return setFormErrorMessage('ファイルを選択してください');
    const name = formData.name.trim();
    if(!isValidForm(name)) return;
    
    const postFormData = new FormData();
    postFormData.append('file', selectedFile);
    postFormData.append('name', name);
    setIsUploading(true);
    try {
      const response = await fetch('/api/emojis', {
        method: 'POST',
        headers: { Authorization: `Bearer ${userState.token}` },
        body: postFormData
      });
      const result: Result<string> = await response.json();
      if(result.error != null) return setFormErrorMessage(result.error);
      
      setSelectedFile(null);
      setPreviewUrl(null);
      setFormData({ name: '' });
      setFormSucceededMessage('絵文字リアクションが登録できました');
      await onLoadEmojis();  // 再読込
    }
    catch(error) {
      setFormErrorMessage('絵文字リアクション登録中にエラーが発生しました。もう一度やり直してください');
      console.error('絵文字リアクション登録中にエラーが発生', error);
    }
    finally {
      setIsUploading(false);
    }
  };
  
  return <>
    <Typography component="h1" variant="h4" sx={{ mt: 3 }}>絵文字リアクション管理</Typography>
    
    <Typography component="h2" variant="h5" sx={{ mt: 3 }}>登録</Typography>
    
    <Grid2 container spacing={1} sx={{ mt: 3 }}>
      <Grid2 size="grow">
        {previewUrl != null && <img src={previewUrl} style={{ width: 'auto', minWidth: '64px', height: '64px' }} />}
      </Grid2>
      <Grid2>
        <Button component="label" variant="contained" tabIndex={-1}>
          画像を選択
          <VisuallyHiddenInputComponent type="file" accept="image/*" onChange={onChangeFile} />
        </Button>
      </Grid2>
    </Grid2>
    {selectedFile != null && <Typography component="p" sx={{ mt: 1 }}>選択されたファイル : {selectedFile.name}</Typography>}
    <TextField
      type="text" name="name" label="絵文字リアクション名" value={formData.name} onChange={onChangeText}
      required
      fullWidth margin="normal"
      error={formErrors.name != null} helperText={formErrors.name}
    />
    
    {formErrorMessage != null && <Alert severity="error" sx={{ mt: 3 }}>{formErrorMessage}</Alert>}
    {formSucceededMessage != null && <Alert severity="success" sx={{ mt: 3 }}>{formSucceededMessage}</Alert>}
    
    <Box component="div" sx={{ mt: 3, textAlign: 'right' }}>
      <Button variant="contained" color="primary" onClick={onUploadFile} disabled={selectedFile == null || isUploading}>アップロード</Button>
    </Box>
    
    <Typography component="h2" variant="h5" sx={{ mt: 3 }}>一覧</Typography>
    
    {emojis == null && listErrorMessage == null && <LoadingSpinnerComponent />}
    {emojis == null && listErrorMessage != null && <Alert severity="error" sx={{ mt: 3 }}>{listErrorMessage}</Alert>}
    {emojis != null && emojis.length === 0 && <Typography component="p" sx={{ mt: 3 }}>絵文字リアクション一覧はありません</Typography>}
    
    {emojis != null && emojis.length > 0 && <List sx={{ mt: 3 }}>
      <Divider component="li" />
      {emojis.map(emoji => <Fragment key={emoji.id}>
        <ListItem sx={{ px: 0 }}>
          <ListItemText
            primary={
              <Grid2 container spacing={1} sx={{ alignItems: 'center' }}>
                <Grid2 size={8}>
                  <img src={`${emojiConstants.ossUrl}${emoji.imageUrl}`} height="32" alt={`:${emoji.name}:`} title={`:${emoji.name}:`} />
                </Grid2>
                <Grid2 size={4}>:{emoji.name}:</Grid2>
              </Grid2>
            }
          />
        </ListItem>
        <Divider component="li" />
      </Fragment>)}
    </List>}
  </>;
};
