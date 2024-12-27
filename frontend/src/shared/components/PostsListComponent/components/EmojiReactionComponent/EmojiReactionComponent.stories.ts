import type { Meta, StoryObj } from '@storybook/react';

import { EmojiReactionComponent } from './EmojiReactionComponent';

const meta = {
  title: 'EmojiReactionComponent',
  component: EmojiReactionComponent
} satisfies Meta<typeof EmojiReactionComponent>;
export default meta;

type Story = StoryObj<typeof meta>;

export const EmojiReaction: Story = {
  args: {
    propPost: null
  }
};
