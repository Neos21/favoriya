import { ChangeEvent, FC, useEffect, useState } from 'react';

import AttachFileIcon from '@mui/icons-material/AttachFile';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import ImageIcon from '@mui/icons-material/Image';
import { Box, Button, Tooltip } from '@mui/material';

import { commonPostsConstants } from '../../../../../common/constants/posts-constants';
import { VisuallyHiddenInputComponent } from '../../../VisuallyHiddenInputComponent/VisuallyHiddenInputComponent';

type Props = {
  setFormData    : (previousFormData: any) => void,  // eslint-disable-line @typescript-eslint/no-explicit-any
  setErrorMessage: (errorMessage: string) => void,
  reloadTrigger  : boolean  // boolean の変化自体でリロードがかかる
};

/** Post Form Attachment Component */
export const PostFormAttachmentComponent: FC<Props> = ({ setFormData, setErrorMessage, reloadTrigger }) => {
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>(null);
  const [isHeicImage, setIsHeicImage] = useState<boolean>(false);
  const [isAudio, setIsAudio] = useState<boolean>(false);
  
  // Submit 後にリセットする
  useEffect(() => {
    setIsAudio(false);
    setIsHeicImage(false);
    setImagePreviewUrl(null);
  }, [reloadTrigger]);
  
  /** ファイル選択 */
  const onChangeFile = (event: ChangeEvent<HTMLInputElement>) => {
    setIsAudio(false);
    setIsHeicImage(false);
    setImagePreviewUrl(null);
    setErrorMessage(null);
    setFormData(previousFormData => ({ ...previousFormData, file: null }));
    
    const file = event.target.files?.[0];
    if(file == null) return console.warn('ファイルを選択せずにダイアログを閉じた', event);
    if(file.size > (commonPostsConstants.maxFileSizeKb * 1024)) return setErrorMessage(`ファイルサイズが ${commonPostsConstants.maxFileSizeMb} MB を超えています`);
    
    setFormData(previousFormData => ({ ...previousFormData, file }));
    if(file.type.startsWith('image/')) {
      setImagePreviewUrl(URL.createObjectURL(file));  // プレビュー用の URL を作成する
    }
    else if(['.heic', 'heif'].some(extName => file.name.toLocaleLowerCase().endsWith(extName))) {
      setIsHeicImage(true);
    }
    else if(file.type.startsWith('audio/')) {
      setIsAudio(true);
    }
    else {
      setErrorMessage(`不正なファイル形式です : [${file.name}] [${file.type}]`);
    }
  };
  
  return <Box component="div">
    {imagePreviewUrl != null && <Box component="div"><img src={imagePreviewUrl} style={{ width: '64px', height: '64px', objectFit: 'cover' }} /></Box>}
    {isHeicImage             && <Box component="div"><ImageIcon     sx={{ color: 'grey.500', width: '64px', height: '64px' }} /></Box>}
    {isAudio                 && <Box component="div"><AudioFileIcon sx={{ color: 'grey.500', width: '64px', height: '64px' }} /></Box>}
    
    <Tooltip title="画像・音声を添付">
      <Button component="label" variant="outlined" tabIndex={-1} startIcon={<AttachFileIcon />} sx={{ color: 'grey.500', borderColor: 'grey.500', minWidth: 'auto', px: 1, '& .MuiButton-startIcon': { m: 0 } }}>
        <VisuallyHiddenInputComponent type="file" accept="image/*,.heic,.heif,audio/*" onChange={onChangeFile} />
      </Button>
    </Tooltip>
  </Box>;
};
