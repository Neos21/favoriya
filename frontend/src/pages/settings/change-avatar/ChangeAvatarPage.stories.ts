import type { Meta, StoryObj } from '@storybook/react';

import { ChangeAvatarPage } from './ChangeAvatarPage';

const meta = {
  title: 'ChangeAvatarPage',
  component: ChangeAvatarPage,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof ChangeAvatarPage>;
export default meta;

type Story = StoryObj<typeof meta>;

export const ChangeAvatar: Story = {};
