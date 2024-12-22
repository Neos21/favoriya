import type { Meta, StoryObj } from '@storybook/react';

import { ReplyFormComponent } from './ReplyFormComponent';

const meta = {
  title: 'ReplyFormComponent',
  component: ReplyFormComponent
} satisfies Meta<typeof ReplyFormComponent>;
export default meta;

type Story = StoryObj<typeof meta>;

export const ReplyForm: Story = {
  args: {
    inReplyToPostId: '',
    inReplyToUserId: '',
    onAfterReply: () => {}
  }
};
