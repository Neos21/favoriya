import type { Meta, StoryObj } from '@storybook/react';

import { PostFormAttachmentComponent } from './PostFormAttachmentComponent';

const meta = {
  title: 'PostFormAttachmentComponent',
  component: PostFormAttachmentComponent
} satisfies Meta<typeof PostFormAttachmentComponent>;
export default meta;

type Story = StoryObj<typeof meta>;

export const PostFormAttachment: Story = {
  args: {
    setFormData: () => {},
    setErrorMessage: () => {},
    reloadTrigger: false
  }
};
