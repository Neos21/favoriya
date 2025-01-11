import type { Meta, StoryObj } from '@storybook/react';

import { PostFormDrawingComponent } from './PostFormDrawingComponent';

const meta = {
  title: 'PostFormDrawingComponent',
  component: PostFormDrawingComponent
} satisfies Meta<typeof PostFormDrawingComponent>;
export default meta;

type Story = StoryObj<typeof meta>;

export const PostFormDrawing: Story = {
  args: {
    setFormData: () => {},
    reloadTrigger: false
  }
};
