import { FC, useState } from 'react';

import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import { Box, Button, IconButton, Modal, Tooltip, Typography } from '@mui/material';

import { modalStyleConstants } from '../../../../constants/modal-style-constants';

/** Post Form Help Component */
export const PostFormHelpComponent: FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  return <>
    <Tooltip title="ヘルプ">
      <IconButton sx={{ mr: 3 }} onClick={() => setIsModalOpen(true)}><HelpOutlineOutlinedIcon /></IconButton>
    </Tooltip>
    
    <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
      <Box component="div" sx={modalStyleConstants}>
        <Typography component="h2">投稿で使える機能</Typography>
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
            <li>marquee : direction・behavior・scrollamount</li>
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
