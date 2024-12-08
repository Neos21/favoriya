import type { Meta, StoryObj } from '@storybook/react';

import { PostPage } from './PostPage';

const meta = {
  title: 'PostPage',
  component: PostPage,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof PostPage>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Post: Story = {};
