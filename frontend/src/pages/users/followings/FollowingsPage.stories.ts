import type { Meta, StoryObj } from '@storybook/react';

import { FollowingsPage } from './FollowingsPage';

const meta = {
  title: 'FollowingsPage',
  component: FollowingsPage,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof FollowingsPage>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Followings: Story = {};
