import { ChangeEvent, FC } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import { Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';

import { commonPostsConstants } from '../../../../../common/constants/posts-constants';

type Props = {
  formData: { pollOptions: Array<string>, pollExpires: string },
  setFormData: (previousFormData: any) => void  // eslint-disable-line @typescript-eslint/no-explicit-any
};

/** Post Form Poll Component */
export const PostFormPollComponent: FC<Props> = ({ formData, setFormData }) => {
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormData(previousFormData => ({ ...previousFormData, [event.target.name]: event.target.value }));
  };
  const onChangePollVote = (index: number, value: string) => {
    const pollOptions = [...formData.pollOptions];
    pollOptions[index] = value;
    setFormData(previousFormData => ({ ...previousFormData, pollOptions }));
  };
  const onAddPollVote = () => {
    if(formData.pollOptions.length >= commonPostsConstants.maxPollOptions) return;
    setFormData(previousFormData => ({ ...previousFormData, pollOptions: [...previousFormData.pollOptions, ''] }));
  };
  const onRemovePollVote = (index: number) => {
    if(formData.pollOptions.length <= commonPostsConstants.minPollOptions) return;
    setFormData(previousFormData => ({ ...previousFormData, pollOptions: formData.pollOptions.filter((_, pollVoteIndex) => pollVoteIndex !== index) }));
  };
  
  return <>
    {formData.pollOptions.map((pollVote, index) =>
      <Stack key={index} direction="row" spacing={1} sx={{ mt: 1 }}>
        <TextField label={`候補 ${index + 1}`} value={pollVote} required onChange={event => onChangePollVote(index, event.target.value)} size="small" fullWidth />
        <Button variant="contained" color="error" onClick={() => onRemovePollVote(index)} disabled={[0, 1].includes(index)}>
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
      <Button variant="contained" onClick={onAddPollVote} disabled={formData.pollOptions.length >= commonPostsConstants.maxPollOptions}>追加</Button>
    </Stack>
  </>;
};
