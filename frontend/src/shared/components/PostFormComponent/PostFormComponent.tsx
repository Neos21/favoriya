import DOMPurify from 'dompurify';
import { ChangeEvent, FC, FormEvent, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { Alert, Box, Button, Checkbox, FormControl, FormControlLabel, Grid2, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';

import { topicsConstants } from '../../../common/constants/topics-constants';
import { camelToSnakeCaseObject } from '../../../common/helpers/convert-case';
import { getRandomFromArray } from '../../../common/helpers/get-random-from-array';
import { getRandomIntInclusive } from '../../../common/helpers/get-random-int-inclusive';
import { isValidText } from '../../../common/helpers/validators/validator-post';
import { Result } from '../../../common/types/result';
import { FontParserComponent } from '../FontParserComponent/FontParserComponent';
import { PostFormHelpComponent } from './components/PostFormHelpComponent/PostFormHelpComponent';
import { PostFormInfoMessageComponent } from './components/PostFormInfoMessageComponent/PostFormInfoMessageComponent';

import type { RootState } from '../../stores/store';
import type { PostApi } from '../../../common/types/post';
import type { RandomLimit } from '../../types/random-limit';

type Props = {
  /** 投稿時に呼ばれる関数 */
  onSubmit?: (newPostApi: PostApi) => Promise<void>,
  /** リプライ時に使用 */
  inReplyToPostId?: string,
  /** リプライ時に使用 */
  inReplyToUserId?: string
};

type FormData = {
  topicId   : number,
  text      : string,
  visibility: string | null
};

// トピックをランダムに選択する
const choiceTopicId = () => {
  const random = getRandomIntInclusive(0, 1);  // 通常モードの割合を増やす
  if(random === 0) {
    const topics = Object.values(topicsConstants);
    return getRandomFromArray(topics).id;
  }
  else {
    return topicsConstants.normal.id;
  }
};

/** Post Form Component */
export const PostFormComponent: FC<Props> = ({ onSubmit, inReplyToPostId, inReplyToUserId }) => {
  const userState = useSelector((state: RootState) => state.user);
  
  const [formData, setFormData] = useState<FormData>({
    topicId   : choiceTopicId(),
    text      : '',
    visibility: null
  });
  const [randomLimit, setRandomLimit] = useState<RandomLimit>(topicsConstants.randomLimit.generateLimit());
  
  const [cursorPosition, setCursorPosition] = useState(0);
  const textFieldRef = useRef<HTMLTextAreaElement>(null);
  const [errorMessage, setErrorMessage] = useState<string>(null);
  
  // トピック ID を変更するたびにランダムリミットを更新する
  useEffect(() => {
    setRandomLimit(topicsConstants.randomLimit.generateLimit());
  }, [formData.topicId]);
  
  /** On Change */
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(previousFormData => ({ ...previousFormData, [name]: value }));
  };
  const onChangeChecked = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setFormData(previousFormData => ({ ...previousFormData, [name]: checked ? 'home': null }));
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
    
    const choiced  = replacements == null ? null        : getRandomFromArray(replacements);
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
    if((event.ctrlKey || event.metaKey) && event.key === 'Enter') handleSubmit(event as unknown as FormEvent<HTMLFormElement>);
  };
  /** Handle Submit */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    
    const userId     = userState.id;
    const text       = formData.text.trim();
    const topicId    = formData.topicId;
    const visibility = formData.visibility;
    
    // 基本的な入力チェック
    const validationText = isValidText(text);
    if(validationText.error != null) return setErrorMessage(validationText.error);
    // トピックごとの入力チェック
    const textContent = DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    const topic = Object.values(topicsConstants).find(topic => topic.id === topicId);
    if(topic == null) return setErrorMessage('不正なトピックです');
    if([topicsConstants.englishOnly.id, topicsConstants.kanjiOnly.id, topicsConstants.senryu.id].includes(topic.id)) {
      const validationResult = (topic as unknown as { validateFunction: (textContent: string) => Result<boolean> }).validateFunction(textContent);
      if(validationResult.error != null) return setErrorMessage(validationResult.error);
    }
    else if(topic.id === topicsConstants.randomLimit.id) {
      const validationResult = (topic as unknown as { validateFunction: (textContent: string, mode: string, min: number, max: number) => Result<boolean> }).validateFunction(textContent, randomLimit.mode, randomLimit.min, randomLimit.max);
      if(validationResult.error != null) return setErrorMessage(validationResult.error);
    }
    
    try {
      const newPostApi: PostApi = camelToSnakeCaseObject({ userId, text, topicId, visibility, inReplyToPostId, inReplyToUserId });
      await onSubmit(newPostApi);  // Throws
      
      // 投稿成功
      setFormData(previousFormData => ({
        topicId   : choiceTopicId(),
        text      : '',
        visibility: previousFormData.visibility
      }));
      setRandomLimit(topicsConstants.randomLimit.generateLimit());
      setCursorPosition(0);
    }
    catch(error) {
      setErrorMessage('投稿処理に失敗しました。もう一度やり直してください');
      console.error('投稿処理に失敗', error);
    }
  };
  
  return <>
    {errorMessage != null && <Alert severity="error" sx={{ mt: 3 }}>{errorMessage}</Alert>}
    <PostFormInfoMessageComponent selectedTopicId={formData.topicId} randomLimit={randomLimit} />
    
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Grid2 container>
        <Grid2 size="grow">
          <FormControl fullWidth size="small">
            <InputLabel id="post-form-select-topic">トピック</InputLabel>
            <Select labelId="post-form-select-topic" name="topicId" label="トピック" value={formData.topicId} onChange={onChange}>
              {Object.values(topicsConstants).map(topic => <MenuItem key={topic.id} value={topic.id}>{topic.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid2>
        <Grid2 size="grow" sx={{ placeSelf: 'end', textAlign: 'right' }}>
          <PostFormHelpComponent />
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
      
      <Grid2 container>
        <Grid2 size="grow">
          <Stack direction="row" spacing={1.25} useFlexGap sx={{ mt: 1, flexWrap: 'wrap', ['& button']: { minWidth: 'auto', whiteSpace: 'nowrap' } }}>
            <Button variant="outlined" size="small" color="info"    onClick={() => onInsert('<font size="★" face="serif">', '</font>', ['1', '2', '3', '4', '5', '6', '7'])} sx={{ fontFamily: 'serif' }}>明朝</Button>
            <Button variant="outlined" size="small" color="success" onClick={() => onInsert('<em>', '</em>')}>緑</Button>
            <Button variant="outlined" size="small" color="error"   onClick={() => onInsert('<strong>', '</strong>')}>赤</Button>
            <Button variant="outlined" size="small" color="warning" onClick={() => onInsert('<mark>', '</mark>')}>黄</Button>
            <Button variant="outlined" size="small" color="inherit" onClick={() => onInsert('<marquee>', '</marquee>')} sx={{ overflow: 'hidden' }}><span style={{ animation: 'scroll-left 1.5s linear infinite' }}>流</span></Button>
            <Button variant="outlined" size="small" color="inherit" onClick={() => onInsert('<blink>', '</blink>')}><span style={{ animation: 'blink-animation 1.5s step-start infinite' }}>光</span></Button>
            <Button variant="outlined" size="small" color="inherit" onClick={() => onInsert('<★ align="center">', '</★>', ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div'])}>中</Button>
            <Button variant="outlined" size="small" color="inherit" onClick={() => onInsert('<★ align="right">', '</★>' , ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div'])}>右</Button>
          </Stack>
        </Grid2>
        <Grid2 sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{formData.text.length}</Grid2>
      </Grid2>
      <FormControlLabel control={<Checkbox name="visibility" checked={formData.visibility === 'home'} onChange={onChangeChecked} />} label="グローバルタイムラインに公開しない" />
    </Box>
    
    {formData.text !== '' &&  // プレビュー
      <Box component="div" sx={{ mt: 2, p: 1, border: '1px solid', borderColor: 'grey.600', borderRadius: 1, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
        <FontParserComponent input={formData.text} />
      </Box>
    }
  </>;
};
