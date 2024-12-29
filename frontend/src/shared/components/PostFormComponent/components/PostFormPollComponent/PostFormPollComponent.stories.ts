import type { Meta, StoryObj } from '@storybook/react';

import { PostFormPollComponent } from './PostFormPollComponent';

const meta = {
  title: 'PostFormPollComponent',
  component: PostFormPollComponent
} satisfies Meta<typeof PostFormPollComponent>;
export default meta;

type Story = StoryObj<typeof meta>;

export const PostFormPoll: Story = {
  args: {
    formData: { pollOptions: [], pollExpires: '' },
    setFormData: () => {}
  }
};
