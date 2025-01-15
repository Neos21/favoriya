import { ChangeEvent, FC, FormEvent, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { Alert, Box, Button, Checkbox, FormControl, FormControlLabel, Grid2, InputLabel, MenuItem, Select, TextField } from '@mui/material';

import { commonTopicsConstants } from '../../../common/constants/topics-constants';
import { camelToSnakeCaseObject } from '../../../common/helpers/convert-case';
import { getRandomFromArray } from '../../../common/helpers/get-random-from-array';
import { isEmptyString } from '../../../common/helpers/is-empty-string';
import { FontParserComponent } from '../FontParserComponent/FontParserComponent';
import { PostFormAttachmentComponent } from './components/PostFormAttachmentComponent/PostFormAttachmentComponent';
import { PostFormDecorationComponent } from './components/PostFormDecorationComponent/PostFormDecorationComponent';
import { PostFormDrawingComponent } from './components/PostFormDrawingComponent/PostFormDrawingComponent';
import { PostFormHelpComponent } from './components/PostFormHelpComponent/PostFormHelpComponent';
import { PostFormInfoMessageComponent } from './components/PostFormInfoMessageComponent/PostFormInfoMessageComponent';
import { PostFormPollComponent } from './components/PostFormPollComponent/PostFormPollComponent';
import { initialFormData } from './helpers/initial-form-data';
import { validateText } from './helpers/validate-text';

import type { RootState } from '../../stores/store';
import type { PostApi } from '../../../common/types/post';
import type { RandomLimit } from '../../types/random-limit';

type Props = {
  /** 投稿時に呼ばれる関数 */
  onSubmit?: (newPostApi: PostApi, file?: File) => Promise<void>,
  /** リプライ時に使用 */
  inReplyToPostId?: string,
  /** リプライ時に使用 */
  inReplyToUserId?: string
};

type FormData = {
  topicId      : number,
  text         : string,
  visibility   : string | null,
  pollOptions  : Array<string>,
  pollExpires  : string,
  file         : File | null,
  isCreateEmoji: boolean | null,
  emojiName    : string | null
};

/** 「40秒で支度しな！」モードの秒数 */
const timeLeftSeconds: number = 40;
/** 投稿の一時保存用 LocalStorage のキー */
const postDraftLocalStorageKey: string = 'post-draft';

/** Post Form Component */
export const PostFormComponent: FC<Props> = ({ onSubmit, inReplyToPostId, inReplyToUserId }) => {
  const userState = useSelector((state: RootState) => state.user);
  
  const [formData, setFormData] = useState<FormData>(initialFormData());
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>(null);
  const [randomLimit, setRandomLimit] = useState<RandomLimit>(commonTopicsConstants.randomLimit.generateLimit());
  const [timeLeft, setTimeLeft] = useState<number>(timeLeftSeconds);  // 「40秒で支度しな！」モードの残り秒数
  const [reloadTrigger, setReloadTrigger] = useState<boolean>(false);
  
  const [cursorPosition, setCursorPosition] = useState(0);
  const textFieldRef = useRef<HTMLTextAreaElement>(null);
  
  // 初期表示時に入力内容を復元する
  useEffect(() => {
    const postDraft = localStorage.getItem(postDraftLocalStorageKey);
    if(!isEmptyString(postDraft)) setFormData(previousFormData => ({ ...previousFormData, text: postDraft.trim() }));
  }, []);
  
  // トピック ID を変更するたびにランダムリミットを更新する・カウントダウンを設定 or 解除する
  useEffect(() => {
    setRandomLimit(commonTopicsConstants.randomLimit.generateLimit());
    setTimeLeft(formData.topicId === commonTopicsConstants.balus.id ? timeLeftSeconds : null);
  }, [formData.topicId]);
  
  /** On Change */
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormData(previousFormData => ({ ...previousFormData, [event.target.name]: event.target.value }));
    // 「40秒で支度しな！」モードが選択されたら起動する
    if(event.target.name === 'topicId') setTimeLeft(Number(event.target.value) === commonTopicsConstants.balus.id ? timeLeftSeconds : null);
  };
  const onChangeChecked = (event: ChangeEvent<HTMLInputElement>) => {
    setFormData(previousFormData => ({ ...previousFormData, [event.target.name]: event.target.checked ? 'home': null }));
  };
  
  /** カーソル位置を保持する・テキストを一時保存する */
  const onSaveCursorPosition = () => {
    if(textFieldRef.current != null) setCursorPosition(textFieldRef.current.selectionStart ?? 0);
    localStorage.setItem(postDraftLocalStorageKey, formData.text);
  };
  /** On Insert */
  const onInsert = (rawStartTag: string, rawEndTag: string, replacements?: Array<string>) => {
    if(textFieldRef.current == null) return;
    const beforeText = formData.text.slice(0, cursorPosition);
    const afterText  = formData.text.slice(cursorPosition);
    const choiced  = replacements == null ? null        : getRandomFromArray(replacements);
    const startTag = replacements == null ? rawStartTag : rawStartTag.replace((/★/g), choiced);
    const endTag   = replacements == null ? rawEndTag   : rawEndTag  .replace((/★/g), choiced);
    const newCursorPosition = cursorPosition + startTag.length; // 開始タグの後ろにカーソル位置を設定する
    // 新しい値を設定する
    setFormData(previousFormData => ({ ...previousFormData, text: beforeText + startTag + endTag + afterText }));
    // カーソル位置を設定する
    setTimeout(() => {
      textFieldRef.current.focus();
      textFieldRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  };
  
  /** Ctrl + Enter or Cmd + Enter で投稿できるようにする */
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if((event.ctrlKey || event.metaKey) && event.key === 'Enter') handleSubmit(event as unknown as FormEvent<HTMLFormElement>);
  };
  /** Handle Submit */
  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setErrorMessage(null);
    
    let   text    = formData.text.trim();
    const topicId = formData.topicId;
    
    // 未入力ならバルスを入れる
    if(topicId === commonTopicsConstants.balus.id && isEmptyString(text)) {
      text = '<strong>バルス！</strong>';
    }
    
    // 入力チェックする
    const validationTextResult = validateText(text, topicId, randomLimit, formData.pollOptions);
    if(validationTextResult.error != null) return setErrorMessage(validationTextResult.error);
    // 画像を必ず添付させるモード
    if([commonTopicsConstants.imageOnly.id, commonTopicsConstants.movaPic.id].includes(topicId)) {
      if(formData.file == null) return setErrorMessage('ファイルが添付されていません。画像ファイルを添付してください');
      if(!formData.file.type.startsWith('image/') && !['.heic', 'heif'].some(extName => formData.file.name.toLowerCase().endsWith(extName))) return setErrorMessage('画像ファイルを添付してください');
    }
    
    const isCreateEmoji = formData.isCreateEmoji;
    const emojiName     = formData.emojiName;
    console.log(formData);
    if(isCreateEmoji && emojiName != null) {
      if(isEmptyString(emojiName)) return setErrorMessage('絵文字リアクション名を入力してください');
      if(!(/^[a-z0-9-]+$/).test(emojiName)) return setErrorMessage('絵文字リアクション名は英小文字・数字・ハイフンのみ利用可能です');
    }
    
    // オブジェクトを用意する
    setIsSubmitting(true);
    const newPostApi: PostApi = camelToSnakeCaseObject({ userId: userState.id, text, topicId, visibility: formData.visibility, inReplyToPostId, inReplyToUserId });
    if(topicId === commonTopicsConstants.poll.id) {
      newPostApi.has_poll = true;
      newPostApi.poll = { expires_at: formData.pollExpires };
      (newPostApi.poll as any).poll_options = formData.pollOptions.map(pollOption => ({ text: pollOption }));  // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    if(topicId === commonTopicsConstants.drawing.id) {  // 無理やりパラメータを持たせる
      (newPostApi as any).is_create_emoji = isCreateEmoji;  // eslint-disable-line @typescript-eslint/no-explicit-any
      (newPostApi as any).emoji_name      = emojiName;      // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    
    try {
      await onSubmit(newPostApi, formData.file);  // Throws
      
      // 投稿成功
      const newFormData = initialFormData();
      setFormData(newFormData);
      setRandomLimit(commonTopicsConstants.randomLimit.generateLimit());
      setTimeLeft(newFormData.topicId === commonTopicsConstants.balus.id ? timeLeftSeconds : null);
      setCursorPosition(0);
      setReloadTrigger(previousReloadTrigger => !previousReloadTrigger);
      localStorage.setItem(postDraftLocalStorageKey, '');
    }
    catch(error) {
      setErrorMessage(error.toString());  // 絵文字リアクション名の重複などを考慮して Error メッセージをそのまま出すことにする
      console.error('投稿処理に失敗', error);
    }
    finally {
      setIsSubmitting(false);
    }
  };
  
  // トピック ID が変更された時にバルスタイマーを設定する
  useEffect(() => {
    if(timeLeft == null) return;  // 何もしない
    if(timeLeft <= 0) {
      handleSubmit();  // フォームを送信する
      return;  // クリーンアップ関数を実行させる
    }
    const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    // クリーンアップ
    return () => clearTimeout(timerId);
  }, [timeLeft]);  // eslint-disable-line react-hooks/exhaustive-deps
  
  return <>
    {errorMessage != null && <Alert severity="error" sx={{ mt: 3 }}>{errorMessage}</Alert>}
    <PostFormInfoMessageComponent selectedTopicId={formData.topicId} randomLimit={randomLimit} timeLeft={timeLeft} />
    
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Grid2 container>
        <Grid2 size="grow">
          <FormControl fullWidth size="small">
            <InputLabel id="post-form-select-topic">トピック</InputLabel>
            <Select labelId="post-form-select-topic" name="topicId" label="トピック" value={formData.topicId} onChange={onChange}>
              {Object.values(commonTopicsConstants).map(topic => <MenuItem key={topic.id} value={topic.id}>{topic.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid2>
        <Grid2 size="grow" sx={{ placeSelf: 'end', textAlign: 'right' }}>
          <PostFormHelpComponent />
          <Button type="submit" variant="contained" disabled={isSubmitting}>投稿</Button>
        </Grid2>
      </Grid2>
      
      <TextField
        multiline name="text" label="投稿" value={formData.text} onChange={onChange} onKeyDown={onKeyDown}
        fullWidth rows={4} margin="normal"
        inputRef={input => { textFieldRef.current = input as HTMLTextAreaElement; }}
        onSelect={onSaveCursorPosition} onBlur={onSaveCursorPosition}
      />
      
      <Grid2 container>
        <Grid2 size="grow"><PostFormDecorationComponent onInsert={onInsert} /></Grid2>
        <Grid2 sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{formData.text.length}</Grid2>
      </Grid2>
      <FormControlLabel control={<Checkbox name="visibility" checked={formData.visibility === 'home'} onChange={onChangeChecked} />} label="グローバルタイムラインに公開しない" />
    </Box>
    
    {formData.text !== '' &&  // プレビュー
      <Box component="div" sx={{ mb: 1.5, p: 1, border: '1px solid', borderColor: 'grey.600', borderRadius: 1, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
        <FontParserComponent input={formData.text} />
      </Box>
    }
    
    {![commonTopicsConstants.anonymous.id, commonTopicsConstants.poll.id, commonTopicsConstants.drawing.id].includes(formData.topicId) && <PostFormAttachmentComponent setFormData={setFormData} setErrorMessage={setErrorMessage} reloadTrigger={reloadTrigger} />}
    {formData.topicId === commonTopicsConstants.drawing.id && <PostFormDrawingComponent setFormData={setFormData} reloadTrigger={reloadTrigger} />}
    
    {formData.topicId === commonTopicsConstants.poll.id && <PostFormPollComponent formData={formData} setFormData={setFormData} />}
  </>;
};
