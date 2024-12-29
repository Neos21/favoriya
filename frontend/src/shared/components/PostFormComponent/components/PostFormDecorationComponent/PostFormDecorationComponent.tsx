import { FC } from 'react';

import { Button, Stack } from '@mui/material';

type Props = {
  onInsert: (rawStartTag: string, rawEndTag: string, replacements?: Array<string>) => void
};

/** Post Form Decoration Component */
export const PostFormDecorationComponent: FC<Props> = ({ onInsert }) => {
  return <Stack direction="row" spacing={1.25} useFlexGap sx={{ mt: 1, flexWrap: 'wrap', ['& button']: { minWidth: 'auto', whiteSpace: 'nowrap' } }}>
    <Button variant="outlined" size="small" color="info"      onClick={() => onInsert('<font size="★" face="serif">', '</font>', ['1', '2', '3', '4', '5', '6', '7'])} sx={{ fontFamily: 'serif' }}>明朝</Button>
    <Button variant="outlined" size="small" color="success"   onClick={() => onInsert('<em>', '</em>')}>緑</Button>
    <Button variant="outlined" size="small" color="secondary" onClick={() => onInsert('<font size="★" color="#936"><b>', '</b></font>', ['3', '4', '5', '6'])}>紫</Button>
    <Button variant="outlined" size="small" color="error"     onClick={() => onInsert('<strong>', '</strong>')}>赤</Button>
    <Button variant="outlined" size="small" color="warning"   onClick={() => onInsert('<mark>', '</mark>')}>黄</Button>
    <Button variant="outlined" size="small" color="inherit"   onClick={() => onInsert('<marquee>', '</marquee>')} sx={{ overflow: 'hidden' }}><span style={{ animation: 'scroll-left 1.5s linear infinite' }}>流</span></Button>
    <Button variant="outlined" size="small" color="inherit"   onClick={() => onInsert('<blink>', '</blink>')}><span style={{ animation: 'blink-animation 1.5s step-start infinite' }}>光</span></Button>
    <Button variant="outlined" size="small" color="inherit"   onClick={() => onInsert('<★ align="center">', '</★>', ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div'])}>中</Button>
    <Button variant="outlined" size="small" color="inherit"   onClick={() => onInsert('<★ align="right">', '</★>' , ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div'])}>右</Button>
  </Stack>;
};
