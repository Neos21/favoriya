import type { Meta, StoryObj } from '@storybook/react';

import { AfterRepliesComponent } from './AfterRepliesComponent';

const meta = {
  title: 'AfterRepliesComponent',
  component: AfterRepliesComponent
} satisfies Meta<typeof AfterRepliesComponent>;
export default meta;

type Story = StoryObj<typeof meta>;

export const AfterReplies: Story = {
  args: {
    inReplyToPostId: '',
    inReplyToUserId: '',
    reloadTrigger: false
  }
};
