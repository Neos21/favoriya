import DOMPurify from 'dompurify';
import { ChangeEvent, FC, FormEvent, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import { Alert, Box, Button, FormControl, Grid2, IconButton, InputLabel, MenuItem, Modal, Select, Stack, TextField, Tooltip, Typography } from '@mui/material';

import { topicsConstants } from '../../../common/constants/topics-constants';
import { camelToSnakeCaseObject } from '../../../common/helpers/convert-case';
import { isValidText } from '../../../common/helpers/validators/validator-post';
import { modalStyleConstants } from '../../constants/modal-style-constants';
import { useApiPost } from '../../hooks/use-api-fetch';
import { FontParserComponent } from '../FontParserComponent/FontParserComponent';

import type { RootState } from '../../stores/store';

import type { PostApi } from '../../../common/types/post';
import type { Result } from '../../../common/types/result';

type Props = {
  /** 投稿が完了した後に呼ばれる関数 */
  onAfterSubmit?: () => void
}

type FormData = {
  topicId: number,
  text   : string
};

/** Post Form Component */
export const PostFormComponent: FC<Props> = ({ onAfterSubmit }) => {
  const apiPost = useApiPost();
  const userState = useSelector((state: RootState) => state.user);
  
  // トピックをランダムに選択する
  const choiceTopicId = () => {
    const topics = Object.values(topicsConstants);
    return topics[Math.floor(Math.random() * topics.length)].id;
  };
  
  const [formData, setFormData] = useState<FormData>({
    topicId: choiceTopicId(),
    text   : ''
  });
  const [cursorPosition, setCursorPosition] = useState(0);
  const textFieldRef = useRef<HTMLTextAreaElement>(null);
  
  const [errorMessage, setErrorMessage] = useState<string>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  /** On Change */
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(previousFormData => ({ ...previousFormData, [name]: value }));
  };
  
  /** カーソル位置を保持する */
  const onSaveCursorPosition = () => {
    const textarea = textFieldRef.current;
    if(textarea != null) setCursorPosition(textarea.selectionStart ?? 0);
  };
  
  /** On Insert */
  const onInsert = (rawStartTag: string, rawEndTag: string, replacements?: Array<string>) => {
    const textarea = textFieldRef.current;
    if(textarea == null) return;
    
    const beforeText = formData.text.slice(0, cursorPosition);
    const afterText  = formData.text.slice(cursorPosition);
    
    const choiced  = replacements == null ? null        : replacements[Math.floor(Math.random() * replacements.length)];
    const startTag = replacements == null ? rawStartTag : rawStartTag.replace((/★/g), choiced);
    const endTag   = replacements == null ? rawEndTag   : rawEndTag  .replace((/★/g), choiced);
    const newCursorPosition = cursorPosition + startTag.length; // 開始タグの後ろにカーソル位置を設定する
  
    // 新しい値を設定する
    setFormData(previousFormData => ({
      ...previousFormData,
      text: beforeText + startTag + endTag + afterText
    }));
    // カーソル位置を設定する
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
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
    const topicId = formData.topicId;
    
    // 基本的な入力チェック
    const validationText = isValidText(text);
    if(validationText.error != null) return setErrorMessage(validationText.error);
    
    // トピックごとの入力チェック
    const topic = Object.values(topicsConstants).find(topic => topic.id === topicId);
    if(topic == null) return setErrorMessage('不正なトピックです');
    const textContent = DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    const validationResult = topic.validateFunction(textContent);
    if(validationResult.error != null) return setErrorMessage(validationResult.error);
    
    const newPostApi: PostApi = camelToSnakeCaseObject({ userId, text, topicId });
    try {
      const response = await apiPost(`/users/${userId}/posts`, newPostApi);  // Throws
      
      if(!response.ok) {
        const responseResult: Result<null> = await response.json();  // Throws
        return setErrorMessage(responseResult.error);
      }
      
      // 投稿成功
      setFormData({
        topicId: choiceTopicId(),
        text   : ''
      });
      setCursorPosition(0);
      onAfterSubmit();
    }
    catch(error) {
      setErrorMessage('投稿処理に失敗しました。もう一度やり直してください');
      console.error('投稿処理に失敗', error);
    }
  };
  
  return <>
    {errorMessage != null && <Alert severity="error" sx={{ mt: 3 }}>{errorMessage}</Alert>}
    
    {formData.topicId === topicsConstants.englishOnly.id       && <Alert severity="info" sx={{ mt: 3 }}>「英語のみ」モード is English only.</Alert>}
    {formData.topicId === topicsConstants.kanjiOnly.id         && <Alert severity="info" sx={{ mt: 3 }}>「漢字のみ」モード…之・漢字限定、投稿可能。</Alert>}
    {formData.topicId === topicsConstants.senryu.id            && <Alert severity="info" sx={{ mt: 3 }}>「川柳」モードでは改行または全角スペースで文章を区切り、五・七・五の形式にすると投稿できます。</Alert>}
    {formData.topicId === topicsConstants.anonymous.id         && <Alert severity="info" sx={{ mt: 3 }}>「匿名投稿」モードでは「匿名さん」による代理投稿ができます。その代わり投稿の削除ができませんのでご注意ください。</Alert>}
    {formData.topicId === topicsConstants.randomDecorations.id && <Alert severity="info" sx={{ mt: 3 }}>「ランダム装飾」モードでは行ごとに文字装飾を勝手に挿入したり、挿入しなかったりします。結果は投稿してみてのお楽しみ！</Alert>}
    
    <Box component="form" onSubmit={onSubmit} sx={{ mt: 3 }}>
      <Grid2 container>
        <Grid2 size="grow">
          <FormControl fullWidth size="small">
            <InputLabel id="post-form-select-topic">トピック</InputLabel>
            <Select labelId="post-form-select-topic" name="topicId" label="トピック" value={formData.topicId} onChange={onChange}>
              {Object.values(topicsConstants).map(topic => (
                <MenuItem key={topic.id} value={topic.id}>{topic.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid2>
        <Grid2 size="grow" sx={{ placeSelf: 'end', textAlign: 'right' }}>
          <Tooltip title="ヘルプ">
            <IconButton sx={{ mr: 3 }} onClick={() => setIsModalOpen(true)}><HelpOutlineOutlinedIcon /></IconButton>
          </Tooltip>
          <Button type="submit" variant="contained">投稿</Button>
        </Grid2>
      </Grid2>
      <TextField
        name="text" label="投稿" value={formData.text} onChange={onChange} onKeyDown={onKeyDown}
        required multiline
        fullWidth rows={4} margin="normal"
        inputRef={input => { textFieldRef.current = input as HTMLTextAreaElement; }}
        onSelect={onSaveCursorPosition} // フォーカス移動時にカーソル位置を保持する
        onBlur={onSaveCursorPosition}  // フォーカスが外れた時にカーソル位置を保持する
      />
      <Stack direction="row" spacing={1.5} useFlexGap sx={{ mt: 1, flexWrap: 'wrap', ['& button']: { minWidth: 'auto', whiteSpace: 'nowrap' } }}>
        <Button variant="outlined" sx={{ fontFamily: 'serif' }} size="small" color="info" onClick={() => onInsert('<font size="★" face="serif">', '</font>', ['4', '5', '6', '7'])}>明朝</Button>
        <Button variant="outlined" size="small" color="success" onClick={() => onInsert('<em>', '</em>')}>緑</Button>
        <Button variant="outlined" size="small" color="error"   onClick={() => onInsert('<strong>', '</strong>')}>赤</Button>
        <Button variant="outlined" size="small" color="warning" onClick={() => onInsert('<mark>', '</mark>')}>黄</Button>
        <Button variant="outlined" size="small" color="inherit" onClick={() => onInsert('<marquee>', '</marquee>')}>流</Button>
        <Button variant="outlined" size="small" color="inherit" onClick={() => onInsert('<blink>', '</blink>')}>光</Button>
        <Button variant="outlined" size="small" color="inherit" onClick={() => onInsert('<★ align="center">', '</★>', ['h1', 'h2', 'h3', 'h4', 'div'])}>中</Button>
        <Button variant="outlined" size="small" color="inherit" onClick={() => onInsert('<★ align="right">', '</★>' , ['h1', 'h2', 'h3', 'h4', 'div'])}>右</Button>
      </Stack>
    </Box>
    
    {formData.text !== '' &&  // プレビュー
      <Box component="div" sx={{ mt: 2, p: 1, border: '1px solid', borderColor: 'grey.600', borderRadius: 1, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
        <FontParserComponent input={formData.text} />
      </Box>
    }
    
    <Modal open={isModalOpen}>
      <Box component="div" sx={modalStyleConstants}>
        <Typography component="h2" variant="h5">投稿で使える機能</Typography>
        <Box component="div" sx={{ mt: 2, maxHeight: '47vh', overflowY: 'auto' }}>
          <Typography component="p">以下の HTML タグが利用できます :</Typography>
          <ul style={{ margin: '1rem 0 0', paddingLeft: '1.25rem' }} className="font-parser-component">
            <li>font :
              <ul style={{ margin: '0', paddingLeft: '1rem' }}>
                <li>size … 1 ～ 7・-4 ～ +4</li>
                <li>color</li>
                <li>face … serif で明朝体、など</li>
              </ul>
            </li>
            <li>marquee : direction・scrollamout</li>
            <li>blink … <span style={{ animation: 'blink-animation 1.5s step-start infinite' }}>Example</span></li>
            <li>h1～h6・p・div : align</li>
            <li><b>b</b>・<i>i</i>・<u>u</u>・<s>s</s>・<del>del</del>・<ins>ins</ins></li>
            <li><em>em</em>・<strong>strong</strong>・<mark>mark</mark></li>
            <li><code>code</code>・<var>var</var>・<samp>samp</samp>・<kbd>kbd</kbd></li>
          </ul>
        </Box>
        <Box component="div" sx={{ mt: 2, textAlign: 'right' }}>
          <Button variant="contained" color="primary" onClick={() => setIsModalOpen(false)}>OK</Button>
        </Box>
      </Box>
    </Modal>
  </>;
};
