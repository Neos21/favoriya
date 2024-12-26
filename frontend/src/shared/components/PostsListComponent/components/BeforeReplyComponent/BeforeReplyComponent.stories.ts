import type { Meta, StoryObj } from '@storybook/react';

import { BeforeReplyComponent } from './BeforeReplyComponent';

const meta = {
  title: 'BeforeReplyComponent',
  component: BeforeReplyComponent
} satisfies Meta<typeof BeforeReplyComponent>;
export default meta;

type Story = StoryObj<typeof meta>;

export const BeforeReply: Story = {
  args: {
    inReplyToPostId: '',
    inReplyToUserId: ''
  }
};
