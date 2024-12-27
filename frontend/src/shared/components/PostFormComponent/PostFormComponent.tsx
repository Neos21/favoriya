import DOMPurify from 'dompurify';
import { ChangeEvent, FC, FormEvent, Fragment, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import CloseIcon from '@mui/icons-material/Close';
import { Alert, Box, Button, Checkbox, FormControl, FormControlLabel, Grid2, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';

import { topicsConstants } from '../../../common/constants/topics-constants';
import { camelToSnakeCaseObject } from '../../../common/helpers/convert-case';
import { getRandomFromArray } from '../../../common/helpers/get-random-from-array';
import { getRandomIntInclusive } from '../../../common/helpers/get-random-int-inclusive';
import { isValidText } from '../../../common/helpers/validators/validator-post';
import { FontParserComponent } from '../FontParserComponent/FontParserComponent';
import { PostFormHelpComponent } from './components/PostFormHelpComponent/PostFormHelpComponent';
import { PostFormInfoMessageComponent } from './components/PostFormInfoMessageComponent/PostFormInfoMessageComponent';

import type { Result } from '../../../common/types/result';
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
  topicId    : number,
  text       : string,
  visibility : string | null,
  pollOptions  : Array<string>,
  pollExpires: string
};

// トピックをランダムに選択する
const choiceTopicId = () => {
  const random = getRandomIntInclusive(0, 1);  // 通常モードの割合を増やす
  if(random === 0) {
    const topicIds = [topicsConstants.englishOnly.id, topicsConstants.kanjiOnly.id, topicsConstants.senryu.id, topicsConstants.randomDecorations.id, topicsConstants.randomLimit.id];
    return getRandomFromArray(topicIds);
  }
  else {
    return topicsConstants.normal.id;
  }
};

/** Post Form Component */
export const PostFormComponent: FC<Props> = ({ onSubmit, inReplyToPostId, inReplyToUserId }) => {
  const userState = useSelector((state: RootState) => state.user);
  
  const [formData, setFormData] = useState<FormData>({
    topicId    : choiceTopicId(),
    text       : '',
    visibility : null,
    pollOptions: ['', ''],    // 2つは入れておく
    pollExpires: '5 minutes'  // デフォルト値
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
  const handleFormChange = (name: string, value: string | number) => {
    setFormData(previousFormData => ({ ...previousFormData, [name]: value }));
  };
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    handleFormChange(name, value);
  };
  const onChangeChecked = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setFormData(previousFormData => ({ ...previousFormData, [name]: checked ? 'home': null }));
  };
  const onChangePollVote = (index: number, value: string) => {
    const pollOptions = [...formData.pollOptions];
    pollOptions[index] = value;
    setFormData(previousFormData => ({ ...previousFormData, pollOptions }));
  };
  const onAddPollVote = () => {
    if(formData.pollOptions.length >= 6) return;
    setFormData(previousFormData => ({ ...previousFormData, pollOptions: [...previousFormData.pollOptions, ''] }));
  };
  const onRemovePollVote = (index: number) => {
    if(formData.pollOptions.length <= 2) return;
    const pollOptions = formData.pollOptions.filter((_, pollVoteIndex) => pollVoteIndex !== index);
    setFormData(previousFormData => ({ ...previousFormData, pollOptions }));
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
    if([topicsConstants.englishOnly.id, topicsConstants.kanjiOnly.id, topicsConstants.senryu.id].includes(topicId)) {
      const validationResult = (topic as unknown as { validateFunction: (textContent: string) => Result<boolean> }).validateFunction(textContent);
      if(validationResult.error != null) return setErrorMessage(validationResult.error);
    }
    else if(topicId === topicsConstants.randomLimit.id) {
      const validationResult = (topic as unknown as { validateFunction: (textContent: string, mode: string, min: number, max: number) => Result<boolean> }).validateFunction(textContent, randomLimit.mode, randomLimit.min, randomLimit.max);
      if(validationResult.error != null) return setErrorMessage(validationResult.error);
    }
    else if(topicId === topicsConstants.poll.id) {
      const validationResult = (topic as unknown as { validateFunction: (texts: Array<string>) => Result<boolean> }).validateFunction(formData.pollOptions);
      if(validationResult.error != null) return setErrorMessage(validationResult.error);
    }
    
    try {
      const newPostApi: PostApi = camelToSnakeCaseObject({ userId, text, topicId, visibility, inReplyToPostId, inReplyToUserId });
      if(topicId === topicsConstants.poll.id) {
        newPostApi.has_poll = true;
        newPostApi.poll = { expires_at: formData.pollExpires };
        (newPostApi.poll as any).poll_options = formData.pollOptions.map(pollOption => ({ text: pollOption }));
      }
      await onSubmit(newPostApi);  // Throws
      
      // 投稿成功
      setFormData(previousFormData => ({
        topicId    : choiceTopicId(),
        text       : '',
        visibility : previousFormData.visibility,
        pollOptions: ['', ''],
        pollExpires: '5 minutes'
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
    
    {formData.topicId === topicsConstants.poll.id && <>
      {formData.pollOptions.map((pollVote, index) =>
        <Stack key={index} direction="row" spacing={1} sx={{ mt: 1 }}>
          <TextField label={`候補 ${index + 1}`} value={pollVote} required onChange={event => onChangePollVote(index, event.target.value)} size="small" fullWidth />
          <Button variant="contained" color="error" onClick={() => onRemovePollVote(index)} disabled={index === 0 || index === 1}>
            <CloseIcon />
          </Button>
        </Stack>
      )}
      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="post-form-select-poll-expires">期限</InputLabel>
          <Select labelId="post-form-select-poll-expires" name="pollExpires" label="期限" value={formData.pollExpires} onChange={onChange}>
            <MenuItem value="5 minutes" >5 分</MenuItem>
            <MenuItem value="30 minutes">30 分</MenuItem>
            <MenuItem value="1 hour"    >1 時間</MenuItem>
            <MenuItem value="6 hours"   >6 時間</MenuItem>
            <MenuItem value="12 hours"  >12 時間</MenuItem>
            <MenuItem value="1 day"     >1 日</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={onAddPollVote} disabled={formData.pollOptions.length >= 6}>追加</Button>
      </Stack>
    </>}
  </>;
};
