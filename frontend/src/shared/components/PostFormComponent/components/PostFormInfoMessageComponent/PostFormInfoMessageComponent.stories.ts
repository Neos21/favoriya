import type { Meta, StoryObj } from '@storybook/react';

import { PostFormInfoMessageComponent } from './PostFormInfoMessageComponent';

const meta = {
  title: 'PostFormInfoMessageComponent',
  component: PostFormInfoMessageComponent
} satisfies Meta<typeof PostFormInfoMessageComponent>;
export default meta;

type Story = StoryObj<typeof meta>;

export const PostFormInfoMessage: Story = {
  args: {
    selectedTopicId: 0,
    randomLimit: {
      mode: 'minmax',
      min: 1,
      max: 2
    }
  }
};
