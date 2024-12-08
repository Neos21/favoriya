import type { Meta, StoryObj } from '@storybook/react';

import { PostsListComponent } from './PostsListComponent';

const meta = {
  title: 'PostsListComponent',
  component: PostsListComponent
} satisfies Meta<typeof PostsListComponent>;
export default meta;

type Story = StoryObj<typeof meta>;

export const PostsList: Story = {
  args: {
    posts: null
  }
};
