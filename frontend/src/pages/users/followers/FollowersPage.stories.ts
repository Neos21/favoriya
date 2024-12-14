import type { Meta, StoryObj } from '@storybook/react';

import { FollowersPage } from './FollowersPage';

const meta = {
  title: 'FollowersPage',
  component: FollowersPage,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof FollowersPage>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Followers: Story = {};
