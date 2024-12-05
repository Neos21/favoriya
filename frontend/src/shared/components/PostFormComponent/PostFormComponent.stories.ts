import type { Meta, StoryObj } from '@storybook/react';

import { PostFormComponent } from './PostFormComponent';

const meta = {
  title: 'PostFormComponent',
  component: PostFormComponent
} satisfies Meta<typeof PostFormComponent>;
export default meta;

type Story = StoryObj<typeof meta>;

export const PostForm: Story = {};
