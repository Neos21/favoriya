import type { Meta, StoryObj } from '@storybook/react';

import { PostFormDecorationComponent } from './PostFormDecorationComponent';

const meta = {
  title: 'PostFormDecorationComponent',
  component: PostFormDecorationComponent
} satisfies Meta<typeof PostFormDecorationComponent>;
export default meta;

type Story = StoryObj<typeof meta>;

export const PostFormDecoration: Story = {
  args: {
    onInsert: () => {}
  }
};
