import { ChangeEvent, FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { Button, FormControlLabel, Grid2, LinearProgress, Radio, RadioGroup, Stack, Typography } from '@mui/material';

import { snakeToCamelCaseObject } from '../../../../../common/helpers/convert-case';
import { useApiGet, useApiPost } from '../../../../hooks/use-api-fetch';
import { epochTimeMsToJstString } from '../../../../services/convert-date-to-jst';
import { LoadingSpinnerComponent } from '../../../LoadingSpinnerComponent/LoadingSpinnerComponent';

import type { RootState } from '../../../../stores/store';
import type { Post } from '../../../../../common/types/post';
import type { Poll, PollApi } from '../../../../../common/types/poll';
import type { Result } from '../../../../../common/types/result';

type Props = {
  propPost: Post
};

/** Poll Component */
export const PollComponent: FC<Props> = ({ propPost }) => {
  const userState = useSelector((state: RootState) => state.user);
  const apiGet = useApiGet();
  const apiPost = useApiPost();
  
  const [poll, setPoll] = useState<Poll>(null);
  const [isResultMode, setIsResultMode] = useState<boolean>(false);
  const [selectedPollOptionId, setSelectedPollOptionId] = useState<number>(null);
  
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedPollOptionId(Number(event.target.value));
  };
  
  useEffect(() => {
    if(propPost.userId === userState.id) setIsResultMode(true);  // 投稿者本人は最初から結果表示モードにする
    (async () => {
      try {
        const response = await apiGet(`/users/${propPost.userId}/posts/${propPost.id}/polls`);  // Throws
        const pollApiResult: Result<PollApi> = await response.json();  // Throws
        const poll = snakeToCamelCaseObject(pollApiResult.result) as Poll;
        
        // 投票済み・投票期限切れなら結果表示モードにする
        if(poll.pollVotes.some(pollVote => pollVote.userId === userState.id) || new Date(Number(poll.expiresAt)) < new Date()) setIsResultMode(true);
        
        setPoll(poll);
      }
      catch(error) {
        console.error('アンケートの取得に失敗', error);
      }
    })();
  }, [apiGet, propPost.id, propPost.userId, userState.id]);
  
  /** 投票する */
  const onVote = async () => {
    try {
      await apiPost(`/users/${propPost.userId}/posts/${propPost.id}/polls/${poll.id}/votes`, {
        poll_option_id: selectedPollOptionId,
        user_id       : userState.id
      });  // Throws
      // 投票したユーザの情報を追加する
      setPoll(previousPoll => ({
        ...previousPoll,
        pollVotes: [...previousPoll.pollVotes, {
          id          : previousPoll.pollVotes.length + 1,
          pollId      : previousPoll.id,
          pollOptionId: selectedPollOptionId,
          userId      : userState.id
        }]
      }));
      setIsResultMode(true);  // 結果表示モードにする
    }
    catch(error) {
      console.error('投票処理中にエラーが発生', error);
    }
  };
  
  const convertToResult = () => poll.pollOptions.map(pollOption => {
    pollOption.pollVotes = poll.pollVotes.filter(pollVote => pollVote.pollOptionId === pollOption.id);
    (pollOption as any).percentage = Math.floor(pollOption.pollVotes.length / poll.pollVotes.length * 100);  // eslint-disable-line @typescript-eslint/no-explicit-any
    if(Number.isNaN((pollOption as any).percentage)) (pollOption as any).percentage = 0;  // eslint-disable-line @typescript-eslint/no-explicit-any
    return pollOption;
  });
  
  const displayExpiresAt = (rawExpiresAt: string) => {
    const now = new Date();
    const expiresAt = new Date(Number(rawExpiresAt));
    if(expiresAt < now) return `(${epochTimeMsToJstString(poll.expiresAt as string, 'YYYY-MM-DD HH:mm')} 終了)`;
    
    const restMs  = expiresAt.getTime() - now.getTime();
    const hours   = Math.floor(restMs / 1000 / 60 / 60) % 24;
    const minutes = Math.floor(restMs / 1000 / 60) % 60;
    const seconds = Math.floor(restMs / 1000) % 60;
    if(hours   > 0) return `残り ${hours} 時間`;
    if(minutes > 0) return `残り ${minutes} 分`;
    if(seconds > 0) return `残り ${seconds} 秒`;
  };
  
  if(poll == null) return <LoadingSpinnerComponent />;
  
  if(poll != null && !isResultMode) return <>
    <RadioGroup name="pollOptions" value={selectedPollOptionId} onChange={onChange}>
      {poll.pollOptions.map(pollOption => <FormControlLabel key={pollOption.id} control={<Radio />} value={pollOption.id} label={pollOption.text} />)}
    </RadioGroup>
    <Stack direction="row" spacing={2} sx={{ mt: 1, color: 'grey.600', fontSize: '.86rem', placeItems: 'center' }}>
      <Button variant="outlined" color="inherit" onClick={onVote}>投票</Button>
      <Typography component="span" sx={{ fontSize: 'inherit' }}>{poll.pollVotes.length} 票</Typography>
      <Typography component="span" sx={{ fontSize: 'inherit' }}>{displayExpiresAt(poll.expiresAt as string)}</Typography>
    </Stack>
  </>;
  
  if(poll != null && isResultMode) return <>
    {convertToResult().map((result: any) =>  // eslint-disable-line @typescript-eslint/no-explicit-any
      <Grid2 key={result.id} container spacing={1} sx={{ mt: 1.25, '& [aria-valuenow]': { backgroundColor: 'transparent' }, '& [aria-valuenow="0"] span': { width: '5px', transform: 'none !important' } }}>
        <Grid2 sx={{ width: '3.5em', textAlign: 'right' }}>{result.percentage}%</Grid2>
        <Grid2 size="grow">{result.text}</Grid2>
        <Grid2 size={12}><LinearProgress variant="determinate" key={result.id} value={result.percentage} /></Grid2>
      </Grid2>
    )}
    <Stack direction="row" spacing={2} sx={{ mt: 1, color: 'grey.600', fontSize: '.86rem', placeItems: 'center' }}>
      <Typography component="span" sx={{ fontSize: 'inherit' }}>{poll.pollVotes.length} 票</Typography>
      <Typography component="span" sx={{ fontSize: 'inherit' }}>{displayExpiresAt(poll.expiresAt as string)}</Typography>
    </Stack>
  </>;
};
